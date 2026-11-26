import { apiFetch } from "./client";

export type EventAvailabilityState = "sales_not_open" | "booking_open" | "sold_out" | "sales_closed" | "archived" | "cancelled" | "feature_disabled";
export interface EventAnnouncement {
  type: "card" | "banner"; title_en: string; title_ar: string;
  description_en: string | null; description_ar: string | null; image_url: string | null;
  event_edition_id: number; edition_slug: string; landing_path: string;
}
export interface EventPackage {
  id: number; name_en: string; name_ar: string; description_en: string | null; description_ar: string | null;
  guests_per_package: number; website_price: string; image_url: string | null;
  is_purchasable: boolean; remaining_units: number | null; max_purchasable_units: number | null; is_active: boolean;
}
export interface EventEdition {
  availability_state: Exclude<EventAvailabilityState, "archived" | "cancelled" | "feature_disabled">; slug: string; event_edition_id: number;
  name_en: string; name_ar: string; description_en: string | null; description_ar: string | null;
  cover_url: string | null; gallery: { url: string | null; sort_order: number }[];
  event_starts_at: string | null; event_ends_at: string | null; admission_opens_at: string | null;
  admission_closes_at: string | null; sales_opens_at: string | null; sales_closes_at: string | null;
  currency: string; packages: EventPackage[]; remaining_guest_capacity: number;
  public_sales_enabled: boolean; purchase_enabled: boolean; is_preview?: boolean;
}
export interface EventStatusOnly {
  availability_state: "archived" | "cancelled"; slug: string; event_edition_id: number;
  name_en: string; name_ar: string; is_cancelled: boolean; public_sales_enabled: boolean; purchase_enabled: false;
}
export interface EventAvailability {
  availability_state: EventAvailabilityState; remaining_guest_capacity: number; sales_enabled: boolean;
  packages: Pick<EventPackage, "id" | "remaining_units" | "is_purchasable" | "max_purchasable_units">[];
}
export interface EventBookingInput {
  event_edition_id: number; packages: { package_id: number; quantity: number }[];
  guest_name: string; guest_email: string; guest_phone: string;
}
export interface EventTicket {
  ticket_code: string; type?: string; package_name_en: string; package_name_ar: string;
  guests_per_package: number; status: "valid" | "invalidated"; valid_from?: string | null; valid_to?: string | null; lookup_path?: string | null;
}
export interface EventBooking {
  booking_reference: string; booking_code: string; product_type: "event"; status: string;
  operational_status: string | null; total: string; currency: string; guests: number;
  hold_expires_at: string | null; payment_expires_at: string | null; valid_from: string | null; valid_to: string | null;
  event_edition_id?: number; event_edition?: { id: number; slug: string; name_en: string; name_ar: string; event_starts_at: string | null; event_ends_at: string | null; admission_opens_at: string | null; admission_closes_at: string | null; is_cancelled: boolean; status: string } | null;
  event_items?: { package_id: number; package_name_en: string; package_name_ar: string; quantity_purchased: number; quantity_active: number; quantity_cancelled?: number; guests_per_package: number; applied_unit_price: string; line_subtotal: string; currency?: string }[];
  ticket_fulfillment_status?: "pending" | "processing" | "completed" | "failed" | null;
  tickets?: EventTicket[]; tickets_count?: number; requires_payment?: boolean; zero_total_confirmed?: boolean;
}
export type EventPreviewScope = "landing" | "card" | "banner";

/** Only accept the canonical same-site path for the supplied slug. */
export function eventLandingPath(path: string, slug: string): string | null {
  return /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(slug) && path === `/events/${slug}` ? path : null;
}

type CapacityPackage = Pick<EventPackage, "id" | "guests_per_package" | "is_purchasable" | "remaining_units" | "max_purchasable_units">;
export function eventQuantitiesValid(packages: CapacityPackage[], quantities: Record<string, number>, capacity: number | null): boolean {
  // Shared capacity is mandatory; only per-package caps may be null.
  if (capacity === null || !Number.isSafeInteger(capacity) || capacity < 0) return false;
  const validCap = (value: number | null) => value === null || (Number.isSafeInteger(value) && value >= 0);
  let guests = 0, selected = 0;
  for (const [id, quantity] of Object.entries(quantities)) {
    const packageId = Number(id);
    if (!Number.isSafeInteger(packageId) || packageId <= 0 || String(packageId) !== id ||
        !Number.isSafeInteger(quantity) || quantity < 0) return false;
    if (!quantity) continue;
    const matches = packages.filter(p => p.id === packageId);
    const item = matches[0];
    if (matches.length !== 1 || !item || item.is_purchasable !== true ||
        !Number.isSafeInteger(item.guests_per_package) || item.guests_per_package <= 0 ||
        !validCap(item.remaining_units) || !validCap(item.max_purchasable_units) ||
        (item.remaining_units !== null && quantity > item.remaining_units) ||
        (item.max_purchasable_units !== null && quantity > item.max_purchasable_units)) return false;
    guests += quantity * item.guests_per_package;
    selected += quantity;
    if (!Number.isSafeInteger(guests) || !Number.isSafeInteger(selected)) return false;
  }
  return selected > 0 && guests <= capacity;
}
export function getEventAnnouncement(locale?: string) { return apiFetch<EventAnnouncement | null>("/events/announcement", { locale, cache: "no-store" }); }
export function getEventEdition(slug: string, locale?: string) { return apiFetch<EventEdition | EventStatusOnly>(`/events/editions/${encodeURIComponent(slug)}`, { locale, cache: "no-store" }); }
export function getEventAvailability(slug: string, locale?: string) { return apiFetch<EventAvailability>(`/events/editions/${encodeURIComponent(slug)}/availability`, { locale, cache: "no-store" }); }
export function getEventPreview(scope: EventPreviewScope, token: string, locale?: string) {
  return apiFetch<(EventEdition & { is_preview: true; preview_scope: "landing" }) | (EventAnnouncement & { is_preview: true; preview_scope: "card" | "banner" })>(`/events/preview/${scope}`, { locale, headers: { "X-Event-Preview-Token": token }, cache: "no-store" });
}
export function createEventBooking(input: EventBookingInput, locale?: string) {
  const ids = new Set<number>();
  if (!Number.isSafeInteger(input.event_edition_id) || input.event_edition_id <= 0 || !input.packages.length || input.packages.some(p => !Number.isSafeInteger(p.package_id) || p.package_id <= 0 || !Number.isSafeInteger(p.quantity) || p.quantity <= 0 || ids.has(p.package_id) || !ids.add(p.package_id))) throw new Error("Invalid event packages");
  const body = { product_type: "event", event_edition_id: input.event_edition_id, packages: input.packages.map(({ package_id, quantity }) => ({ package_id, quantity })), guest_name: input.guest_name, guest_email: input.guest_email, guest_phone: input.guest_phone };
  return apiFetch<EventBooking>("/bookings", { method: "POST", locale, body, cache: "no-store" });
}
