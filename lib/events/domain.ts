/** Bookable Event catalog domain — separate from marketing-only CMS experiences. */
export type EventLocale = "ar" | "en";
export type EventBookingStatus = "open" | "upcoming" | "sold_out" | "closed" | "cancelled";
export type EventPricingMode = "per_person" | "per_package";

export interface EventSummary {
  id: number;
  slug: string;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  cover_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  booking_status: EventBookingStatus;
  starting_price: string | null;
  currency: string;
}
export interface EventOccurrence {
  id: number;
  starts_at: string;
  ends_at: string;
  booking_status: EventBookingStatus;
  label_ar: string | null;
  label_en: string | null;
}
export interface EventPackage {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  includes_ar: string[];
  includes_en: string[];
  price: string;
  currency: string;
  pricing_mode: EventPricingMode;
  guests_per_unit: number;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
}
export interface EventDetail extends EventSummary {
  description_ar: string;
  description_en: string;
  venue_ar: string;
  venue_en: string;
  highlights_ar: string[];
  highlights_en: string[];
  terms_ar: string | null;
  terms_en: string | null;
  gallery_urls: string[];
  occurrences: EventOccurrence[];
  packages: EventPackage[];
}
export interface EventPackageAvailability {
  package_id: number;
  available: boolean;
  remaining_units: number;
  unit_price: string;
  currency: string;
}
export interface EventAvailability {
  occurrence_id: number;
  packages: EventPackageAvailability[];
  checked_at: string | null;
}
type Dict = Record<string, unknown>;
const statuses: EventBookingStatus[] = ["open", "upcoming", "sold_out", "closed", "cancelled"];
function object(raw: unknown): Dict | null {
  return raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw as Dict : null;
}
function string(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}
function nullableString(raw: unknown): string | null {
  return string(raw) || null;
}
function numericId(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
function boundedInt(raw: unknown, fallback: number, lower: number, upper: number): number {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(n) ? Math.min(upper, Math.max(lower, Math.trunc(n))) : fallback;
}
function price(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw).trim();
  if (!/^(?:\d+)(?:\.\d{1,2})?$/.test(s) || !Number.isFinite(Number(s))) return null;
  return s;
}
function status(raw: unknown): EventBookingStatus {
  return statuses.includes(raw as EventBookingStatus) ? raw as EventBookingStatus : "closed";
}
function date(raw: unknown): string | null {
  const s = string(raw);
  return s && /(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s)) ? s : null;
}
function localizedStrings(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map(string).filter(Boolean).slice(0, 30) : [];
}
export function eventMediaUrl(raw: unknown): string | null {
  const url = string(raw);
  if (!url || /[\u0000-\u001f]/.test(url)) return null;
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
export function safeEventSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 120;
}
export function normalizeEventSummary(raw: unknown): EventSummary | null {
  const o = object(raw);
  if (!o) return null;
  const id = numericId(o.id), slug = string(o.slug);
  const title_ar = string(o.title_ar), title_en = string(o.title_en);
  if (!id || !safeEventSlug(slug) || !title_ar || !title_en) return null;
  return {
    id, slug, title_ar, title_en,
    summary_ar: string(o.summary_ar),
    summary_en: string(o.summary_en),
    cover_image_url: eventMediaUrl(o.cover_image_url),
    starts_at: date(o.starts_at),
    ends_at: date(o.ends_at),
    booking_status: status(o.booking_status),
    starting_price: price(o.starting_price),
    currency: string(o.currency) || "EGP",
  };
}
export function normalizeEventList(raw: unknown): EventSummary[] {
  const source = Array.isArray(raw) ? raw : object(raw)?.items;
  if (!Array.isArray(source)) return [];
  return source.map(normalizeEventSummary).filter((x): x is EventSummary => x !== null);
}
export function normalizeEventDetail(raw: unknown): EventDetail | null {
  const base = normalizeEventSummary(raw), o = object(raw);
  if (!base || !o) return null;
  const occurrences: EventOccurrence[] = Array.isArray(o.occurrences)
    ? o.occurrences.flatMap((value) => {
        const entry = object(value);
        if (!entry) return [];
        const id = numericId(entry.id), starts_at = date(entry.starts_at), ends_at = date(entry.ends_at);
        if (!id || !starts_at || !ends_at || Date.parse(ends_at) <= Date.parse(starts_at)) return [];
        return [{
          id, starts_at, ends_at, booking_status: status(entry.booking_status),
          label_ar: nullableString(entry.label_ar), label_en: nullableString(entry.label_en),
        }];
      })
    : [];
  const packages: EventPackage[] = Array.isArray(o.packages)
    ? o.packages.flatMap((value) => {
        const entry = object(value);
        if (!entry) return [];
        const id = numericId(entry.id), p = price(entry.price);
        const name_ar = string(entry.name_ar), name_en = string(entry.name_en);
        if (!id || p === null || !name_ar || !name_en) return [];
        return [{
          id, name_ar, name_en,
          description_ar: string(entry.description_ar),
          description_en: string(entry.description_en),
          includes_ar: localizedStrings(entry.includes_ar),
          includes_en: localizedStrings(entry.includes_en),
          price: p, currency: string(entry.currency) || base.currency,
          pricing_mode: entry.pricing_mode === "per_package" ? "per_package" as const : "per_person" as const,
          guests_per_unit: boundedInt(entry.guests_per_unit, 1, 1, 100),
          min_quantity: boundedInt(entry.min_quantity, 1, 1, 100),
          max_quantity: boundedInt(entry.max_quantity, 20, 1, 100),
          display_order: boundedInt(entry.display_order, 0, 0, 10000),
        }];
      })
    : [];
  return {
    ...base,
    description_ar: string(o.description_ar),
    description_en: string(o.description_en),
    venue_ar: string(o.venue_ar),
    venue_en: string(o.venue_en),
    highlights_ar: localizedStrings(o.highlights_ar),
    highlights_en: localizedStrings(o.highlights_en),
    terms_ar: nullableString(o.terms_ar),
    terms_en: nullableString(o.terms_en),
    gallery_urls: (Array.isArray(o.gallery_urls) ? o.gallery_urls : [])
      .map(eventMediaUrl).filter((url): url is string => url !== null).slice(0, 12),
    occurrences: occurrences.sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at)),
    packages: packages
      .map(p => ({...p, max_quantity: Math.max(p.min_quantity, p.max_quantity)}))
      .sort((a, b) => a.display_order - b.display_order || a.id - b.id),
  };
}
export function normalizeAvailability(raw: unknown, expectedOccurrenceId: number): EventAvailability | null {
  const o = object(raw);
  if (!o || numericId(o.occurrence_id) !== expectedOccurrenceId || !Array.isArray(o.packages)) return null;
  const packages = o.packages.flatMap((item): EventPackageAvailability[] => {
    const entry = object(item);
    if (!entry) return [];
    const id = numericId(entry.package_id), unitPrice = price(entry.unit_price);
    if (!id || unitPrice === null) return [];
    return [{
      package_id: id,
      remaining_units: boundedInt(entry.remaining_units, 0, 0, 1000000),
      available: entry.available === true,
      unit_price: unitPrice,
      currency: string(entry.currency) || "EGP",
    }];
  });
  return { occurrence_id: expectedOccurrenceId, packages, checked_at: date(o.checked_at) };
}
export function localized(entry: object, key: string, locale: EventLocale): string {
  const values = entry as Record<string, unknown>;
  return string(values[`${key}_${locale}`]) || string(values[`${key}_${locale === "ar" ? "en" : "ar"}`]);
}
export function formattedEventDate(value: string | null, locale: EventLocale): string {
  if (!value || !Number.isFinite(Date.parse(value))) return locale === "ar" ? "يُحدد لاحقًا" : "To be announced";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo",
  }).format(new Date(value));
}
export function formattedEventMoney(value: string | null, currency: string, locale: EventLocale): string {
  if (value === null || !Number.isFinite(Number(value))) return locale === "ar" ? "اسأل عن السعر" : "Contact for pricing";
  return `${new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", { maximumFractionDigits: 2 }).format(Number(value))} ${currency}`;
}
