import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertNoLegacyBookingFields,
  buildBubbleStayManualPayload,
  buildBubbleStayRandomPayload,
  buildDayUseBookingPayload,
  normalizeAccommodationAvailability,
  normalizeAccommodationType,
  normalizeBooking,
  LEGACY_BOOKING_PAYLOAD_KEY_LIST,
} from "../adapters";
import { apiFetch } from "../client";
import { getBooking } from "../bookings";
import { ApiError } from "../types";

describe("Booking Domain V2 payloads", () => {
  it("Day Use payload contains only allowed V2 fields", () => {
    const payload = buildDayUseBookingPayload({
      visit_date: "2026-08-20",
      guests: 3,
      guest_name: "Layla Al-Harbi",
      guest_email: "layla@example.com",
      guest_phone: "+966501234567",
    });

    expect(payload).toEqual({
      product_type: "day_use",
      visit_date: "2026-08-20",
      guests: 3,
      guest_name: "Layla Al-Harbi",
      guest_email: "layla@example.com",
      guest_phone: "+966501234567",
    });
    expect(Object.keys(payload).sort()).toEqual(
      [
        "guest_email",
        "guest_name",
        "guest_phone",
        "guests",
        "product_type",
        "visit_date",
      ].sort()
    );
  });

  it("Bubble Stay manual payload accepts multiple bubbles", () => {
    const payload = buildBubbleStayManualPayload({
      check_in: "2026-08-10",
      check_out: "2026-08-12",
      guests: 8,
      guest_name: "Omar Hassan",
      guest_email: "omar@example.com",
      guest_phone: "+966509876543",
      bubbles: [
        { accommodation_type_id: 2, bubble_id: 4, guests: 4 },
        { accommodation_type_id: 2, bubble_id: 5, guests: 4 },
      ],
    });

    expect(payload.product_type).toBe("bubble_stay");
    expect(payload.bubbles).toHaveLength(2);
    expect(payload.bubbles[0]).toEqual({
      accommodation_type_id: 2,
      bubble_id: 4,
      guests: 4,
    });
    expect(payload.bubbles[1].bubble_id).toBe(5);
    expect("random_assignment" in payload).toBe(false);
  });

  it("Random assignment omits bubble_id", () => {
    const payload = buildBubbleStayRandomPayload({
      check_in: "2026-08-10",
      check_out: "2026-08-12",
      guests: 2,
      guest_name: "Sara Nasser",
      guest_email: "sara@example.com",
      guest_phone: "+966501112233",
      bubbles: [{ accommodation_type_id: 2, guests: 2 }],
    });

    expect(payload.random_assignment).toBe(true);
    expect(payload.bubbles).toEqual([
      { accommodation_type_id: 2, guests: 2 },
    ]);
    expect(payload.bubbles[0]).not.toHaveProperty("bubble_id");
  });

  it("Legacy booking fields cannot be emitted", () => {
    for (const key of LEGACY_BOOKING_PAYLOAD_KEY_LIST) {
      expect(() =>
        assertNoLegacyBookingFields({
          product_type: "day_use",
          [key]: 1,
        })
      ).toThrow(/Legacy Booking V1/);
    }

    const dayUse = buildDayUseBookingPayload({
      visit_date: "2026-08-20",
      guests: 1,
      guest_name: "A",
      guest_email: "a@b.com",
      guest_phone: "+1",
    });
    const bubble = buildBubbleStayManualPayload({
      check_in: "2026-08-10",
      check_out: "2026-08-11",
      guests: 2,
      guest_name: "A",
      guest_email: "a@b.com",
      guest_phone: "+1",
      bubbles: [{ accommodation_type_id: 1, bubble_id: 9, guests: 2 }],
    });

    for (const key of LEGACY_BOOKING_PAYLOAD_KEY_LIST) {
      expect(dayUse).not.toHaveProperty(key);
      expect(bubble).not.toHaveProperty(key);
    }
  });
});

describe("Accommodation normalization", () => {
  it("supports nested bubbles array", () => {
    const type = normalizeAccommodationType({
      id: 2,
      name_en: "Two Bed Bubble",
      name_ar: "فقاعة سريرين",
      slug_en: "two-bed-bubble",
      slug_ar: "فقاعة-سريرين",
      max_guests: 4,
      price_per_night: "750.00",
      is_active: true,
      bubbles_count: 4,
      bubbles: [
        {
          id: 4,
          name_en: "Horus",
          name_ar: "حورس",
          status: "available",
          accommodation_type_id: 2,
        },
      ],
    });

    expect(type.bubbles).toHaveLength(1);
    expect(type.bubbles[0].name_en).toBe("Horus");
    expect(type.price_per_night).toBe("750.00");
    expect(type.bubbles_count).toBe(4);
  });

  it("compatibility: available_bubbles array on catalog becomes bubbles[]", () => {
    const type = normalizeAccommodationType({
      id: 2,
      name_en: "Two Bed Bubble",
      name_ar: "فقاعة سريرين",
      slug_en: "two-bed-bubble",
      slug_ar: "فقاعة-سريرين",
      max_guests: 4,
      price_per_night: "750.00",
      is_active: true,
      available_bubbles: [
        {
          id: 4,
          name_en: "Horus",
          name_ar: "حورس",
          status: "available",
          accommodation_type_id: 2,
        },
        {
          id: 5,
          name_en: "Hathor",
          name_ar: "حتحور",
          status: "available",
          accommodation_type_id: 2,
        },
      ],
    });

    expect(type.bubbles).toHaveLength(2);
    expect(type.bubbles.map((b) => b.id)).toEqual([4, 5]);
  });

  it("availability keeps numeric available_bubbles separate from bubbles[]", () => {
    const availability = normalizeAccommodationAvailability({
      availability: true,
      available_bubbles: 3,
      price_per_night: "750.00",
      total_estimate: "1500.00",
      bubbles: [
        {
          id: 4,
          name_en: "Horus",
          name_ar: "حورس",
          status: "available",
          accommodation_type_id: 2,
        },
        {
          id: 5,
          name_en: "Hathor",
          name_ar: "حتحور",
          status: "available",
          accommodation_type_id: 2,
        },
      ],
    });

    expect(availability.available_bubbles).toBe(3);
    expect(typeof availability.available_bubbles).toBe("number");
    expect(availability.bubbles).toHaveLength(2);
    expect(Array.isArray(availability.bubbles)).toBe(true);
  });
});

describe("API client contract", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("propagates Arabic/English locale header", async () => {
    const fetchMock = vi.mocked(fetch);
    const jsonBody = { success: true, message: "ok", data: { ok: true } };
    fetchMock.mockImplementation(async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => jsonBody,
      }) as Response
    );

    await apiFetch("/day-use", { locale: "ar" });
    expect(fetchMock).toHaveBeenCalled();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Accept-Language")).toBe("ar");

    await apiFetch("/day-use", { locale: "en" });
    const initEn = fetchMock.mock.calls[1][1] as RequestInit;
    expect(new Headers(initEn.headers).get("Accept-Language")).toBe("en");
  });

  it("API error envelope preserves validation errors", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "Validation failed",
          errors: {
            visit_date: ["The visit date field is required."],
            guests: ["The guests must be at least 1."],
          },
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
            "X-Request-Id": "req-test-1",
          },
        }
      )
    );

    await expect(apiFetch("/bookings", { method: "POST", body: {} })).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "Validation failed",
      requestId: "req-test-1",
      errors: {
        visit_date: ["The visit date field is required."],
        guests: ["The guests must be at least 1."],
      },
    });

    try {
      await apiFetch("/bookings", { method: "POST", body: {} });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
    }
  });

  it("getBooking models pending and confirmed responses", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: {
            booking_reference: "BK-A3F9D12C-20260805",
            booking_code: "ZLN-K7M2-P9QX",
            product_type: "bubble_stay",
            status: "pending_payment",
            total: "1500.00",
            guests: 8,
            hold_expires_at: null,
            payment_expires_at: null,
            valid_from: "2026-08-10",
            valid_to: "2026-08-12",
            checked_in_at: null,
            checked_out_at: null,
            created_at: "2026-08-05T02:00:00+00:00",
            bubbles: [
              {
                id: 4,
                name_en: "Horus",
                name_ar: "حورس",
                guests: 4,
                accommodation_type: {
                  id: 2,
                  name_en: "Two Bed Bubble",
                  name_ar: "فقاعة سريرين",
                  price_per_night: "750.00",
                  max_guests: 4,
                },
              },
            ],
            payment: { status: "pending" },
            tickets_count: 0,
            tickets: [],
          },
        }),
        { status: 200 }
      )
    );

    const pending = await getBooking("BK-A3F9D12C-20260805");
    expect(pending.status).toBe("pending_payment");
    expect(pending.payment?.status).toBe("pending");
    expect(pending.tickets_count).toBe(0);
    expect(pending.guest_name).toBeUndefined();

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: {
            booking_reference: "BK-A3F9D12C-20260805",
            booking_code: "ZLN-K7M2-P9QX",
            product_type: "bubble_stay",
            status: "confirmed",
            total: "1500.00",
            guests: 8,
            hold_expires_at: null,
            payment_expires_at: null,
            valid_from: "2026-08-10",
            valid_to: "2026-08-12",
            checked_in_at: null,
            checked_out_at: null,
            created_at: "2026-08-05T02:00:00+00:00",
            bubbles: [
              {
                id: 4,
                name_en: "Horus",
                name_ar: "حورس",
                guests: 4,
                accommodation_type: {
                  id: 2,
                  name_en: "Two Bed Bubble",
                  name_ar: "فقاعة سريرين",
                  price_per_night: "750.00",
                  max_guests: 4,
                },
              },
            ],
            payment: { status: "paid" },
            tickets_count: 1,
            tickets: [
              {
                ticket_code: "ABCD-EFGH-JKLM",
                type: "bubble",
                title: "Bubble Stay",
                valid_from: "2026-08-10",
                valid_to: "2026-08-12",
              },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const confirmed = await getBooking("BK-A3F9D12C-20260805");
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.payment?.status).toBe("paid");
    expect(confirmed.tickets_count).toBe(1);
    expect(confirmed.tickets?.[0]?.type).toBe("bubble");
    expect(confirmed.bubbles[0]?.accommodation_type?.price_per_night).toBe(
      "750.00"
    );
  });
});
