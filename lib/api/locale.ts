/** Locales supported by the public API Accept-Language header. */
export type ApiLocale = "en" | "ar";

/** Site default from next.config i18n.defaultLocale. */
export const DEFAULT_API_LOCALE: ApiLocale = "en";

/**
 * Normalize an optional locale string into an API locale.
 * Does not invent product copy — only maps to `en` | `ar`.
 */
export function resolveApiLocale(locale?: string | null): ApiLocale {
  if (!locale) return DEFAULT_API_LOCALE;
  const normalized = locale.trim().toLowerCase();
  if (normalized === "ar" || normalized.startsWith("ar-")) return "ar";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return DEFAULT_API_LOCALE;
}
