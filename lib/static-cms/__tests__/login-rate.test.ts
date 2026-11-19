import { describe, expect, it } from "vitest";
import { createLoginAttemptLimiter } from "../login-rate";

describe("CMS login attempt reservation", () => {
  it("reserves slots before async work and rejects 13th concurrent request", async () => {
    const gate = createLoginAttemptLimiter(12, 600_000);
    const attempts = Array.from({length: 30}, async () => {
      const reserved = gate.reserve(1000);
      // Simulate body reads and password verification starting after all calls.
      await Promise.resolve();
      return reserved;
    });
    const accepted = await Promise.all(attempts);
    expect(accepted.filter(Boolean)).toHaveLength(12);
    expect(accepted.slice(12)).toEqual(Array(18).fill(false));
  });
  it("opens a new window after the prior interval expires", () => {
    const gate = createLoginAttemptLimiter(2, 100);
    expect(gate.reserve(5)).toBe(true);
    expect(gate.reserve(5)).toBe(true);
    expect(gate.reserve(50)).toBe(false);
    expect(gate.reserve(105)).toBe(true);
  });
  it("does not reset its counter after a verified login", () => {
    const gate = createLoginAttemptLimiter(2, 100);
    expect(gate.reserve(1)).toBe(true);
    expect(gate.reserve(2)).toBe(true);
    expect(gate.reserve(3)).toBe(false);
  });
});
