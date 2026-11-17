import { describe, expect, it } from "vitest";
import { demoAvailability, demoEvents } from "./fixtures";
import {
  bookingHoldDeadline,
  buildEventBookingPayload,
  estimateEventTotal,
  eventGuestIsValid,
  findEventSelection,
  formatHoldRemaining,
  isBookingHoldExpired,
  positiveInt,
  securePaymentLink,
  validateEventGuest,
} from "./checkout";

const event = demoEvents[0];
const availability = demoAvailability(event.slug, 9101)!;
const guest = { name: "Guest Name", email: "guest@example.com", phone: "+20 1012345678" };

describe("Standalone Event Booking V2 frontend", () => {
  it("accepts only valid event-owned occurrence, package and quantity", () => {
    expect(findEventSelection(event, 9101, 9201, 2, availability).ok).toBe(true);
    expect(findEventSelection(event, 123, 9201, 2, availability).ok).toBe(false);
    expect(findEventSelection(event, 9101, 99999, 1, availability).ok).toBe(false);
    expect(findEventSelection(event, 9101, 9201, 0, availability).ok).toBe(false);
    expect(findEventSelection(event, 9101, 9201, 99, availability).ok).toBe(false);
    expect(findEventSelection(event, 9102, 9201, 1).ok).toBe(false);
    expect(positiveInt("1e2")).toBeNull();
    expect(positiveInt("-1")).toBeNull();
  });

  it("never sells an occurrence's package from another availability response", () => {
    const wrong = { ...availability, occurrence_id: 9102 };
    expect(findEventSelection(event, 9101, 9201, 1, wrong).ok).toBe(false);
  });

  it("blocks sold-out and insufficient inventory", () => {
    const shortStock = {
      ...availability,
      packages: availability.packages.map(p => p.package_id === 9201
        ? { ...p, remaining_units: 1 } : p),
    };
    expect(findEventSelection(event, 9101, 9201, 2, shortStock).ok).toBe(false);
    const sold = demoAvailability(event.slug, 9102);
    expect(sold?.packages.every(p => p.available === false)).toBe(true);
  });

  it("validates guest contact before creating a booking", () => {
    expect(eventGuestIsValid(guest)).toBe(true);
    expect(eventGuestIsValid({ ...guest, email: "not-an-email" })).toBe(false);
    expect(eventGuestIsValid({ ...guest, name: "" })).toBe(false);
    expect(validateEventGuest({ ...guest, phone: "abc" }).phone).toBe("phone");
  });

  it("creates only V2 event identifiers and guest data, NEVER client pricing", () => {
    const selected = findEventSelection(event, 9101, 9202, 2, availability);
    if (!selected.ok) throw Error("Expected fixture selection");
    const payload = buildEventBookingPayload(selected.selection, guest);
    expect(payload).toEqual({
      product_type: "event",
      event_occurrence_id: 9101,
      items: [{ event_package_id: 9202, quantity: 2 }],
      guests: 4,
      guest_name: "Guest Name",
      guest_email: "guest@example.com",
      guest_phone: "+20 1012345678",
    });
    expect("total" in payload).toBe(false);
    expect("price" in payload).toBe(false);
    expect("payment_url" in payload).toBe(false);
    expect("accommodation_id" in payload).toBe(false);
  });

  it("estimates decimal amounts in cents, and never trusts missing stock", () => {
    const selected = findEventSelection(event, 9101, 9202, 2, availability);
    if (!selected.ok) throw Error("Expected fixture selection");
    expect(estimateEventTotal(availability, selected.selection)).toBe("4400.00");
    expect(estimateEventTotal(null, selected.selection)).toBeNull();
    expect(estimateEventTotal({ ...availability, occurrence_id: 9102 }, selected.selection)).toBeNull();
    expect(estimateEventTotal({
      ...availability,
      packages: availability.packages.map(p => p.package_id === 9202
        ? { ...p, available: false } : p),
    }, selected.selection)).toBeNull();
  });

  it("uses earliest payment/hold expiry and handles countdown accurately", () => {
    const booking = {
      hold_expires_at: "2026-12-01T10:15:00+02:00",
      payment_expires_at: "2026-12-01T10:10:00+02:00",
    };
    const deadline = Date.parse("2026-12-01T10:10:00+02:00");
    expect(bookingHoldDeadline(booking)).toBe(deadline);
    expect(formatHoldRemaining(deadline, deadline - 65_000)).toBe("01:05");
    expect(isBookingHoldExpired(booking, deadline - 1000)).toBe(false);
    expect(isBookingHoldExpired(booking, deadline)).toBe(true);
    expect(bookingHoldDeadline({ hold_expires_at: null, payment_expires_at: null })).toBeNull();
  });

  it("accepts only secure provider redirects in production-safe code", () => {
    expect(securePaymentLink("https://accept.paymob.com/example")?.startsWith("https://")).toBe(true);
    expect(securePaymentLink("javascript:alert(1)")).toBeNull();
    expect(securePaymentLink("data:text/html,hello")).toBeNull();
    expect(securePaymentLink("//example.com")).toBeNull();
    expect(securePaymentLink("http://example.com/pay")).toBeNull();
  });
});
