import type { EventAvailabilityState, EventBooking } from "./events";

export function eventCanPurchase(event: { availability_state: EventAvailabilityState; purchase_enabled: boolean }): boolean {
  return event.availability_state === "booking_open" && event.purchase_enabled;
}

export function eventDeadlinePassed(hold: string | null, payment: string | null): boolean {
  return [hold, payment].some(value => value !== null && (!Number.isFinite(Date.parse(value)) || Date.parse(value) <= Date.now()));
}

/** Payment confirmation and ticket delivery are separate backend lifecycles. */
export function shouldPollEventBooking(booking: EventBooking | null): boolean {
  if (!booking) return true;
  if (booking.status === "pending_payment") return !eventDeadlinePassed(booking.hold_expires_at, booking.payment_expires_at);
  if (["cancelled", "expired", "failed", "no_show"].includes(booking.status)) return false;
  return booking.status === "paid" || booking.ticket_fulfillment_status === "pending" || booking.ticket_fulfillment_status === "processing";
}

export function canPayEventBooking(booking: EventBooking | null, fresh: boolean): boolean {
  return Boolean(fresh && booking && booking.status === "pending_payment" &&
    booking.requires_payment === true && /^\d+(?:\.\d+)?$/.test(booking.total) &&
    /[1-9]/.test(booking.total) &&
    !eventDeadlinePassed(booking.hold_expires_at, booking.payment_expires_at));
}
