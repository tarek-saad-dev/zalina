/**
 * Zone / experience / accommodation showcase helpers for home surfaces.
 */
import type { AccommodationType } from "@/lib/api/booking-types";
import type { ApiExperience, ApiZone } from "@/lib/api/types";
import { NEUTRAL_MEDIA_FALLBACK } from "./fallback";
import {
  galleryItemAlt,
  galleryItemTitle,
  type GalleryItem,
} from "./galleryCatalog";
import {
  dedupeMedia,
  isLikelyFilenameAlt,
  normalizeMediaList,
  sortMedia,
} from "./normalize";
import {
  collectEntityMedia,
  resolveCoverImage,
  resolveMediaAlt,
  selectDisplayUrl,
} from "./resolveMedia";
import type { CmsMedia, ResolvedImage } from "./types";

export interface CatalogMediaCard {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  alt: string;
  href?: string;
}

const SIZES = ["tall", "wide", "hero", "wide", "tall", "square", "wide"] as const;

export type MarketCard = CatalogMediaCard & {
  size: (typeof SIZES)[number];
};

/** Preferred market / souk zone slug on production CMS. */
export const MARKET_ZONE_SLUG = "al-souk-village";

function cardFromResolved(
  id: string,
  title: string,
  resolved: ResolvedImage,
  subtitle?: string,
  href?: string
): CatalogMediaCard {
  return {
    id,
    title,
    subtitle,
    image: resolved.url,
    alt: resolved.alt,
    href,
  };
}

function zoneLabel(zone: ApiZone, locale: "en" | "ar"): string {
  return locale === "ar" ? zone.name_ar || zone.name_en : zone.name_en;
}

function looksLikeMarketZone(zone: ApiZone): boolean {
  const hay = [
    zone.slug_en,
    zone.slug_ar,
    zone.name_en,
    zone.name_ar,
    zone.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /souk|market|bazaar|سوق|ماركت/.test(hay);
}

/** Pick the Market (Al-Souk) zone — not every zone. */
export function findMarketZone(zones: ApiZone[]): ApiZone | undefined {
  if (!zones.length) return undefined;
  const bySlug = zones.find(
    (z) => (z.slug_en || "").toLowerCase() === MARKET_ZONE_SLUG
  );
  if (bySlug) return bySlug;
  return zones.find(looksLikeMarketZone);
}

/**
 * Home Market hero — same cover image as Al-Souk on `/zones` (mapZoneToUi).
 */
export function marketZoneCoverCard(
  zone: ApiZone | null | undefined,
  locale: "en" | "ar" = "en"
): MarketCard {
  if (!zone) {
    return {
      id: "neutral",
      title: "Al-Souk Village",
      image: NEUTRAL_MEDIA_FALLBACK,
      alt: "Zalina Arabian Village",
      href: "/zones",
      size: "hero",
    };
  }

  const title = zoneLabel(zone, locale);
  const resolved = resolveCoverImage(zone, { entityName: title });
  return {
    id: `market-cover-${zone.id}`,
    title,
    image: resolved.url,
    alt: resolved.alt,
    href: "/zones",
    size: "hero",
  };
}

/**
 * @deprecated Prefer marketZoneCoverCard — Market matches the /zones Al-Souk cover.
 * Home Market strip from the Market zone gallery (not all zones).
 */
export function marketZoneGalleryToCards(
  zone: ApiZone | null | undefined,
  extraMedia: CmsMedia[] = [],
  locale: "en" | "ar" = "en"
): MarketCard[] {
  if (!zone) {
    return [
      {
        id: "neutral",
        title: "Zalina Arabian Village",
        subtitle: "Market gallery from the CMS",
        image: NEUTRAL_MEDIA_FALLBACK,
        alt: "Zalina Arabian Village",
        size: "hero",
      },
    ];
  }

  const title = zoneLabel(zone, locale);
  const gallery = sortMedia(normalizeMediaList(zone.gallery));
  const merged = sortMedia(
    dedupeMedia([...collectEntityMedia(zone), ...extraMedia])
  );
  // Gallery is the intended Market strip; fall back to full zone media when empty.
  const source = gallery.length > 0 ? gallery : merged;

  if (source.length === 0) {
    return [
      {
        id: `market-${zone.id}-empty`,
        title,
        subtitle: "Market gallery coming soon",
        image: NEUTRAL_MEDIA_FALLBACK,
        alt: title,
        href: "/zones",
        size: "hero",
      },
    ];
  }

  return source.map((media, index) => {
    const caption =
      media.caption?.trim() ||
      (media.altText && !isLikelyFilenameAlt(media.altText)
        ? media.altText.trim()
        : undefined);
    return {
      id: `market-${zone.id}-${media.id}`,
      title: media.title?.trim() || title,
      subtitle: caption || undefined,
      image: media.url,
      alt: resolveMediaAlt(media, { entityName: title }),
      href: "/zones",
      size: SIZES[index % SIZES.length],
    };
  });
}

/** Experience showcase cards for home Signature Moments. */
export function experiencesToMomentCards(
  experiences: ApiExperience[],
  locale: "en" | "ar" = "en"
): CatalogMediaCard[] {
  return experiences.map((item) => {
    const title =
      locale === "ar" ? item.name_ar || item.name_en : item.name_en;
    const desc =
      (locale === "ar"
        ? item.description_ar || item.description_en
        : item.description_en || item.description_ar) || "";
    const resolved = resolveCoverImage(item, { entityName: title });
    return cardFromResolved(
      String(item.id),
      title,
      resolved,
      desc || undefined,
      "/experiences"
    );
  });
}

/**
 * @deprecated Prefer marketZoneGalleryToCards — Market shows souk gallery, not all zones.
 */
export function zonesToMarketCardsWithSize(
  zones: ApiZone[],
  locale: "en" | "ar" = "en",
  extraMedia: CmsMedia[] = []
): MarketCard[] {
  return marketZoneGalleryToCards(findMarketZone(zones), extraMedia, locale);
}

/**
 * Map CMS gallery wall items (same source as `/gallery`) into home strip cards.
 */
export function galleryItemsToCatalogCards(
  items: GalleryItem[],
  locale: "en" | "ar" = "en"
): CatalogMediaCard[] {
  const cards: CatalogMediaCard[] = [];

  for (const item of items) {
    const url = selectDisplayUrl(item.media);
    if (!url) continue;
    cards.push({
      id: item.key,
      title: galleryItemTitle(item),
      image: url,
      alt: galleryItemAlt(item, locale),
      href: "/gallery",
    });
  }

  if (cards.length === 0) {
    return [
      {
        id: "neutral-1",
        title: "Zalina Arabian Village",
        image: NEUTRAL_MEDIA_FALLBACK,
        alt: "Zalina Arabian Village",
        href: "/gallery",
      },
    ];
  }

  return cards;
}

/**
 * @deprecated Prefer galleryItemsToCatalogCards from loadGalleryCatalog (Bubble Stays).
 */
export function buildEntityGlimpseItems(
  zones: ApiZone[],
  experiences: ApiExperience[],
  accommodations: AccommodationType[],
  locale: "en" | "ar" = "en"
): CatalogMediaCard[] {
  const items: CatalogMediaCard[] = [];

  for (const zone of zones) {
    const title =
      locale === "ar" ? zone.name_ar || zone.name_en : zone.name_en;
    const resolved = resolveCoverImage(zone, { entityName: title });
    if (!resolved.isFallback) {
      items.push(cardFromResolved(`zone-${zone.id}`, title, resolved));
    }
  }

  for (const exp of experiences) {
    const title =
      locale === "ar" ? exp.name_ar || exp.name_en : exp.name_en;
    const resolved = resolveCoverImage(exp, { entityName: title });
    if (!resolved.isFallback) {
      items.push(cardFromResolved(`exp-${exp.id}`, title, resolved));
    }
  }

  for (const acc of accommodations) {
    const title =
      locale === "ar" ? acc.name_ar || acc.name_en : acc.name_en;
    const resolved = resolveCoverImage(acc, { entityName: title });
    if (!resolved.isFallback) {
      items.push(cardFromResolved(`acc-${acc.id}`, title, resolved));
    }
  }

  if (items.length === 0) {
    return [
      {
        id: "neutral-1",
        title: "Zalina Arabian Village",
        image: NEUTRAL_MEDIA_FALLBACK,
        alt: "Zalina Arabian Village",
      },
    ];
  }

  return items;
}
