import { DEFAULT_API_LOCALE, type ApiLocale } from "@/lib/api/locale";

export const BOOKING_LOCALE_EVENT = "zalina:booking-locale";

/**
 * @deprecated Prefer next-intl path locale (`useLocale` / `getLocale`).
 * Kept for tests and any remaining query-param redirects.
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

/** Sync <html lang/dir> — prefer server-rendered attrs from [locale] layout. */
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
