import { describe, expect, it } from "vitest";
import { isEventAvailability, isEventLanding } from "../event-runtime";

describe("event payload boundaries", () => {
  it("rejects malformed landing collections and dates", () => {
    expect(isEventLanding({ availability_state: "booking_open", packages: {}, gallery: [] })).toBe(false);
    expect(isEventLanding({ availability_state: "booking_open", packages: [], gallery: [], event_starts_at: "bad" })).toBe(false);
  });
  it("rejects invalid availability capacity and package collections", () => {
    expect(isEventAvailability({ availability_state: "booking_open", sales_enabled: true, remaining_guest_capacity: -1, packages: [] })).toBe(false);
    expect(isEventAvailability({ availability_state: "booking_open", sales_enabled: true, remaining_guest_capacity: 2, packages: {} })).toBe(false);
  });
});
