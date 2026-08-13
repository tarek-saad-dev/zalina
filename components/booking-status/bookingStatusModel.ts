import type { ApiBooking, BookingStatus, PaymentStatus } from "@/lib/api";

/** High-level lifecycle buckets for UI + polling decisions. */
export type BookingLifecycleBucket =
  | "waiting"
  | "confirmed_preparing_ticket"
  | "confirmed_ready"
  | "active_visit"
  | "failed"
  | "cancelled"
  | "expired"
  | "unknown";

const WAITING = new Set(["pending_payment", "paid"]);
const ACTIVE_VISIT = new Set([
  "checked_in",
  "checked_out",
  "completed",
  "no_show",
]);
const FAILED = new Set(["failed"]);
const CANCELLED = new Set(["cancelled"]);
const EXPIRED = new Set(["expired"]);
const CONFIRMED_FAMILY = new Set([
  "confirmed",
  "checked_in",
  "checked_out",
  "completed",
  "no_show",
]);

export function normalizeBookingStatus(
  status: string | null | undefined
): string {
  return (status ?? "").trim().toLowerCase();
}

export function classifyBookingStatus(
  status: string | null | undefined
): BookingLifecycleBucket {
  const s = normalizeBookingStatus(status);
  if (WAITING.has(s)) return "waiting";
  if (FAILED.has(s)) return "failed";
  if (CANCELLED.has(s)) return "cancelled";
  if (EXPIRED.has(s)) return "expired";
  if (s === "confirmed") return "confirmed_ready"; // refined with ticket helper
  if (ACTIVE_VISIT.has(s)) return "active_visit";
  return "unknown";
}

export function classifyBooking(booking: ApiBooking): BookingLifecycleBucket {
  const base = classifyBookingStatus(booking.status);
  if (base === "confirmed_ready" || normalizeBookingStatus(booking.status) === "confirmed") {
    if (!isTicketMetadataReady(booking)) {
      return "confirmed_preparing_ticket";
    }
    return "confirmed_ready";
  }
  return base;
}

export function isTicketMetadataReady(booking: ApiBooking): boolean {
  if ((booking.tickets_count ?? 0) > 0) return true;
  if (booking.tickets && booking.tickets.length > 0) return true;
  return false;
}

/** QR only after confirmed/ticket-capable lifecycle with ticket metadata or confirmed family + code. */
export function canShowBookingQr(booking: ApiBooking): boolean {
  const s = normalizeBookingStatus(booking.status);
  if (!booking.booking_code?.trim()) return false;
  if (WAITING.has(s) || FAILED.has(s) || CANCELLED.has(s) || EXPIRED.has(s)) {
    return false;
  }
  if (CONFIRMED_FAMILY.has(s)) {
    // Confirmed without ticket yet: no QR
    if (s === "confirmed" && !isTicketMetadataReady(booking)) return false;
    return true;
  }
  // Unknown status with tickets: allow cautiously
  return isTicketMetadataReady(booking);
}

export function shouldPollBooking(booking: ApiBooking | null): boolean {
  if (!booking) return false;
  const bucket = classifyBooking(booking);
  return (
    bucket === "waiting" ||
    bucket === "confirmed_preparing_ticket"
  );
}

export function isDurableTerminalBooking(booking: ApiBooking): boolean {
  const bucket = classifyBooking(booking);
  return (
    bucket === "confirmed_ready" ||
    bucket === "active_visit" ||
    bucket === "failed" ||
    bucket === "cancelled" ||
    bucket === "expired"
  );
}

export function isHoldStillActive(
  booking: ApiBooking,
  nowMs = Date.now()
): boolean {
  const candidates = [booking.payment_expires_at, booking.hold_expires_at]
    .map((iso) => (iso ? Date.parse(iso) : NaN))
    .filter((t) => Number.isFinite(t));
  if (candidates.length === 0) {
    // No expiry timestamps — allow retry only while pending_payment/failed
    const s = normalizeBookingStatus(booking.status);
    return s === "pending_payment" || s === "failed" || s === "paid";
  }
  return Math.min(...candidates) > nowMs;
}

export function canRetryPayment(booking: ApiBooking): boolean {
  const s = normalizeBookingStatus(booking.status);
  if (s === "expired" || s === "cancelled" || s === "confirmed") return false;
  if (ACTIVE_VISIT.has(s)) return false;
  if (s === "failed" || s === "pending_payment") {
    return isHoldStillActive(booking);
  }
  return false;
}

export function paymentStatusOf(
  booking: ApiBooking
): PaymentStatus | string | undefined {
  return booking.payment?.status;
}

export function isKnownBookingStatus(status: string): status is BookingStatus {
  return [
    "pending_payment",
    "paid",
    "confirmed",
    "checked_in",
    "checked_out",
    "completed",
    "failed",
    "cancelled",
    "expired",
    "no_show",
  ].includes(normalizeBookingStatus(status));
}
