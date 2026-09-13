import { DEFAULT_API_LOCALE, type ApiLocale } from "@/lib/api/locale";

export const BOOKING_LOCALE_EVENT = "zalina:booking-locale";

/**
 * Resolve booking/wedding page locale from the URL query only.
 *
 * Priority:
 * 1. valid explicit ?lang=ar | ?lang=en
 * 2. site default = en
 *
 * Never inherit a previously mutated document.documentElement.lang.
 * The optional `documentLang` argument exists only so regression tests can
 * prove stale DOM lang is ignored.
 */
export function resolveBookingPageLocale(
  queryLang?: string | null,
  _options?: { documentLang?: string | null }
): ApiLocale {
  const fromQuery = queryLang?.trim().toLowerCase() ?? "";
  if (fromQuery === "ar" || fromQuery === "en") {
    return fromQuery;
  }
  return DEFAULT_API_LOCALE;
}

/** Always sync <html lang/dir>, including restoring English/LTR. */
export function applyDocumentLocale(locale: ApiLocale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BOOKING_LOCALE_EVENT, { detail: locale })
    );
  }
}
