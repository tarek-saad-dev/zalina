/**
 * Zone / experience / accommodation showcase helpers for home surfaces.
 */
import type { AccommodationType } from "@/lib/api/booking-types";
import type { ApiExperience, ApiZone } from "@/lib/api/types";
import { NEUTRAL_MEDIA_FALLBACK } from "./fallback";
import { resolveCoverImage } from "./resolveMedia";
import type { ResolvedImage } from "./types";

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

/** Zone showcase cards for home Market Showcase. */
export function zonesToMarketCardsWithSize(
  zones: ApiZone[],
  locale: "en" | "ar" = "en"
): MarketCard[] {
  return zones.map((zone, index) => {
    const title =
      locale === "ar" ? zone.name_ar || zone.name_en : zone.name_en;
    const desc =
      (locale === "ar"
        ? zone.description_ar || zone.description_en
        : zone.description_en || zone.description_ar) || "";
    const resolved = resolveCoverImage(zone, { entityName: title });
    return {
      ...cardFromResolved(
        String(zone.id),
        title,
        resolved,
        desc || undefined,
        "/zones"
      ),
      size: SIZES[index % SIZES.length],
    };
  });
}

/** Aggregate entity covers for home visual galleries (no invented page CMS). */
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
