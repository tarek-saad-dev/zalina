import type { EventAvailabilityState } from "./events";

export function eventCanPurchase(event: { availability_state: EventAvailabilityState; purchase_enabled: boolean }): boolean {
  return event.availability_state === "booking_open" && event.purchase_enabled;
}

export function eventDeadlinePassed(hold: string | null, payment: string | null): boolean {
  return [hold, payment].some(value => value !== null && (!Number.isFinite(Date.parse(value)) || Date.parse(value) <= Date.now()));
}
