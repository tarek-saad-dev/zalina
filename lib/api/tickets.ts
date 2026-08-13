import { apiFetch } from "./client";
import { normalizeTicketLookup, type RawTicketLookup } from "./adapters";
import type { BookingTicketLookup } from "./booking-types";
import { resolveApiLocale } from "./locale";

/**
 * GET /tickets/{code}
 * Booking-level QR / booking_code lookup (one booking → one code).
 */
export async function getTicketByBookingCode(
  code: string,
  locale?: string
): Promise<BookingTicketLookup> {
  const raw = await apiFetch<RawTicketLookup>(`/tickets/${code}`, {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return normalizeTicketLookup(raw);
}
