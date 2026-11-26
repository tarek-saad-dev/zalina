import { describe, expect, it } from "vitest";
import { parsePendingPaymentHandoff } from "@/components/book-now/paymentHandoffStorage";

const handoff = { schemaVersion: 2, booking_reference: "EV-1", booking_code: "EV-1", product_type: "event", created_at: "2026-01-01", hold_expires_at: null, payment_expires_at: null, total: "100", currency: "EGP" };
describe("payment recovery handoff", () => {
  it.each(["event", "day_use", "bubble_stay", "wedding"])("accepts %s references", product_type => {
    expect(parsePendingPaymentHandoff({ ...handoff, product_type })?.product_type).toBe(product_type);
  });
  it.each(["guest_name", "guest_email", "guest_phone", "payment_url"])("rejects stored %s", key => {
    expect(parsePendingPaymentHandoff({ ...handoff, [key]: "private" })).toBeNull();
  });
});
