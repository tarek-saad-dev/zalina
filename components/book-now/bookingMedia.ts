import { stayFallbackImage } from "@/lib/api";
import {
  resolveBubbleCoverUrl,
  resolveCoverUrl,
  type MediaBearingEntity,
} from "@/lib/media";

function asCssUrl(value: string): string {
  // Always return a plain string URL safe for CSS url("...") / Image src.
  if (typeof value !== "string" || !value.trim()) {
    return stayFallbackImage();
  }
  return value.trim();
}

/**
 * Accommodation type image — shared CMS resolver.
 * cover_image (MediaAsset) → is_cover media → media[0] → gallery[0] → neutral
 */
export function resolveAccommodationImage(
  input: MediaBearingEntity
): string {
  return asCssUrl(resolveCoverUrl(input) || stayFallbackImage());
}

/**
 * Physical bubble image — shared CMS resolver.
 * bubble → parent accommodation type → neutral
 */
export function resolveBubbleImage(
  bubble: MediaBearingEntity,
  typeFallback?: MediaBearingEntity
): string {
  return asCssUrl(
    resolveBubbleCoverUrl(bubble, typeFallback) || stayFallbackImage()
  );
}

export function localizedName(
  item: { name_en: string; name_ar: string },
  locale: "en" | "ar"
): string {
  if (locale === "ar") return item.name_ar || item.name_en;
  return item.name_en || item.name_ar;
}

export function localizedDescription(
  item: { description_en?: string; description_ar?: string },
  locale: "en" | "ar"
): string {
  if (locale === "ar") {
    return item.description_ar || item.description_en || "";
  }
  return item.description_en || item.description_ar || "";
}

export function formatMoneyAmount(
  amount: number,
  currency?: string | null
): string {
  const formatted = Math.round(amount).toLocaleString("en-US");
  const safeCurrency = currency?.trim();
  return safeCurrency ? `${safeCurrency} ${formatted}` : formatted;
}

export function parseMoney(
  value: string | number | null | undefined
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (!value) return null;
  const n = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}
