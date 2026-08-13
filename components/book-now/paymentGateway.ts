import type { PaymentGateway } from "@/lib/api";

/**
 * Production browser flow must use paymob.
 * Mock is allowed only outside production (local/testing).
 */
export function resolvePaymentGateway(): PaymentGateway {
  if (process.env.NODE_ENV === "production") {
    return "paymob";
  }
  const raw = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY?.trim().toLowerCase();
  if (raw === "mock") return "mock";
  return "paymob";
}
