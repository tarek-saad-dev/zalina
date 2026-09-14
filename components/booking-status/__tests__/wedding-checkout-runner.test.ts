import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { runWeddingCheckout } from "@/sections/weddings/weddingCheckoutRunner";
import type { ApiBooking } from "@/lib/api";

describe("runWeddingCheckout", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts only allowed wedding fields then initiates payment", async () => {
    const createWedding = vi.fn(async (payload: unknown) => {
      expect(payload).toEqual({
        wedding_package_id: 2,
        wedding_date: "2026-11-12",
        guests: 150,
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        guest_phone: "+201000000000",
      });
      const keys = Object.keys(payload as object);
      expect(keys.sort()).toEqual(
        [
          "guest_email",
          "guest_name",
          "guest_phone",
          "guests",
          "wedding_date",
          "wedding_package_id",
        ].sort()
      );
      expect(payload).not.toHaveProperty("total");
      expect(payload).not.toHaveProperty("currency");
      expect(payload).not.toHaveProperty("add_ons");

      return {
        booking_reference: "WED-REF-1",
        booking_code: "WQR1",
        product_type: "wedding",
        status: "pending_payment",
        total: "14250.00",
        currency: "USD",
        guests: 150,
        hold_expires_at: null,
        payment_expires_at: null,
        valid_from: "2026-11-12",
        valid_to: "2026-11-12",
        checked_in_at: null,
        checked_out_at: null,
        created_at: "2026-09-11T12:00:00Z",
        bubbles: [],
        wedding_date: "2026-11-12",
        wedding_package_id: 2,
      } satisfies ApiBooking;
    });

    const pay = vi.fn(async () => ({
      payment_url: "https://pay.example.com/session/1",
    }));
    const navigate = vi.fn();

    const result = await runWeddingCheckout({
      payload: {
        wedding_package_id: 2,
        wedding_date: "2026-11-12",
        guests: 150,
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        guest_phone: "+201000000000",
      },
      createWedding: createWedding as never,
      pay: pay as never,
      navigate: navigate as never,
      gateway: "mock",
    });

    expect(result.ok).toBe(true);
    expect(createWedding).toHaveBeenCalledTimes(1);
    expect(pay).toHaveBeenCalledWith("WED-REF-1", "mock", undefined);
    expect(navigate).toHaveBeenCalledWith({
      paymentUrl: "https://pay.example.com/session/1",
      bookingReference: "WED-REF-1",
    });
  });

  it("retries payment only when existingBooking is provided", async () => {
    const existing = {
      booking_reference: "WED-REF-HELD",
      booking_code: "WQR2",
      product_type: "wedding",
      status: "pending_payment",
      total: "14250.00",
      currency: "USD",
      guests: 150,
      hold_expires_at: null,
      payment_expires_at: null,
      valid_from: "2026-11-12",
      valid_to: "2026-11-12",
      checked_in_at: null,
      checked_out_at: null,
      created_at: "2026-09-11T12:00:00Z",
      bubbles: [],
      wedding_date: "2026-11-12",
      wedding_package_id: 2,
    } satisfies ApiBooking;

    const createWedding = vi.fn();
    const pay = vi.fn(async () => ({
      payment_url: "https://pay.example.com/session/2",
    }));
    const navigate = vi.fn();

    const result = await runWeddingCheckout({
      existingBooking: existing,
      payload: {
        wedding_package_id: 2,
        wedding_date: "2026-11-12",
        guests: 150,
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        guest_phone: "+201000000000",
      },
      createWedding: createWedding as never,
      pay: pay as never,
      navigate: navigate as never,
      gateway: "mock",
    });

    expect(result.ok).toBe(true);
    expect(createWedding).not.toHaveBeenCalled();
    expect(pay).toHaveBeenCalledWith("WED-REF-HELD", "mock", undefined);
  });
});
