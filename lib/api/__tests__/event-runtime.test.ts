import { describe, expect, it } from "vitest";
import { isEventAvailability, isEventLanding, isEventBooking } from "../event-runtime";

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

describe("event recovery payload", () => {
  const base = { product_type: "event", booking_reference: "BK-1", booking_code: "CODE", status: "confirmed", total: "0.00", currency: "EGP", guests: 2, hold_expires_at: null, payment_expires_at: null };
  it("accepts well-formed bookings but rejects missing codes and invalid tickets", () => {
    expect(isEventBooking(base)).toBe(true);
    expect(isEventBooking({ ...base, booking_code: "" })).toBe(false);
    expect(isEventBooking({ ...base, tickets: [{ status: "valid" }] })).toBe(false);
    expect(isEventBooking({ ...base, hold_expires_at: "bad" })).toBe(false);
  });
  it("recognizes feature-disabled availability without enabling sales", () => {
    expect(isEventAvailability({ availability_state: "feature_disabled", sales_enabled: false, remaining_guest_capacity: 0, packages: [] })).toBe(true);
  });
});
