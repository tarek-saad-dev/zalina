import { stayFallbackImage } from "@/lib/api";

type MediaLike = { url?: string; original_url?: string; file_name?: string };
type GalleryItem = string | MediaLike;

function galleryUrl(item: GalleryItem | undefined | null): string | null {
  if (!item) return null;
  if (typeof item === "string") return item || null;
  return item.url || item.original_url || null;
}

function mediaCoverUrl(media?: MediaLike[] | null): string | null {
  if (!media?.length) return null;
  const cover = media.find((m) => m.url || m.original_url) ?? media[0];
  return cover?.url || cover?.original_url || null;
}

/**
 * Accommodation type image fallback (API-driven only).
 * cover_image → gallery[0] → media cover → neutral Zalina asset
 */
export function resolveAccommodationImage(input: {
  cover_image?: string | null;
  gallery?: GalleryItem[] | null;
  media?: MediaLike[] | null;
}): string {
  return (
    input.cover_image ||
    galleryUrl(input.gallery?.[0]) ||
    mediaCoverUrl(input.media) ||
    stayFallbackImage()
  );
}

/**
 * Physical bubble image fallback.
 * bubble cover → gallery → media → type cover → neutral
 */
export function resolveBubbleImage(
  bubble: {
    cover_image?: string | null;
    gallery?: GalleryItem[] | null;
    media?: MediaLike[] | null;
  },
  typeFallback?: {
    cover_image?: string | null;
    gallery?: GalleryItem[] | null;
    media?: MediaLike[] | null;
  }
): string {
  return (
    bubble.cover_image ||
    galleryUrl(bubble.gallery?.[0]) ||
    mediaCoverUrl(bubble.media) ||
    (typeFallback ? resolveAccommodationImage(typeFallback) : null) ||
    stayFallbackImage()
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
