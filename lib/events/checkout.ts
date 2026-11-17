import type { ApiBooking, CreateEventBookingPayload } from "@/lib/api/booking-types";
import type {
  EventAvailability,
  EventDetail,
  EventPackage,
  EventOccurrence,
} from "./domain";

export interface EventGuestDetails {
  name: string;
  email: string;
  phone: string;
}

export interface EventCheckoutSelection {
  occurrence: EventOccurrence;
  package: EventPackage;
  quantity: number;
  guests: number;
}

export type EventSelectionResult =
  | { ok: true; selection: EventCheckoutSelection }
  | { ok: false; reason: "closed" | "invalid" | "sold_out" | "unavailable" };

export function positiveInt(value: unknown): number | null {
  const number = typeof value === "string" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isSafeInteger(number) || number < 1) return null;
  return number;
}

/** Select only an event-owned occurrence/package; route query never becomes authority. */
export function findEventSelection(
  event: EventDetail,
  occurrenceId: unknown,
  packageId: unknown,
  quantityInput: unknown,
  availability?: EventAvailability | null
): EventSelectionResult {
  const occurrence = event.occurrences.find(o => o.id === positiveInt(occurrenceId));
  const pkg = event.packages.find(p => p.id === positiveInt(packageId));
  const quantity = positiveInt(quantityInput);
  if (!occurrence || !pkg || !quantity ||
    quantity < pkg.min_quantity || quantity > pkg.max_quantity) {
    return { ok: false, reason: "invalid" };
  }
  if (event.booking_status !== "open" || occurrence.booking_status !== "open") {
    return { ok: false, reason: "closed" };
  }
  if (availability) {
    if (availability.occurrence_id !== occurrence.id) return { ok: false, reason: "unavailable" };
    const line = availability.packages.find(item => item.package_id === pkg.id);
    if (!line || !line.available || line.remaining_units < quantity) {
      return { ok: false, reason: "sold_out" };
    }
  }
  const guests = quantity * pkg.guests_per_unit;
  if (!Number.isSafeInteger(guests) || guests < 1) return { ok: false, reason: "invalid" };
  return { ok: true, selection: { occurrence, package: pkg, quantity, guests } };
}

export function validateEventGuest(guest: EventGuestDetails): Record<keyof EventGuestDetails, string | null> {
  const name = guest.name.trim();
  const email = guest.email.trim();
  const phone = guest.phone.trim();
  return {
    name: name.length >= 2 && name.length <= 120 ? null : "name",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? null : "email",
    phone: /^\+?[0-9\s()\-]{7,22}$/.test(phone) && phone.replace(/\D/g, "").length >= 7 ? null : "phone",
  };
}

export function eventGuestIsValid(guest: EventGuestDetails): boolean {
  return Object.values(validateEventGuest(guest)).every(value => value === null);
}

export function buildEventBookingPayload(
  selection: EventCheckoutSelection,
  guest: EventGuestDetails
): CreateEventBookingPayload {
  if (!eventGuestIsValid(guest)) throw new Error("Guest details are invalid");
  return {
    product_type: "event",
    event_occurrence_id: selection.occurrence.id,
    items: [{ event_package_id: selection.package.id, quantity: selection.quantity }],
    guests: selection.guests,
    guest_name: guest.name.trim(),
    guest_email: guest.email.trim(),
    guest_phone: guest.phone.trim(),
  };
}

/** Money for display only. Never sent as an authoritative booking total. */
export function estimateEventTotal(
  availability: EventAvailability | null,
  selection: EventCheckoutSelection
): string | null {
  if (!availability || availability.occurrence_id !== selection.occurrence.id) return null;
  const line = availability.packages.find(item => item.package_id === selection.package.id);
  if (!line || !line.available || line.remaining_units < selection.quantity) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(line.unit_price)) return null;
  const [whole, fraction = ""] = line.unit_price.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  const total = cents * selection.quantity;
  return Number.isSafeInteger(total) ? (total / 100).toFixed(2) : null;
}

export function bookingHoldDeadline(booking: Pick<ApiBooking, "hold_expires_at" | "payment_expires_at">): number | null {
  const valid = [booking.hold_expires_at, booking.payment_expires_at]
    .map(value => value ? Date.parse(value) : NaN)
    .filter(Number.isFinite);
  return valid.length ? Math.min(...valid) : null;
}

export function isBookingHoldExpired(
  booking: Pick<ApiBooking, "hold_expires_at" | "payment_expires_at">,
  now = Date.now()
): boolean {
  const deadline = bookingHoldDeadline(booking);
  return deadline !== null && deadline <= now;
}

export function formatHoldRemaining(deadline: number | null, now = Date.now()): string | null {
  if (deadline === null) return null;
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Require production payment redirect to HTTPS; local http is dev-only. */
export function securePaymentLink(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.toString();
    if (process.env.NODE_ENV !== "production" && url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return url.toString();
    return null;
  } catch {
    return null;
  }
}
