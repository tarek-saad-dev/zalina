import { afterEach, describe, expect, it, vi } from "vitest";
import { parsePendingPaymentHandoff, savePendingPaymentBooking, loadPendingPaymentBooking, clearPendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import { resolveBookingReference } from "../bookingRecovery";
import type { EventBooking } from "@/lib/api/events";
import type { ApiBooking } from "@/lib/api";

afterEach(() => vi.unstubAllGlobals());

const handoff = { schemaVersion: 2, booking_reference: "EV-1", booking_code: "EV-1", product_type: "event", created_at: "2026-01-01", hold_expires_at: null, payment_expires_at: null, total: "100", currency: "EGP" };
describe("payment recovery handoff", () => {
  it.each(["event", "day_use", "bubble_stay", "wedding"])("accepts %s references", product_type => {
    expect(parsePendingPaymentHandoff({ ...handoff, product_type })?.product_type).toBe(product_type);
  });
  it.each(["guest_name", "guest_email", "guest_phone", "payment_url"])("rejects stored %s", key => {
    expect(parsePendingPaymentHandoff({ ...handoff, [key]: "private" })).toBeNull();
  });
});

describe("generic payment return recovery", () => {
  function installStorage() {
    const data = new Map<string, string>();
    vi.stubGlobal("window", { sessionStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) } });
    return data;
  }
  it.each(["event", "day_use", "bubble_stay", "wedding"])("recovers %s after a generic return without storing PII", product_type => {
    const data = installStorage();
    const booking = { ...handoff, booking_reference: "ZALINA-TEST-001", product_type, guest_name: "Fixture", guest_email: "fixture@example.invalid", guest_phone: "000000000", payment_url: "https://example.invalid" } as unknown as ApiBooking | EventBooking;
    savePendingPaymentBooking(booking);
    expect(loadPendingPaymentBooking()?.product_type).toBe(product_type);
    expect(resolveBookingReference({ routeReference: null })).toEqual({ reference: "ZALINA-TEST-001", source: "handoff" });
    const serialized = [...data.values()].join("");
    for (const key of ["guest_name", "guest_email", "guest_phone", "payment_url"]) expect(serialized).not.toContain(key);
    expect(resolveBookingReference({ routeReference: "ZALINA-TEST-002" })).toEqual({ reference: "ZALINA-TEST-002", source: "route" });
    clearPendingPaymentBooking("ZALINA-TEST-002");
    expect(loadPendingPaymentBooking()?.booking_reference).toBe("ZALINA-TEST-001");
    clearPendingPaymentBooking("ZALINA-TEST-001");
    expect(resolveBookingReference({ routeReference: null })).toEqual({ reference: null, source: "none" });
  });
});
