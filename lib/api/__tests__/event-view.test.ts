import { describe, expect, it } from "vitest";
import { eventCanPurchase, eventDeadlinePassed } from "../event-view";

describe("event purchase safety", () => {
  it("requires the server's open state and purchase flag", () => {
    expect(eventCanPurchase({ availability_state: "booking_open", purchase_enabled: true })).toBe(true);
    expect(eventCanPurchase({ availability_state: "sold_out", purchase_enabled: true })).toBe(false);
    expect(eventCanPurchase({ availability_state: "booking_open", purchase_enabled: false })).toBe(false);
  });
  it("uses the earliest hold or payment deadline", () => {
    expect(eventDeadlinePassed("2020-01-01T00:00:00Z", "2099-01-01T00:00:00Z")).toBe(true);
    expect(eventDeadlinePassed(null, "2099-01-01T00:00:00Z")).toBe(false);
  });
});
