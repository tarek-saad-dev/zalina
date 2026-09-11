import type { ApiLocale } from "@/lib/api";
import { resolveApiLocale } from "@/lib/api/locale";

export type LocaleCopy = { en: string; ar: string };

export function pickLocale(locale: ApiLocale, copy: LocaleCopy): string {
  return locale === "ar" ? copy.ar : copy.en;
}

/** Client-side locale from <html lang>, same pattern as booking. */
export function readDocumentLocale(): ApiLocale {
  if (typeof document === "undefined") return "en";
  return resolveApiLocale(document.documentElement.lang);
}
