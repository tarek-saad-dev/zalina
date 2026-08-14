import type { PaymentGateway } from "@/lib/api";

/**
 * Explicit frontend gateway selector via NEXT_PUBLIC_PAYMENT_GATEWAY.
 * Supported: mock | paymob. Missing/invalid → paymob (safe default).
 * Do not derive gateway from NODE_ENV — Vercel Preview is a production build.
 */
export function resolvePaymentGateway(): PaymentGateway {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY?.trim().toLowerCase();
  if (raw === "mock") return "mock";
  if (raw === "paymob") return "paymob";
  return "paymob";
}
