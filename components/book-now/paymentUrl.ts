/**
 * Payment URL helpers for handoff navigation.
 * Does not invent Paymob return_url request fields.
 * Does not host a frontend mock payment page — use backend payment_url as-is.
 */

export function isSafePaymentUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * After /pay succeeds and handoff is persisted:
 * full-browser redirect to the exact backend `payment_url`.
 */
export function navigateAfterPaymentInitiation(input: {
  paymentUrl: string;
  bookingReference: string;
  assign?: (url: string) => void;
}): void {
  const assign =
    input.assign ?? ((url) => window.location.assign(url));
  assign(input.paymentUrl);
}
