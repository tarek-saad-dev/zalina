import { loadPendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import { sanitizeBookingReference } from "./bookingReference";

export type BookingRecoverySource =
  | "route"
  | "handoff"
  | "none";

export interface BookingRecoveryResult {
  reference: string | null;
  source: BookingRecoverySource;
}

/**
 * Resolve booking identity for status surfaces.
 * Priority: explicit route → persisted handoff → none.
 * Does not trust arbitrary query parameters (no backend return-query contract).
 */
export function resolveBookingReference(input: {
  routeReference?: string | null;
}): BookingRecoveryResult {
  const fromRoute = sanitizeBookingReference(input.routeReference);
  if (fromRoute) {
    return { reference: fromRoute, source: "route" };
  }

  const handoff = loadPendingPaymentBooking();
  const fromHandoff = sanitizeBookingReference(handoff?.booking_reference);
  if (fromHandoff) {
    return { reference: fromHandoff, source: "handoff" };
  }

  return { reference: null, source: "none" };
}

/**
 * Route reference always wins over stale handoff for API fetches.
 */
export function pickAuthoritativeReference(
  routeReference: string | null | undefined,
  handoffReference: string | null | undefined
): string | null {
  return (
    sanitizeBookingReference(routeReference) ??
    sanitizeBookingReference(handoffReference)
  );
}
