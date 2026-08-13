/**
 * Payment URL helpers for handoff navigation.
 * Does not invent Paymob return_url request fields.
 */

/** Ephemeral mock checkout URL — not part of zalina.booking.payment.v2 handoff. */
export const MOCK_CHECKOUT_URL_STORAGE_KEY = "zalina.booking.mock_checkout_url";

export function isSafePaymentUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** Local/testing mock hosted page — has no guest browser return redirect. */
export function isMockPaymentUrl(url: string): boolean {
  if (!isSafePaymentUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.pathname.includes("/mock-pay") ||
      (parsed.searchParams.has("txn") && parsed.pathname.endsWith("/mock-pay"))
    );
  } catch {
    return false;
  }
}

export function bookingStatusPath(bookingReference: string): string {
  return `/booking/${encodeURIComponent(bookingReference)}`;
}

export function stashMockCheckoutUrl(url: string): void {
  if (!isMockPaymentUrl(url)) return;
  try {
    sessionStorage.setItem(MOCK_CHECKOUT_URL_STORAGE_KEY, url);
  } catch {
    // ignore quota / private mode
  }
}

export function consumeMockCheckoutUrl(): string | null {
  try {
    const url = sessionStorage.getItem(MOCK_CHECKOUT_URL_STORAGE_KEY);
    sessionStorage.removeItem(MOCK_CHECKOUT_URL_STORAGE_KEY);
    if (url && isMockPaymentUrl(url)) return url;
    return null;
  } catch {
    return null;
  }
}

export function peekMockCheckoutUrl(): string | null {
  try {
    const url = sessionStorage.getItem(MOCK_CHECKOUT_URL_STORAGE_KEY);
    if (url && isMockPaymentUrl(url)) return url;
    return null;
  } catch {
    return null;
  }
}

/**
 * After /pay succeeds:
 * - Mock gateway: land status page only (mock-pay never redirects back).
 *   Checkout URL is stashed ephemerally so the status page can open it
 *   without racing window.open against location.assign.
 * - Paymob/other hosted: full redirect to payment_url (return URL is server/dashboard-configured).
 */
export function navigateAfterPaymentInitiation(input: {
  paymentUrl: string;
  bookingReference: string;
  open?: (url: string, target?: string, features?: string) => Window | null;
  assign?: (url: string) => void;
  stashMockUrl?: (url: string) => void;
}): void {
  const assign =
    input.assign ?? ((url) => window.location.assign(url));
  const stash = input.stashMockUrl ?? stashMockCheckoutUrl;

  if (isMockPaymentUrl(input.paymentUrl)) {
    stash(input.paymentUrl);
    assign(bookingStatusPath(input.bookingReference));
    return;
  }

  assign(input.paymentUrl);
}
