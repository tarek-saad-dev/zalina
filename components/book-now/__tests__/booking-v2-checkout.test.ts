import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, type ApiBooking } from "@/lib/api";
import {
  BookingCheckoutRunner,
  buildPaymentInitBody,
  isHoldExpired,
  mapCreateError,
  mapPaymentError,
} from "../bookingCheckoutRunner";
import { prepareBookingPayload } from "../prepareBookingPayload";
import {
  isSafePaymentUrl,
  navigateAfterPaymentInitiation,
} from "../paymentUrl";
import { resolvePaymentGateway } from "../paymentGateway";
import {
  clearPendingPaymentBooking,
  loadPendingPaymentBooking,
  parsePendingPaymentHandoff,
  savePendingPaymentBooking,
} from "../paymentHandoffStorage";
import {
  formatRemaining,
  pickExpiryTimestamp,
} from "../useHoldCountdown";
import { createInitialBookingState } from "../bookingStateFactory";
import type { AccommodationTypeMeta, BookingState } from "../types";
import { PAYMENT_HANDOFF_SCHEMA_VERSION } from "../checkoutTypes";

const TYPES: AccommodationTypeMeta[] = [
  {
    id: 2,
    slug: "two-bed-bubble",
    name_en: "Two Bed Bubble",
    name_ar: "فقاعة سريرين",
    max_guests: 4,
    price_per_night: "750.00",
    is_active: true,
    bubbles_count: 2,
    bubbles: [
      { id: 4, name_en: "Horus", name_ar: "حورس", status: "available" },
      { id: 5, name_en: "Hathor", name_ar: "حتحور", status: "available" },
    ],
  },
];

function dayUseReady(): BookingState {
  return {
    ...createInitialBookingState(),
    productType: "day_use",
    dayUse: { visitDate: "2026-09-01", guests: 2 },
    guest: {
      name: "Guest One",
      email: "guest@example.com",
      phone: "+201000000000",
    },
  };
}

function bubbleManualReady(): BookingState {
  return {
    ...createInitialBookingState(),
    productType: "bubble_stay",
    bubbleStay: {
      checkIn: "2026-09-10",
      checkOut: "2026-09-12",
      totalGuests: 3,
      selections: [
        {
          key: "a",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 4,
        },
        {
          key: "b",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 1,
          assignmentMode: "manual",
          bubbleId: 5,
        },
      ],
    },
    guest: {
      name: "Guest Two",
      email: "two@example.com",
      phone: "+201111111111",
    },
  };
}

function bubbleRandomReady(): BookingState {
  const state = bubbleManualReady();
  return {
    ...state,
    bubbleStay: {
      ...state.bubbleStay,
      totalGuests: 2,
      selections: [
        {
          key: "r1",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "random",
        },
      ],
    },
  };
}

function sampleBooking(overrides: Partial<ApiBooking> = {}): ApiBooking {
  return {
    booking_reference: "ZLN-REF-1",
    booking_code: "ZLN-CODE-1",
    product_type: "day_use",
    status: "pending_payment",
    total: "500.00",
    currency: "EGP",
    guests: 2,
    hold_expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    payment_expires_at: new Date(Date.now() + 8 * 60_000).toISOString(),
    valid_from: "2026-09-01",
    valid_to: "2026-09-01",
    checked_in_at: null,
    checked_out_at: null,
    created_at: new Date().toISOString(),
    bubbles: [],
    ...overrides,
  };
}

describe("prepareBookingPayload V2", () => {
  it("Day Use state creates correct V2 payload", () => {
    const prepared = prepareBookingPayload(dayUseReady(), TYPES);
    expect(prepared?.product).toBe("day_use");
    expect(prepared?.payload).toEqual({
      product_type: "day_use",
      visit_date: "2026-09-01",
      guests: 2,
      guest_name: "Guest One",
      guest_email: "guest@example.com",
      guest_phone: "+201000000000",
    });
  });

  it("Bubble manual selection creates correct V2 payload", () => {
    const prepared = prepareBookingPayload(bubbleManualReady(), TYPES);
    expect(prepared?.product).toBe("bubble_stay");
    expect(prepared?.payload).toMatchObject({
      product_type: "bubble_stay",
      check_in: "2026-09-10",
      check_out: "2026-09-12",
      guests: 3,
      bubbles: [
        { accommodation_type_id: 2, bubble_id: 4, guests: 2 },
        { accommodation_type_id: 2, bubble_id: 5, guests: 1 },
      ],
    });
    expect(prepared?.payload).not.toHaveProperty("random_assignment");
  });

  it("Bubble random assignment omits bubble_id", () => {
    const prepared = prepareBookingPayload(bubbleRandomReady(), TYPES);
    expect(prepared?.payload).toMatchObject({
      product_type: "bubble_stay",
      random_assignment: true,
      bubbles: [{ accommodation_type_id: 2, guests: 2 }],
    });
    const bubbles = (
      prepared?.payload as unknown as { bubbles: Record<string, unknown>[] }
    ).bubbles;
    expect(bubbles[0]).not.toHaveProperty("bubble_id");
  });

  it("Multiple bubbles submit correctly", () => {
    const prepared = prepareBookingPayload(bubbleManualReady(), TYPES);
    expect(
      (prepared?.payload as { bubbles: unknown[] }).bubbles
    ).toHaveLength(2);
  });

  it("emits no V1 booking fields", () => {
    for (const state of [
      dayUseReady(),
      bubbleManualReady(),
      bubbleRandomReady(),
    ]) {
      const prepared = prepareBookingPayload(state, TYPES);
      expect(prepared?.payload).not.toHaveProperty("accommodation_id");
      expect(prepared?.payload).not.toHaveProperty("check_in_date");
      expect(prepared?.payload).not.toHaveProperty("check_out_date");
      expect(prepared?.payload).not.toHaveProperty("add_ons");
      expect(prepared?.payload).not.toHaveProperty("experiences");
      expect(prepared?.payload).not.toHaveProperty("return_url");
      expect(prepared?.payload).not.toHaveProperty("callback_url");
    }
  });
});

describe("payment helpers", () => {
  it("pay body is { gateway } only", () => {
    expect(buildPaymentInitBody("paymob")).toEqual({ gateway: "paymob" });
    expect(buildPaymentInitBody("mock")).toEqual({ gateway: "mock" });
    expect(buildPaymentInitBody("paymob")).not.toHaveProperty("return_url");
    expect(buildPaymentInitBody("paymob")).not.toHaveProperty("callback_url");
  });

  it("validates payment_url before navigation", () => {
    expect(isSafePaymentUrl("https://accept.paymob.com/pay")).toBe(true);
    expect(isSafePaymentUrl("http://localhost:3000/mock-pay")).toBe(true);
    expect(isSafePaymentUrl("javascript:alert(1)")).toBe(false);
    expect(isSafePaymentUrl("not-a-url")).toBe(false);
    expect(isSafePaymentUrl("")).toBe(false);
  });

  it("navigates to returned payment_url as-is (mock or paymob)", () => {
    const assign = vi.fn();
    navigateAfterPaymentInitiation({
      paymentUrl: "https://api.example/mock-pay?txn=1",
      bookingReference: "BK-REF-123456",
      assign,
    });
    expect(assign).toHaveBeenCalledWith("https://api.example/mock-pay?txn=1");
    expect(assign).not.toHaveBeenCalledWith("/booking/BK-REF-123456");
  });

  it("env mock/paymob/missing/invalid resolve correctly", () => {
    const prev = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "mock";
    expect(resolvePaymentGateway()).toBe("mock");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "paymob";
    expect(resolvePaymentGateway()).toBe("paymob");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "MOCK";
    expect(resolvePaymentGateway()).toBe("mock");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "stripe";
    expect(resolvePaymentGateway()).toBe("paymob");
    delete process.env.NEXT_PUBLIC_PAYMENT_GATEWAY;
    expect(resolvePaymentGateway()).toBe("paymob");
    // NODE_ENV production must NOT override explicit mock
    const prevNode = process.env.NODE_ENV;
    // @ts-expect-error test override
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = "mock";
    expect(resolvePaymentGateway()).toBe("mock");
    // @ts-expect-error restore
    process.env.NODE_ENV = prevNode;
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY = prev;
  });

  it("mock payment initiation sends { gateway: mock } and uses payment_url", async () => {
    const persist = vi.fn();
    const navigate = vi.fn();
    const pay = vi.fn(async (ref: string, gateway: "paymob" | "mock") => {
      expect(ref).toBe("BK-MOCK-REF");
      expect(gateway).toBe("mock");
      return {
        payment_url: "https://api.zalinaarabianvillage.com/mock-pay?txn=MOCK-X",
      };
    });
    const runner = new BookingCheckoutRunner({
      pay,
      persist,
      navigate,
      resolveGateway: () => "mock",
    });
    const booking = sampleBooking({
      booking_reference: "BK-MOCK-REF",
    });
    runner.seedBooking(booking);
    await runner.pay(booking);
    expect(pay).toHaveBeenCalledTimes(1);
    expect(runner.lastPaymentBody).toEqual({ gateway: "mock" });
    expect(persist).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(
      "https://api.zalinaarabianvillage.com/mock-pay?txn=MOCK-X",
      "BK-MOCK-REF"
    );
    expect(runner.payCallCount).toBe(1);
    expect(runner.createCallCount).toBe(0);
  });

  it("payment retry uses same booking_reference without second create", async () => {
    const booking = sampleBooking({ booking_reference: "BK-RETRY-1" });
    const createDayUse = vi.fn();
    const pay = vi.fn(async (ref: string, gateway: "paymob" | "mock") => {
      expect(ref).toBe("BK-RETRY-1");
      expect(gateway).toBe("mock");
      return { payment_url: "https://api.example/mock-pay?txn=2" };
    });
    const navigate = vi.fn();
    const runner = new BookingCheckoutRunner({
      createDayUse,
      pay,
      navigate,
      resolveGateway: () => "mock",
    });
    runner.seedBooking(booking);
    await runner.retryPayment();
    await runner.retryPayment();
    expect(createDayUse).not.toHaveBeenCalled();
    expect(pay).toHaveBeenCalledTimes(2);
    expect(pay.mock.calls.every((c) => c[0] === "BK-RETRY-1")).toBe(true);
    expect(runner.createCallCount).toBe(0);
  });

  it("hold/payment expiry derived from API timestamps", () => {
    const payment = "2026-09-01T12:10:00.000Z";
    const hold = "2026-09-01T12:15:00.000Z";
    expect(
      pickExpiryTimestamp({
        payment_expires_at: payment,
        hold_expires_at: hold,
      })
    ).toBe(Date.parse(payment));
    expect(
      pickExpiryTimestamp({
        payment_expires_at: null,
        hold_expires_at: hold,
      })
    ).toBe(Date.parse(hold));
    expect(formatRemaining(65_000)).toBe("1:05");
    expect(
      isHoldExpired(
        sampleBooking({
          payment_expires_at: new Date(Date.now() - 1000).toISOString(),
        })
      )
    ).toBe(true);
  });
});

describe("payment handoff persistence", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    const sessionStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    vi.stubGlobal("window", { sessionStorage });
    vi.stubGlobal("sessionStorage", sessionStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores booking_reference/code after create and rejects PII/payment_url", () => {
    const booking = sampleBooking();
    savePendingPaymentBooking(booking);
    const loaded = loadPendingPaymentBooking();
    expect(loaded?.booking_reference).toBe("ZLN-REF-1");
    expect(loaded?.booking_code).toBe("ZLN-CODE-1");
    expect(loaded?.schemaVersion).toBe(PAYMENT_HANDOFF_SCHEMA_VERSION);
    expect(loaded).not.toHaveProperty("guest_email");
    expect(loaded).not.toHaveProperty("payment_url");

    expect(
      parsePendingPaymentHandoff({
        schemaVersion: 2,
        booking_reference: "x",
        booking_code: "y",
        product_type: "day_use",
        guest_email: "nope@example.com",
      })
    ).toBeNull();

    clearPendingPaymentBooking();
    expect(loadPendingPaymentBooking()).toBeNull();
  });
});

describe("BookingCheckoutRunner", () => {
  it("CTA cannot double-create booking", async () => {
    let resolveCreate: (b: ApiBooking) => void = () => undefined;
    const createDayUse = vi.fn(
      () =>
        new Promise<ApiBooking>((resolve) => {
          resolveCreate = resolve;
        })
    );
    const pay = vi.fn(async () => ({
      payment_url: "https://pay.example/ok",
    }));
    const runner = new BookingCheckoutRunner({
      createDayUse,
      pay,
      navigate: vi.fn(),
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });

    const p1 = runner.reserveAndPay(dayUseReady(), TYPES, 250);
    const p2 = runner.reserveAndPay(dayUseReady(), TYPES, 250);
    await Promise.resolve();
    expect(createDayUse).toHaveBeenCalledTimes(1);
    resolveCreate(sampleBooking({ total: "500.00" }));
    await Promise.all([p1, p2]);
    expect(createDayUse).toHaveBeenCalledTimes(1);
    expect(pay).toHaveBeenCalledTimes(1);
  });

  it("server total replaces estimate and stores references", async () => {
    const booking = sampleBooking({
      total: "520.00",
      booking_reference: "REF-A",
      booking_code: "CODE-A",
    });
    const persist = vi.fn();
    const navigate = vi.fn();
    const runner = new BookingCheckoutRunner({
      createDayUse: async () => booking,
      pay: async () => ({ payment_url: "https://pay.example/ok" }),
      persist,
      navigate,
      resolveGateway: () => "paymob",
    });

    await runner.reserveAndPay(dayUseReady(), TYPES, 250);
    expect(runner.state.estimateAtCreate).toBe(500);
    expect(runner.state.booking?.total).toBe("520.00");
    expect(runner.state.booking?.booking_reference).toBe("REF-A");
    expect(runner.state.booking?.booking_code).toBe("CODE-A");
    expect(persist).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("https://pay.example/ok", "REF-A");
  });

  it("expired payment disables pay", async () => {
    const booking = sampleBooking({
      payment_expires_at: new Date(Date.now() - 5_000).toISOString(),
    });
    const pay = vi.fn();
    const runner = new BookingCheckoutRunner({ pay });
    runner.seedBooking(booking);
    await runner.retryPayment();
    expect(pay).not.toHaveBeenCalled();
    expect(runner.state.phase).toBe("expired");
  });

  it("pay request uses existing booking reference and paymob body", async () => {
    const booking = sampleBooking();
    const pay = vi.fn(async (ref: string, gateway: "paymob" | "mock") => {
      expect(ref).toBe(booking.booking_reference);
      expect(gateway).toBe("paymob");
      return { payment_url: "https://pay.example/x" };
    });
    const runner = new BookingCheckoutRunner({
      pay,
      resolveGateway: () => "paymob",
      navigate: vi.fn(),
      persist: vi.fn(),
    });
    runner.seedBooking(booking);
    await runner.retryPayment();
    expect(runner.lastPaymentReference).toBe(booking.booking_reference);
    expect(runner.lastPaymentBody).toEqual({ gateway: "paymob" });
  });

  it("rejects malformed payment_url (no navigation)", async () => {
    const navigate = vi.fn();
    const runner = new BookingCheckoutRunner({
      pay: async () => ({ payment_url: "javascript:evil" }),
      navigate,
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });
    runner.seedBooking(sampleBooking());
    await runner.retryPayment();
    expect(navigate).not.toHaveBeenCalled();
    expect(runner.state.phase).toBe("error");
  });

  it("persists handoff before redirect", async () => {
    const order: string[] = [];
    const runner = new BookingCheckoutRunner({
      pay: async () => {
        order.push("pay");
        return { payment_url: "https://pay.example/ok" };
      },
      persist: () => {
        order.push("persist");
      },
      navigate: () => {
        order.push("navigate");
      },
      resolveGateway: () => "paymob",
    });
    runner.seedBooking(sampleBooking());
    await runner.retryPayment();
    expect(order).toEqual(["pay", "persist", "navigate"]);
  });

  it("retry payment does NOT create a new booking", async () => {
    const createDayUse = vi.fn();
    let payCalls = 0;
    const pay = vi.fn(async () => {
      payCalls += 1;
      if (payCalls === 1) {
        throw new ApiError("temporary failure", 500);
      }
      return { payment_url: "https://pay.example/ok" };
    });
    const runner = new BookingCheckoutRunner({
      createDayUse,
      pay,
      navigate: vi.fn(),
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });
    runner.seedBooking(sampleBooking());
    await runner.retryPayment();
    await runner.retryPayment();
    expect(createDayUse).not.toHaveBeenCalled();
    expect(pay).toHaveBeenCalledTimes(2);
    expect(runner.createCallCount).toBe(0);
  });

  it("409 bubble conflict returns conflict kind and clears booking", async () => {
    const onBubbleConflict = vi.fn();
    const runner = new BookingCheckoutRunner({
      createBubbleStay: async () => {
        throw new ApiError("Bubble unavailable", 409);
      },
      onBubbleConflict,
    });
    await runner.reserveAndPay(bubbleManualReady(), TYPES);
    expect(runner.state.error?.kind).toBe("conflict");
    expect(runner.state.booking).toBeNull();
    expect(onBubbleConflict).toHaveBeenCalled();
  });

  it("422 validation errors are preserved", async () => {
    const runner = new BookingCheckoutRunner({
      createDayUse: async () => {
        throw new ApiError("Day Use is currently disabled", 422, {
          visit_date: ["Day Use is currently disabled"],
        });
      },
    });
    await runner.reserveAndPay(dayUseReady(), TYPES, 250);
    expect(runner.state.error?.status).toBe(422);
    expect(runner.state.error?.fieldErrors?.visit_date?.[0]).toContain(
      "disabled"
    );
    expect(mapCreateError(new ApiError("x", 422)).kind).toBe("validation");
  });

  it("429 handled without automatic request storm", async () => {
    const createDayUse = vi.fn(async () => {
      throw new ApiError("Too many requests", 429);
    });
    const runner = new BookingCheckoutRunner({ createDayUse });
    await runner.reserveAndPay(dayUseReady(), TYPES, 250);
    await runner.reserveAndPay(dayUseReady(), TYPES, 250);
    // Second call allowed only after first finished (error phase), still one attempt each — no auto storm
    expect(createDayUse).toHaveBeenCalledTimes(2);
    expect(runner.state.error?.kind).toBe("rate_limit");
  });

  it("random assignment uses server-returned Bubble after create", async () => {
    const booking = sampleBooking({
      product_type: "bubble_stay",
      bubbles: [
        {
          id: 4,
          name_en: "Horus",
          name_ar: "حورس",
          guests: 2,
        },
      ],
    });
    const runner = new BookingCheckoutRunner({
      createBubbleStay: async () => booking,
      pay: async () => ({ payment_url: "https://pay.example/ok" }),
      navigate: vi.fn(),
      persist: vi.fn(),
      resolveGateway: () => "paymob",
    });
    await runner.create(bubbleRandomReady(), TYPES);
    expect(runner.state.booking?.bubbles[0]?.name_en).toBe("Horus");
  });

  it("maps payment already-paid and expired", () => {
    expect(mapPaymentError(new ApiError("paid", 409)).status).toBe(409);
    expect(mapPaymentError(new ApiError("expired", 422)).status).toBe(422);
  });
});

describe("cleanup safeguards", () => {
  it("no frontend webhook path in payment initiation body helpers", () => {
    const body = buildPaymentInitBody("paymob") as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(["gateway"]);
  });
});
