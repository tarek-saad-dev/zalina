import { apiFetch } from "./client";
import type { ApiPaymentSession, PaymentGateway } from "./booking-types";
import { resolveApiLocale } from "./locale";

/**
 * POST /bookings/{reference}/pay
 * Starts (or reuses) a payment session for an existing booking hold.
 * Does not create a new booking.
 */
export async function initiatePayment(
  reference: string,
  gateway: PaymentGateway,
  locale?: string
): Promise<ApiPaymentSession> {
  return apiFetch<ApiPaymentSession>(`/bookings/${reference}/pay`, {
    method: "POST",
    locale: resolveApiLocale(locale),
    body: { gateway },
    cache: "no-store",
  });
}
