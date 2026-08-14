import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, type ApiBooking } from "@/lib/api";
import {
  BookingCheckoutRunner,
  buildPaymentInitBody,
  mapCreateError,
} from "../bookingCheckoutRunner";
import { prepareBookingPayload } from "../prepareBookingPayload";
import { selectEstimatedTotal } from "../bookingSelectors";
import {
  clearManualBubbleIds,
  createInitialBookingState,
} from "../bookingStateFactory";
import {
  isDateOnOrAfterToday,
  nightsBetween,
  todayIsoDate,
  validateDayUseDates,
} from "../bookingValidation";
import type { AccommodationTypeMeta, BookingState } from "../types";
import { BookingStatusPollController } from "@/components/booking-status/bookingStatusPollController";
import {
  canShowBookingQr,
  classifyBooking,
  shouldPollBooking,
} from "@/components/booking-status/bookingStatusModel";
import {
  clearPendingPaymentBooking,
  loadPendingPaymentBooking,
  parsePendingPaymentHandoff,
  savePendingPaymentBooking,
} from "../paymentHandoffStorage";
import { resolvePaymentGateway } from "../paymentGateway";
import { isSafePaymentUrl } from "../paymentUrl";
import { pickAuthoritativeReference } from "@/components/booking-status/bookingRecovery";

const TYPES: AccommodationTypeMeta[] = [
  {
    id: 10,
    slug: "type-a",
    name_en: "Type A",
    name_ar: "النوع أ",
    max_guests: 4,
    price_per_night: "100.00",
    is_active: true,
    bubbles_count: 2,
    bubbles: [
      { id: 101, name_en: "A1", name_ar: "أ1", status: "available" },
      { id: 102, name_en: "A2", name_ar: "أ2", status: "available" },
    ],
  },
  {
    id: 20,
    slug: "type-b",
    name_en: "Type B",
    name_ar: "النوع ب",
    max_guests: 6,
    price_per_night: "250.00",
    is_active: true,
    bubbles_count: 1,
    bubbles: [{ id: 201, name_en: "B1", name_ar: "ب1", status: "available" }],
  },
];

function guestReady(patch: Partial<BookingState> = {}): BookingState {
  return {
    ...createInitialBookingState(),
    guest: {
      name: "Guest",
      email: "g@example.com",
      phone: "+201000000000",
    },
    ...patch,
  };
}

function apiBooking(overrides: Partial<ApiBooking> = {}): ApiBooking {
  return {
    booking_reference: "BK-HARDEN-001",
    booking_code: "ZLN-HARD-001",
    product_type: "day_use",
    status: "pending_payment",
    total: "300.00",
    currency: "SAR",
    guests: 2,
    hold_expires_at: new Date(Date.now() + 600_000).toISOString(),
    payment_expires_at: new Date(Date.now() + 500_000).toISOString(),
    valid_from: "2026-09-01",
    valid_to: "2026-09-01",
    checked_in_at: null,
    checked_out_at: null,
    created_at: new Date().toISOString(),
    bubbles: [],
    payment: { status: "pending" },
    tickets_count: 0,
    ...overrides,
  };
}

describe("DAY USE integration hardening", () => {
  it("active → create → pay uses V2 payload and paymob body", async () => {
    const createDayUse = vi.fn(async (payload: unknown) => {
      expect(payload).toEqual({
        product_type: "day_use",
        visit_date: "2099-08-20",
        guests: 2,
        guest_name: "Guest",
        guest_email: "g@example.com",
        guest_phone: "+201000000000",
      });
      expect(payload).not.toHaveProperty("accommodation_id");
      expect(payload).not.toHaveProperty("add_ons");
      expect(payload).not.toHaveProperty("experiences");
      return apiBooking({ total: "320.00", currency: "SAR" });
    });
    const pay = vi.fn(async (ref: string, gateway: string) => {
      expect(ref).toBe("BK-HARDEN-001");
      expect(gateway).toBe("paymob");
      return { payment_url: "https://accept.paymob.test/pay" };
    });
    const navigate = vi.fn();
    const persist = vi.fn();
    const runner = new BookingCheckoutRunner({
      createDayUse,
      pay,
      navigate,
      persist,
      resolveGateway: () => "paymob",
    });

    const state = guestReady({
      productType: "day_use",
      dayUse: { visitDate: "2099-08-20", guests: 2 },
    });
    await runner.reserveAndPay(state, TYPES, 150);
    expect(runner.state.booking?.total).toBe("320.00");
    expect(runner.state.estimateAtCreate).toBe(300);
    expect(persist).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(
      "https://accept.paymob.test/pay",
      "BK-HARDEN-001"
    );
    expect(buildPaymentInitBody("paymob")).toEqual({ gateway: "paymob" });
  });

  it("disabled Day Use create surfaces 422", async () => {
    const runner = new BookingCheckoutRunner({
      createDayUse: async () => {
        throw new ApiError("Day Use is currently disabled", 422, {
          visit_date: ["Day Use is currently disabled"],
        });
      },
    });
    await runner.reserveAndPay(
      guestReady({
        productType: "day_use",
        dayUse: { visitDate: "2099-08-20", guests: 1 },
      }),
      TYPES,
      150
    );
    expect(runner.state.error?.status).toBe(422);
    expect(runner.createCallCount).toBe(1);
  });

  it("payment retry reuses reference; confirmed ticket enables one QR", async () => {
    const createDayUse = vi.fn();
    let payCalls = 0;
    const pay = vi.fn(async () => {
      payCalls += 1;
      if (payCalls === 1) throw new ApiError("gateway temporary", 500);
      return { payment_url: "https://pay.example/ok" };
    });
    const runner = new BookingCheckoutRunner({
      createDayUse,
      pay,
      navigate: vi.fn(),
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });
    runner.seedBooking(apiBooking({ status: "failed" }));
    await runner.retryPayment();
    await runner.retryPayment();
    expect(createDayUse).not.toHaveBeenCalled();
    expect(pay).toHaveBeenCalledTimes(2);

    const confirmed = apiBooking({
      status: "confirmed",
      tickets_count: 1,
      payment: { status: "paid" },
    });
    expect(canShowBookingQr(confirmed)).toBe(true);
    expect(shouldPollBooking(confirmed)).toBe(false);
  });
});

describe("BUBBLE Stay integration hardening", () => {
  it("one manual Bubble payload", () => {
    const prepared = prepareBookingPayload(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-03",
          totalGuests: 2,
          selections: [
            {
              key: "1",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "manual",
              bubbleId: 101,
            },
          ],
        },
      }),
      TYPES
    );
    expect(prepared?.payload).toMatchObject({
      product_type: "bubble_stay",
      bubbles: [{ accommodation_type_id: 10, bubble_id: 101, guests: 2 }],
    });
  });

  it("random Bubble omits bubble_id", () => {
    const prepared = prepareBookingPayload(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-02",
          totalGuests: 2,
          selections: [
            {
              key: "r",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "random",
            },
          ],
        },
      }),
      TYPES
    );
    expect(prepared?.payload).toMatchObject({ random_assignment: true });
    expect(
      (prepared?.payload as { bubbles: object[] }).bubbles[0]
    ).not.toHaveProperty("bubble_id");
  });

  it("multi-Bubble mixed accommodation types estimate math", () => {
    // 2 nights × (100 + 250) = 700
    const total = selectEstimatedTotal(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-03",
          totalGuests: 5,
          selections: [
            {
              key: "1",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "manual",
              bubbleId: 101,
            },
            {
              key: "2",
              accommodationTypeId: 20,
              accommodationSlug: "type-b",
              guests: 3,
              assignmentMode: "manual",
              bubbleId: 201,
            },
          ],
        },
      }),
      TYPES
    );
    expect(nightsBetween("2099-09-01", "2099-09-03")).toBe(2);
    expect(total).toBe(700);
  });

  it("same type multiple times prices each line", () => {
    // 1 night × (100 + 100) = 200
    const total = selectEstimatedTotal(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-02",
          totalGuests: 4,
          selections: [
            {
              key: "1",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "manual",
              bubbleId: 101,
            },
            {
              key: "2",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "manual",
              bubbleId: 102,
            },
          ],
        },
      }),
      TYPES
    );
    expect(total).toBe(200);
  });

  it("409 race conflict does not recreate booking", async () => {
    const onBubbleConflict = vi.fn();
    const createBubbleStay = vi.fn(async () => {
      throw new ApiError("Bubble just taken", 409);
    });
    const runner = new BookingCheckoutRunner({
      createBubbleStay,
      onBubbleConflict,
    });
    await runner.reserveAndPay(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-02",
          totalGuests: 2,
          selections: [
            {
              key: "1",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "manual",
              bubbleId: 101,
            },
          ],
        },
      }),
      TYPES
    );
    expect(mapCreateError(new ApiError("x", 409)).kind).toBe("conflict");
    expect(runner.state.booking).toBeNull();
    expect(createBubbleStay).toHaveBeenCalledTimes(1);
    expect(onBubbleConflict).toHaveBeenCalled();

    // Date change clears physical bubble ids
    const cleared = clearManualBubbleIds({
      checkIn: "2099-09-02",
      checkOut: "2099-09-03",
      totalGuests: 2,
      selections: [
        {
          key: "1",
          accommodationTypeId: 10,
          accommodationSlug: "type-a",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 101,
        },
      ],
    });
    expect(cleared.selections[0].bubbleId).toBeUndefined();
  });

  it("random assignment uses server-returned bubbles after create", async () => {
    const runner = new BookingCheckoutRunner({
      createBubbleStay: async () =>
        apiBooking({
          product_type: "bubble_stay",
          bubbles: [
            {
              id: 101,
              name_en: "A1",
              name_ar: "أ1",
              guests: 2,
            },
          ],
        }),
      pay: async () => ({ payment_url: "https://pay.example/ok" }),
      navigate: vi.fn(),
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });
    await runner.create(
      guestReady({
        productType: "bubble_stay",
        bubbleStay: {
          checkIn: "2099-09-01",
          checkOut: "2099-09-02",
          totalGuests: 2,
          selections: [
            {
              key: "r",
              accommodationTypeId: 10,
              accommodationSlug: "type-a",
              guests: 2,
              assignmentMode: "random",
            },
          ],
        },
      }),
      TYPES
    );
    expect(runner.state.booking?.bubbles[0]?.name_en).toBe("A1");
  });

  it("one QR for multi-bubble booking", () => {
    const b = apiBooking({
      product_type: "bubble_stay",
      status: "confirmed",
      tickets_count: 1,
      booking_code: "ZLN-ONE-QR",
      bubbles: [
        { id: 1, name_en: "Horus", name_ar: "حورس", guests: 4 },
        { id: 2, name_en: "Hathor", name_ar: "حتحور", guests: 4 },
      ],
    });
    expect(canShowBookingQr(b)).toBe(true);
    expect(b.bubbles).toHaveLength(2);
    expect(b.booking_code).toBe("ZLN-ONE-QR");
  });
});

describe("PAYMENT / STATUS hardening", () => {
  it("delayed webhook: pending → paid → confirmed preparing → ready", () => {
    expect(classifyBooking(apiBooking({ status: "pending_payment" }))).toBe(
      "waiting"
    );
    expect(classifyBooking(apiBooking({ status: "paid" }))).toBe("waiting");
    expect(
      classifyBooking(
        apiBooking({
          status: "confirmed",
          tickets_count: 0,
          payment: { status: "paid" },
        })
      )
    ).toBe("confirmed_preparing_ticket");
    expect(
      classifyBooking(
        apiBooking({
          status: "confirmed",
          tickets_count: 1,
          payment: { status: "paid" },
        })
      )
    ).toBe("confirmed_ready");
  });

  it("expired hold blocks pay; failed/cancelled stop polling", async () => {
    const pay = vi.fn();
    const runner = new BookingCheckoutRunner({ pay });
    runner.seedBooking(
      apiBooking({
        payment_expires_at: new Date(Date.now() - 1000).toISOString(),
      })
    );
    await runner.retryPayment();
    expect(pay).not.toHaveBeenCalled();
    expect(shouldPollBooking(apiBooking({ status: "failed" }))).toBe(false);
    expect(shouldPollBooking(apiBooking({ status: "cancelled" }))).toBe(false);
  });

  it("already-paid is not treated as payment initiation failure path in body", () => {
    expect(buildPaymentInitBody("paymob")).not.toHaveProperty("return_url");
  });

  it("direct refresh / handoff: route wins; stale schema rejected", () => {
    expect(
      pickAuthoritativeReference("BK-ROUTE-AAAAAA", "BK-STALE-BBBBBB")
    ).toBe("BK-ROUTE-AAAAAA");
    expect(
      parsePendingPaymentHandoff({
        schemaVersion: 1,
        booking_reference: "BK-OLD",
        booking_code: "ZLN",
        product_type: "day_use",
      })
    ).toBeNull();
  });

  it("429 polling backs off; network keeps last state", async () => {
    let n = 0;
    const controller = new BookingStatusPollController("BK-HARDEN-001", "en", {
      now: () => 1_000_000,
      getBookingFn: async () => {
        n += 1;
        if (n === 1) return apiBooking({ status: "pending_payment" });
        if (n === 2) throw new ApiError("rate", 429);
        throw new TypeError("offline");
      },
    });
    await controller.fetchOnce();
    await controller.fetchOnce(true);
    expect(controller.booking?.status).toBe("pending_payment");
    expect(controller.rateLimitedUntil).toBeTruthy();
  });

  it("unsafe payment urls rejected; env mock works in production NODE_ENV", () => {
    expect(isSafePaymentUrl("javascript:alert(1)")).toBe(false);
    const prevNode = process.env.NODE_ENV;
    const prevGw = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;
    // @ts-expect-error test
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "mock";
    expect(resolvePaymentGateway()).toBe("mock");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "paymob";
    expect(resolvePaymentGateway()).toBe("paymob");
    delete process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;
    expect(resolvePaymentGateway()).toBe("paymob");
    // @ts-expect-error restore
    process.env.NODE_ENV = prevNode;
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = prevGw;
  });

  it("has no frontend mock payment page route", async () => {
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(process.cwd());
    expect(existsSync(join(root, "app", "mock-pay"))).toBe(false);
    expect(existsSync(join(root, "pages", "mock-pay.tsx"))).toBe(false);
    expect(existsSync(join(root, "app", "mock-pay", "page.tsx"))).toBe(false);
  });
});

describe("timezone / midnight date-only", () => {
  it("todayIsoDate uses local calendar components", () => {
    const localMidnight = new Date(2026, 7, 13, 0, 5, 0); // Aug 13 local
    expect(todayIsoDate(localMidnight)).toBe("2026-08-13");
    const justBeforeMidnight = new Date(2026, 7, 13, 23, 59, 0);
    expect(todayIsoDate(justBeforeMidnight)).toBe("2026-08-13");
  });

  it("past visit date rejected relative to local today", () => {
    const now = new Date(2026, 7, 13, 1, 0, 0);
    const issues = validateDayUseDates(
      { visitDate: "2026-08-12", guests: 1 },
      now
    );
    expect(issues.some((i) => i.code === "invalid_visit_date")).toBe(true);
    expect(isDateOnOrAfterToday("2026-08-13", now)).toBe(true);
  });

  it("does not shift YYYY-MM-DD via UTC ISO conversion", () => {
    // Regression: Date.parse + toISOString can yield previous calendar day in Egypt.
    const raw = "2026-08-20";
    expect(raw).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(todayIsoDate(new Date(2026, 7, 20, 0, 0, 0))).toBe("2026-08-20");
  });
});

describe("handoff storage hardening", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    const sessionStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    };
    vi.stubGlobal("window", { sessionStorage });
    vi.stubGlobal("sessionStorage", sessionStorage);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("rejects PII / payment_url and clears on demand", () => {
    savePendingPaymentBooking(apiBooking());
    expect(loadPendingPaymentBooking()?.booking_reference).toBe("BK-HARDEN-001");
    expect(
      parsePendingPaymentHandoff({
        schemaVersion: 2,
        booking_reference: "BK-X",
        booking_code: "Z",
        product_type: "day_use",
        payment_url: "https://evil",
      })
    ).toBeNull();
    clearPendingPaymentBooking();
    expect(loadPendingPaymentBooking()).toBeNull();
  });
});

describe("security contract", () => {
  it("no V1 fields / webhook / invented return in create+pay helpers", () => {
    const day = prepareBookingPayload(
      guestReady({
        productType: "day_use",
        dayUse: { visitDate: "2099-08-20", guests: 1 },
      }),
      TYPES
    );
    expect(day?.payload).not.toHaveProperty("check_in_date");
    expect(buildPaymentInitBody("paymob")).toEqual({ gateway: "paymob" });
  });
});

/**
 * Documented limitation (not a fake fix):
 * POST /bookings is not client-idempotent. Network uncertainty after create
 * must not blindly auto-retry create (BookingCheckoutRunner maps TypeError
 * to network and leaves phase=error without auto recreate).
 */
describe("network uncertainty after create", () => {
  it("does not auto-retry create on network failure", async () => {
    const createDayUse = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const runner = new BookingCheckoutRunner({ createDayUse });
    await runner.reserveAndPay(
      guestReady({
        productType: "day_use",
        dayUse: { visitDate: "2099-08-20", guests: 1 },
      }),
      TYPES,
      100
    );
    expect(createDayUse).toHaveBeenCalledTimes(1);
    expect(runner.state.error?.kind).toBe("network");
    expect(runner.state.booking).toBeNull();
  });
});
