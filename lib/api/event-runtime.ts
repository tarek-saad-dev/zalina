import type { EventAvailability, EventEdition, EventStatusOnly } from "./events";

const object = (v: unknown): v is Record<string, any> => !!v && typeof v === "object" && !Array.isArray(v);
const cap = (v: unknown) => Number.isSafeInteger(v) && (v as number) >= 0;
const nullableCap = (v: unknown) => v === null || cap(v);
const date = (v: unknown) => v === null || (typeof v === "string" && Number.isFinite(Date.parse(v)));
const dates = (v: Record<string, any>, keys: string[]) => keys.every(k => date(v[k]));
const states = ["sales_not_open", "booking_open", "sold_out", "sales_closed", "archived", "cancelled"];
export function isEventLanding(v: unknown): v is EventEdition | EventStatusOnly {
  if (!object(v) || !states.includes(v.availability_state) || typeof v.slug !== "string" || typeof v.name_en !== "string" || typeof v.name_ar !== "string") return false;
  if (v.availability_state === "archived" || v.availability_state === "cancelled") return true;
  return Array.isArray(v.packages) && Array.isArray(v.gallery) && cap(v.remaining_guest_capacity) &&
    dates(v, ["event_starts_at", "event_ends_at", "admission_opens_at", "admission_closes_at", "sales_opens_at", "sales_closes_at"]) &&
    v.gallery.every((g: unknown) => object(g) && (g.url === null || typeof g.url === "string")) &&
    v.packages.every((p: unknown) => object(p) && cap(p.id) && p.id > 0 && cap(p.guests_per_package) && p.guests_per_package > 0 && nullableCap(p.remaining_units) && nullableCap(p.max_purchasable_units) && typeof p.website_price === "string" && typeof p.is_active === "boolean" && typeof p.is_purchasable === "boolean");
}
export function isEventAvailability(v: unknown): v is EventAvailability {
  return object(v) && [...states, "feature_disabled"].includes(v.availability_state) && typeof v.sales_enabled === "boolean" && cap(v.remaining_guest_capacity) && Array.isArray(v.packages) && v.packages.every((p: unknown) => object(p) && cap(p.id) && p.id > 0 && nullableCap(p.remaining_units) && nullableCap(p.max_purchasable_units) && typeof p.is_purchasable === "boolean");
}
export function isEventBooking(v: unknown): boolean {
  if (!object(v) || v.product_type !== "event" || typeof v.booking_reference !== "string" || !v.booking_reference || typeof v.booking_code !== "string" || !v.booking_code || typeof v.status !== "string" || typeof v.total !== "string" || !/^\d+(?:\.\d+)?$/.test(v.total) || typeof v.currency !== "string" || !cap(v.guests) || !date(v.hold_expires_at) || !date(v.payment_expires_at)) return false;
  if (v.event_edition != null && (!object(v.event_edition) || !dates(v.event_edition, ["event_starts_at", "admission_opens_at"]))) return false;
  if (v.event_items !== undefined && (!Array.isArray(v.event_items) || !v.event_items.every(object))) return false;
  if (v.tickets !== undefined && (!Array.isArray(v.tickets) || !v.tickets.every((t: unknown) => object(t) && typeof t.ticket_code === "string" && !!t.ticket_code && typeof t.package_name_en === "string" && typeof t.package_name_ar === "string" && cap(t.guests_per_package) && t.guests_per_package > 0 && ["valid", "invalidated"].includes(t.status) && (t.valid_from == null || date(t.valid_from)) && (t.valid_to == null || date(t.valid_to))))) return false;
  return true;
}
