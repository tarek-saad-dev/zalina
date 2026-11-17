import { apiFetch } from "./client";
import { resolveApiLocale } from "./locale";

export type AddOnTicketCategory = "day_use" | "observatory_experience" | "cabin_stay";
export interface BookableTicketAddOn {
  id: number;
  code: "lantern";
  name_en: string;
  name_ar: string;
  price_per_guest: string;
  currency: string;
  is_active: true;
  checkout_enabled: true;
  supported_tickets: AddOnTicketCategory[];
}
const VALID_TICKETS = ["day_use", "observatory_experience", "cabin_stay"] as const;
/** CMS /add-ons is NOT a checkout catalog. Invalid pricing/capabilities fail closed. */
export function normalizeBookableTicketAddOns(raw: unknown): BookableTicketAddOn[] {
  const rows = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
    ? (raw as { data: unknown[] }).data : [];
  const result: BookableTicketAddOn[] = [];
  for (const value of rows) {
    if (!value || typeof value !== "object") continue;
    const item = value as Record<string, unknown>;
    const price = typeof item.price_per_guest === "string" || typeof item.price_per_guest === "number" ? Number(item.price_per_guest) : NaN;
    if (item.code !== "lantern" || !Number.isSafeInteger(item.id) || Number(item.id) <= 0 ||
        item.is_active !== true || item.checkout_enabled !== true || !Number.isFinite(price) || price < 0 ||
        typeof item.currency !== "string" || !item.currency.trim() ||
        typeof item.name_en !== "string" || typeof item.name_ar !== "string" ||
        !Array.isArray(item.supported_tickets)) continue;
    const supported = item.supported_tickets.filter((t): t is AddOnTicketCategory =>
      typeof t === "string" && VALID_TICKETS.some((v) => v === t));
    if (!supported.length) continue;
    result.push({id: item.id as number, code: "lantern", name_en: item.name_en, name_ar: item.name_ar,
      price_per_guest: String(price), currency: item.currency, is_active: true, checkout_enabled: true,
      supported_tickets: supported});
  }
  return result;
}
export async function getBookableTicketAddOns(locale?: string): Promise<BookableTicketAddOn[]> {
  const raw = await apiFetch<unknown>("/ticket-add-ons", {locale: resolveApiLocale(locale), cache: "no-store"});
  return normalizeBookableTicketAddOns(raw);
}
