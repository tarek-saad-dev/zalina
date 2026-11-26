import { describe, expect, it } from "vitest";
import { eventCanPurchase, eventDeadlinePassed, shouldPollEventBooking, canPayEventBooking } from "../event-view";
import type { EventBooking } from "../events";

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

describe("event payment and fulfillment", () => {
  const booking: EventBooking = { booking_reference: "R", booking_code: "B", product_type: "event", status: "pending_payment", operational_status: null, total: "10.00", currency: "EGP", guests: 2, hold_expires_at: "2099-01-01T00:00:00Z", payment_expires_at: null, valid_from: null, valid_to: null, requires_payment: true };
  it("never pays for zero, confirmed, stale or expired bookings", () => {
    expect(canPayEventBooking(booking, true)).toBe(true);
    expect(canPayEventBooking(booking, false)).toBe(false);
    expect(canPayEventBooking({ ...booking, total: "0.00" }, true)).toBe(false);
    expect(canPayEventBooking({ ...booking, status: "confirmed" }, true)).toBe(false);
    expect(canPayEventBooking({ ...booking, hold_expires_at: "2020-01-01T00:00:00Z" }, true)).toBe(false);
  });
  it("polls paid and pending fulfillment, but not terminal failures", () => {
    expect(shouldPollEventBooking({ ...booking, status: "paid" })).toBe(true);
    expect(shouldPollEventBooking({ ...booking, status: "paid", ticket_fulfillment_status: "completed" })).toBe(false);
    expect(shouldPollEventBooking({ ...booking, status: "paid", ticket_fulfillment_status: "failed" })).toBe(false);
    expect(shouldPollEventBooking({ ...booking, status: "confirmed", ticket_fulfillment_status: "processing" })).toBe(true);
    expect(shouldPollEventBooking({ ...booking, status: "confirmed", ticket_fulfillment_status: "failed" })).toBe(false);
    expect(shouldPollEventBooking({ ...booking, status: "confirmed", ticket_fulfillment_status: "completed" })).toBe(false);
    expect(shouldPollEventBooking({ ...booking, status: "expired", ticket_fulfillment_status: "pending" })).toBe(false);
  });
});
