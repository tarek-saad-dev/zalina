import { describe, expect, it } from "vitest";
import { normalizeBooking, normalizeTicketLookup, type RawApiBooking, type RawTicketLookup } from "@/lib/api/adapters";
import { PAYMENT_HANDOFF_SCHEMA_VERSION } from "@/components/book-now/checkoutTypes";
import { parsePendingPaymentHandoff } from "@/components/book-now/paymentHandoffStorage";
import { canShowBookingQr, classifyBooking } from "@/components/booking-status/bookingStatusModel";

const raw: RawApiBooking = {
  booking_reference: "ZAL-EVENT-TEST",
  booking_code: "TEST-NOT-VALID-FOR-ENTRY",
  product_type: "event",
  status: "pending_payment",
  total: "4400.00",
  currency: "EGP",
  guests: 4,
  hold_expires_at: "2026-12-24T18:50:00+02:00",
  payment_expires_at: "2026-12-24T18:50:00+02:00",
  valid_from: "2026-12-24T19:00:00+02:00",
  valid_to: "2026-12-25T01:00:00+02:00",
  created_at: "2026-12-24T18:35:00+02:00",
  event_occurrence_id: 701,
  event_slug: "christmas-night",
  event_title_ar: "ليلة الكريسماس في زالينا",
  event_title_en: "Christmas Night at Zalina",
  event_items: [{
    event_package_id: 901, name_ar: "تجربة الثنائي", name_en: "Couple Experience",
    quantity: 2, guests_per_unit: 2, unit_price: "2200.00", line_total: "4400.00",
  }],
  bubbles: [],
  payment: { status: "pending" },
  tickets_count: 0,
  tickets: [],
};

describe("Event booking integration with the existing V2 checkout and QR screens", () => {
  it("normalizes an event booking without losing package snapshots", () => {
    const booking = normalizeBooking(raw);
    expect(booking.product_type).toBe("event");
    expect(booking.event_slug).toBe("christmas-night");
    expect(booking.event_items?.[0].quantity).toBe(2);
    expect(booking.bubbles).toEqual([]);
  });

  it("persists PII-free event handoff payloads but rejects payment URLs", () => {
    const handoff = {
      schemaVersion: PAYMENT_HANDOFF_SCHEMA_VERSION,
      booking_reference: "ZAL-EVENT-TEST",
      booking_code: "TEST-NOT-VALID-FOR-ENTRY",
      product_type: "event",
      created_at: "2026-12-24T18:35:00+02:00",
      hold_expires_at: "2026-12-24T18:50:00+02:00",
      payment_expires_at: "2026-12-24T18:50:00+02:00",
      total: "4400.00",
      currency: "EGP",
    };
    expect(parsePendingPaymentHandoff(handoff)?.product_type).toBe("event");
    expect(parsePendingPaymentHandoff({ ...handoff, guest_phone: "secret" })).toBeNull();
    expect(parsePendingPaymentHandoff({ ...handoff, payment_url: "https://example.com" })).toBeNull();
  });

  it("never shows an event QR before confirmed, ticket-ready state", () => {
    const pending = normalizeBooking(raw);
    expect(classifyBooking(pending)).toBe("waiting");
    expect(canShowBookingQr(pending)).toBe(false);
    const withoutTicket = normalizeBooking({ ...raw, status: "confirmed" });
    expect(classifyBooking(withoutTicket)).toBe("confirmed_preparing_ticket");
    expect(canShowBookingQr(withoutTicket)).toBe(false);
    const withTicket = normalizeBooking({ ...raw, status: "confirmed", tickets_count: 1 });
    expect(classifyBooking(withTicket)).toBe("confirmed_ready");
    expect(canShowBookingQr(withTicket)).toBe(true);
  });

  it("reads optional event snapshots from ticket API", () => {
    const ticket: RawTicketLookup = {
      booking_code: raw.booking_code,
      booking_reference: raw.booking_reference,
      product_type: "event",
      status: "confirmed",
      payment_status: "paid",
      guests: 4,
      valid_from: raw.valid_from,
      valid_to: raw.valid_to,
      event_title_en: raw.event_title_en,
      event_title_ar: raw.event_title_ar,
      event_items: raw.event_items,
      bubbles: [],
    };
    const result = normalizeTicketLookup(ticket);
    expect(result.product_type).toBe("event");
    expect(result.event_items?.[0].event_package_id).toBe(901);
  });
});
