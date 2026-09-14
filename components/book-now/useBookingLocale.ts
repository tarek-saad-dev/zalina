import { useLocale } from "next-intl";
import type { ApiLocale } from "@/lib/api";
import { resolveApiLocale } from "@/lib/api/locale";

/**
 * Site locale from the `/[locale]` path segment (next-intl).
 * Replaces legacy `?lang=` booking locale for UI + API Accept-Language.
 */
export function useBookingLocale(): ApiLocale {
  return resolveApiLocale(useLocale());
}
