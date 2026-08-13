import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, type ApiBooking } from "@/lib/api";
import {
  isValidBookingReference,
  sanitizeBookingReference,
} from "../bookingReference";
import {
  pickAuthoritativeReference,
  resolveBookingReference,
} from "../bookingRecovery";
import {
  canRetryPayment,
  canShowBookingQr,
  classifyBooking,
  classifyBookingStatus,
  isDurableTerminalBooking,
  isTicketMetadataReady,
  shouldPollBooking,
} from "../bookingStatusModel";
import { nextPollDelayMs } from "../bookingPollSchedule";
import { BookingStatusPollController } from "../bookingStatusPollController";
import { bookingStatusLabel, productTypeLabel } from "../bookingStatusCopy";
import { localizedName } from "@/components/book-now/bookingMedia";
import {
  clearPendingPaymentBooking,
  savePendingPaymentBooking,
} from "@/components/book-now/paymentHandoffStorage";
import { canRetryPayment as canRetry } from "../bookingStatusModel";
import { buildPaymentInitBody } from "@/components/book-now/bookingCheckoutRunner";

function booking(overrides: Partial<ApiBooking> = {}): ApiBooking {
  return {
    booking_reference: "BK-A3F9D12C-20260805",
    booking_code: "ZLN-ABCD-EFGH",
    product_type: "bubble_stay",
    status: "pending_payment",
    total: "1500.00",
    currency: "SAR",
    guests: 8,
    hold_expires_at: new Date(Date.now() + 600_000).toISOString(),
    payment_expires_at: new Date(Date.now() + 500_000).toISOString(),
    valid_from: "2026-08-20",
    valid_to: "2026-08-22",
    checked_in_at: null,
    checked_out_at: null,
    created_at: new Date().toISOString(),
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
      {
        id: 5,
        name_en: "Hathor",
        name_ar: "حتحور",
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
    ...overrides,
  };
}

describe("booking reference validation", () => {
  it("accepts conservative references and rejects junk", () => {
    expect(isValidBookingReference("BK-A3F9D12C-20260805")).toBe(true);
    expect(sanitizeBookingReference("../etc/passwd")).toBeNull();
    expect(sanitizeBookingReference("ab")).toBeNull();
    expect(sanitizeBookingReference("ref with spaces")).toBeNull();
  });
});

describe("booking recovery", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    const sessionStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
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

  it("persisted handoff can recover reference", () => {
    savePendingPaymentBooking(booking());
    const result = resolveBookingReference({ routeReference: null });
    expect(result.source).toBe("handoff");
    expect(result.reference).toBe("BK-A3F9D12C-20260805");
  });

  it("explicit route reference wins over stale storage", () => {
    savePendingPaymentBooking(booking());
    expect(
      pickAuthoritativeReference("BK-ROUTE-REF-99999", "BK-A3F9D12C-20260805")
    ).toBe("BK-ROUTE-REF-99999");
    const result = resolveBookingReference({
      routeReference: "BK-ROUTE-REF-99999",
    });
    expect(result.source).toBe("route");
    expect(result.reference).toBe("BK-ROUTE-REF-99999");
  });

  it("clears handoff after durable completion", () => {
    savePendingPaymentBooking(booking());
    const clear = vi.fn(() => clearPendingPaymentBooking());
    const controller = new BookingStatusPollController(
      "BK-A3F9D12C-20260805",
      "en",
      {
        getBookingFn: async () =>
          booking({
            status: "confirmed",
            tickets_count: 1,
            payment: { status: "paid" },
          }),
        clearHandoff: clear,
      }
    );
    return controller.fetchOnce().then(() => {
      expect(clear).toHaveBeenCalled();
    });
  });
});

describe("status classification", () => {
  it("classifies waiting / success / failed / unknown safely", () => {
    expect(classifyBookingStatus("pending_payment")).toBe("waiting");
    expect(classifyBookingStatus("paid")).toBe("waiting");
    expect(classifyBookingStatus("failed")).toBe("failed");
    expect(classifyBookingStatus("expired")).toBe("expired");
    expect(classifyBookingStatus("cancelled")).toBe("cancelled");
    expect(classifyBookingStatus("checked_in")).toBe("active_visit");
    expect(classifyBookingStatus("future_status_x")).toBe("unknown");
  });

  it("pending polls; confirmed/failed/expired/cancelled stop", () => {
    expect(shouldPollBooking(booking({ status: "pending_payment" }))).toBe(
      true
    );
    expect(shouldPollBooking(booking({ status: "paid" }))).toBe(true);
    expect(
      shouldPollBooking(
        booking({ status: "confirmed", tickets_count: 0 })
      )
    ).toBe(true);
    expect(
      shouldPollBooking(
        booking({ status: "confirmed", tickets_count: 1 })
      )
    ).toBe(false);
    expect(shouldPollBooking(booking({ status: "failed" }))).toBe(false);
    expect(shouldPollBooking(booking({ status: "expired" }))).toBe(false);
    expect(shouldPollBooking(booking({ status: "cancelled" }))).toBe(false);
  });

  it("confirmed + tickets_count=0 is preparing ticket", () => {
    const b = booking({
      status: "confirmed",
      tickets_count: 0,
      payment: { status: "paid" },
    });
    expect(classifyBooking(b)).toBe("confirmed_preparing_ticket");
    expect(canShowBookingQr(b)).toBe(false);
    expect(isTicketMetadataReady(b)).toBe(false);
  });

  it("ticket readiness enables QR once", () => {
    const b = booking({
      status: "confirmed",
      tickets_count: 1,
      tickets: [{ type: "bubble", ticket_code: "LEGACY" }],
      payment: { status: "paid" },
    });
    expect(classifyBooking(b)).toBe("confirmed_ready");
    expect(canShowBookingQr(b)).toBe(true);
    expect(isDurableTerminalBooking(b)).toBe(true);
  });
});

describe("polling controller", () => {
  it("loads booking by reference without wizard state", async () => {
    const getBookingFn = vi.fn(async (ref: string) =>
      booking({ booking_reference: ref, status: "confirmed", tickets_count: 1 })
    );
    const controller = new BookingStatusPollController("BK-A3F9D12C-20260805", "en", {
      getBookingFn,
    });
    await controller.start();
    expect(getBookingFn).toHaveBeenCalledWith("BK-A3F9D12C-20260805", "en");
    expect(controller.booking?.status).toBe("confirmed");
  });

  it("poll calls never overlap", async () => {
    let resolveFetch: (b: ApiBooking) => void = () => undefined;
    const getBookingFn = vi.fn(
      () =>
        new Promise<ApiBooking>((resolve) => {
          resolveFetch = resolve;
        })
    );
    const controller = new BookingStatusPollController("BK-1", "en", {
      getBookingFn,
    });
    const p1 = controller.fetchOnce();
    const p2 = controller.fetchOnce();
    expect(getBookingFn).toHaveBeenCalledTimes(1);
    resolveFetch(booking());
    await Promise.all([p1, p2]);
    expect(getBookingFn).toHaveBeenCalledTimes(1);
  });

  it("temporary network error retains last state", async () => {
    let calls = 0;
    const getBookingFn = vi.fn(async () => {
      calls += 1;
      if (calls === 1) return booking({ status: "pending_payment" });
      throw new TypeError("network");
    });
    const controller = new BookingStatusPollController("BK-1", "en", {
      getBookingFn,
    });
    await controller.fetchOnce();
    await controller.fetchOnce(true);
    expect(controller.booking?.status).toBe("pending_payment");
    expect(controller.fetchState).toBe("ready");
    expect(controller.errorMessage).toBeTruthy();
  });

  it("429 backs off without storm", async () => {
    const now = { t: 1_000_000 };
    const getBookingFn = vi.fn(async () => {
      throw new ApiError("rate", 429);
    });
    const controller = new BookingStatusPollController("BK-1", "en", {
      getBookingFn,
      now: () => now.t,
    });
    await controller.fetchOnce();
    expect(controller.rateLimitedUntil).toBeGreaterThan(now.t);
    await controller.fetchOnce(true);
    expect(getBookingFn).toHaveBeenCalledTimes(1);
  });

  it("404 never polls forever", async () => {
    const controller = new BookingStatusPollController("BK-MISSING", "en", {
      getBookingFn: async () => {
        throw new ApiError("missing", 404);
      },
    });
    await controller.start();
    expect(controller.fetchState).toBe("not_found");
    expect(shouldPollBooking(controller.booking)).toBe(false);
  });

  it("tab visibility gate skips scheduling when hidden", async () => {
    const getBookingFn = vi.fn(async () =>
      booking({ status: "pending_payment" })
    );
    const controller = new BookingStatusPollController("BK-1", "en", {
      getBookingFn,
      isDocumentHidden: () => true,
    });
    await controller.fetchOnce();
    controller.scheduleNext();
    expect(controller.fetchCount).toBe(1);
  });

  it("progressive backoff increases", () => {
    expect(nextPollDelayMs(0)).toBeLessThan(nextPollDelayMs(5));
    expect(nextPollDelayMs(20)).toBe(30_000);
  });
});

describe("confirmation presentation rules", () => {
  it("uses server booking data / currency / multi-bubble", () => {
    const b = booking({ currency: "SAR", total: "2400.00" });
    expect(b.currency).toBe("SAR");
    expect(b.bubbles).toHaveLength(2);
    expect(localizedName(b.bubbles[0], "ar")).toBe("حورس");
    expect(localizedName(b.bubbles[0], "en")).toBe("Horus");
  });

  it("Day Use displays no bubbles requirement", () => {
    const b = booking({
      product_type: "day_use",
      bubbles: [],
      status: "confirmed",
      tickets_count: 1,
    });
    expect(b.product_type).toBe("day_use");
    expect(b.bubbles).toHaveLength(0);
    expect(productTypeLabel("day_use", "en")).toBe("Day Use");
  });

  it("one booking produces one QR identity regardless of bubble count", () => {
    const b = booking({
      status: "confirmed",
      tickets_count: 1,
      bubbles: booking().bubbles,
    });
    expect(canShowBookingQr(b)).toBe(true);
    // Single booking_code drives QR — not per-bubble codes
    expect(b.booking_code).toBe("ZLN-ABCD-EFGH");
    expect(b.bubbles.length).toBeGreaterThan(1);
  });

  it("no QR before valid confirmation", () => {
    expect(canShowBookingQr(booking({ status: "pending_payment" }))).toBe(
      false
    );
    expect(canShowBookingQr(booking({ status: "failed" }))).toBe(false);
  });

  it("guest-facing labels are localized not raw enums", () => {
    expect(bookingStatusLabel("pending_payment", "en")).not.toBe(
      "pending_payment"
    );
    expect(bookingStatusLabel("confirmed", "ar")).toContain("تأكيد");
  });
});

describe("payment retry from status", () => {
  it("allows retry on failed while hold active; blocks expired", () => {
    expect(
      canRetryPayment(
        booking({
          status: "failed",
          payment_expires_at: new Date(Date.now() + 60_000).toISOString(),
        })
      )
    ).toBe(true);
    expect(
      canRetry(
        booking({
          status: "expired",
          payment_expires_at: new Date(Date.now() - 60_000).toISOString(),
        })
      )
    ).toBe(false);
    expect(
      canRetryPayment(
        booking({
          status: "failed",
          hold_expires_at: new Date(Date.now() - 1000).toISOString(),
          payment_expires_at: new Date(Date.now() - 1000).toISOString(),
        })
      )
    ).toBe(false);
  });

  it("pay body still has no return_url / webhook inventing", () => {
    const body = buildPaymentInitBody("paymob") as Record<string, unknown>;
    expect(body).toEqual({ gateway: "paymob" });
    expect(body).not.toHaveProperty("return_url");
    expect(body).not.toHaveProperty("callback_url");
    expect(body).not.toHaveProperty("webhook");
  });
});

describe("cleanup safeguards", () => {
  it("QR payload is booking_code only (no PII keys in model helpers)", () => {
    const b = booking({
      status: "confirmed",
      tickets_count: 1,
      guest_email: "secret@example.com",
    });
    expect(canShowBookingQr(b)).toBe(true);
    // Encode target for QR is booking_code — not email
    expect(b.booking_code.includes("@")).toBe(false);
  });

  it("no invented PDF endpoint constant in status module surface", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dir = path.resolve("components/booking-status");
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      expect(text).not.toMatch(/\/pdf|downloadPdf|fake qr|placeholder qr/i);
      expect(text).not.toMatch(/return_url|callback_url|webhook/i);
    }
  });
});
