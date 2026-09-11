import { describe, expect, it } from "vitest";
import {
  assertNoLegacyBookingFields,
  buildWeddingBookingPayload,
  normalizeWeddingAvailability,
  normalizeWeddingPackage,
  LEGACY_BOOKING_PAYLOAD_KEY_LIST,
} from "../adapters";

describe("Wedding Domain payloads", () => {
  it("Wedding payload contains only allowed V2 fields", () => {
    const payload = buildWeddingBookingPayload({
      wedding_package_id: 2,
      wedding_date: "2026-10-20",
      guests: 150,
      guest_name: "Nour Hassan",
      guest_email: "nour@example.com",
      guest_phone: "+201000000000",
    });

    expect(payload).toEqual({
      product_type: "wedding",
      wedding_package_id: 2,
      wedding_date: "2026-10-20",
      guests: 150,
      guest_name: "Nour Hassan",
      guest_email: "nour@example.com",
      guest_phone: "+201000000000",
    });
    expect(Object.keys(payload).sort()).toEqual(
      [
        "guest_email",
        "guest_name",
        "guest_phone",
        "guests",
        "product_type",
        "wedding_date",
        "wedding_package_id",
      ].sort()
    );
    for (const key of LEGACY_BOOKING_PAYLOAD_KEY_LIST) {
      expect(payload).not.toHaveProperty(key);
    }
    expect(payload).not.toHaveProperty("total");
    expect(payload).not.toHaveProperty("currency");
    expect(payload).not.toHaveProperty("add_ons");
  });

  it("rejects legacy fields on wedding payloads", () => {
    expect(() =>
      assertNoLegacyBookingFields({
        product_type: "wedding",
        add_ons: [],
      })
    ).toThrow(/Legacy Booking V1/);
  });
});

describe("Wedding catalog normalization", () => {
  it("normalizes package catalog fields without inventing prices", () => {
    const pkg = normalizeWeddingPackage({
      id: 2,
      slug: "zalina-signature-wedding",
      name_en: "Zalina Signature Wedding",
      name_ar: "حفل زفاف زالينا سيجنتشر",
      description_en: "Complete experience",
      description_ar: "تجربة كاملة",
      price_per_guest: "95.00",
      currency: "USD",
      minimum_guests: 150,
      maximum_guests: 500,
      premium_ok: true,
      display_order: 2,
      is_active: true,
    });

    expect(pkg.slug).toBe("zalina-signature-wedding");
    expect(pkg.price_per_guest).toBe("95.00");
    expect(pkg.currency).toBe("USD");
    expect(pkg.minimum_guests).toBe(150);
    expect(pkg.premium_ok).toBe(true);
  });

  it("normalizes availability including premium floor fields", () => {
    const avail = normalizeWeddingAvailability({
      available: true,
      reason: null,
      is_premium_date: true,
      is_friday: true,
      is_saturday: false,
      is_peak_date: false,
      price_per_guest: "95.00",
      base_total: "14250.00",
      premium_date_minimum_spend: "18000.00",
      total_estimate: "18000.00",
      currency: "USD",
    });

    expect(avail.available).toBe(true);
    expect(avail.is_premium_date).toBe(true);
    expect(avail.total_estimate).toBe("18000.00");
    expect(avail.premium_date_minimum_spend).toBe("18000.00");
  });

  it("maps unavailable reason from API", () => {
    const avail = normalizeWeddingAvailability({
      available: false,
      reason: "This date is already booked for a wedding.",
      currency: "USD",
    });
    expect(avail.available).toBe(false);
    expect(avail.reason).toContain("already booked");
  });
});

describe("Wedding payment handoff", () => {
  it("accepts wedding product_type in pending payment handoff", async () => {
    const { parsePendingPaymentHandoff } = await import(
      "@/components/book-now/paymentHandoffStorage"
    );
    const handoff = parsePendingPaymentHandoff({
      schemaVersion: 2,
      booking_reference: "ZLN-W-1",
      booking_code: "WCODE1",
      product_type: "wedding",
      created_at: "2026-09-11T12:00:00Z",
      hold_expires_at: null,
      payment_expires_at: null,
      total: "18000.00",
      currency: "USD",
    });
    expect(handoff?.product_type).toBe("wedding");
    expect(handoff?.booking_reference).toBe("ZLN-W-1");
  });
});
