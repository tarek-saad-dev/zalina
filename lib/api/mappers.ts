import type { ExperienceItem } from "@/sections/experiences/types";
import type { Zone } from "@/sections/zones/zones.data";
import { resolveCoverImage } from "@/lib/media";
import type { ApiExperience, ApiZone } from "./types";

/** Luxor-safe fallbacks when CMS descriptions are empty. Prefer CMS text when present. */
const ZONE_COPY: Record<
  string,
  { description: string; bestFor: string; mood: string }
> = {
  souk: {
    description:
      "A living country market village with dining, crafts and heritage atmosphere in Luxor.",
    bestFor: "Stays, dining, cultural evenings",
    mood: "Warm / Vibrant / Heritage",
  },
  vip: {
    description:
      "Private spaces and elevated hospitality for refined gatherings in Luxor.",
    bestFor: "VIP stays, private dining, celebrations",
    mood: "Private / Luxurious / Intimate",
  },
  arena: {
    description:
      "A dramatic performance space for shows, gatherings and cinematic evening spectaculars.",
    bestFor: "Shows, large gatherings, night events",
    mood: "Grand / Theatrical / Evening",
  },
};

const SLUG_ZONE_COPY: Record<
  string,
  { description: string; bestFor: string; mood: string }
> = {
  "arrival-plaza": {
    description:
      "The welcoming threshold of Zalina — where guests arrive into the village atmosphere of Luxor.",
    bestFor: "Arrival, welcome moments, photography",
    mood: "Open / Welcoming / First impression",
  },
  "al-souk-village": {
    description:
      "A country market at the heart of the village — Egyptian crafts, flavours and lanes made for wandering.",
    bestFor: "Shopping, exploration, daytime visits",
    mood: "Warm / Vibrant / Heritage",
  },
  "food-&-entertainment": {
    description:
      "The dining and performance heart of Zalina — Egyptian cuisine, live cooking and cultural evenings.",
    bestFor: "Dining, shows, night experiences",
    mood: "Lively / Culinary / Celebratory",
  },
};

function parsePrice(value: string | number | undefined | null): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatEgp(amount: number): string {
  return `EGP ${Math.round(amount).toLocaleString("en-US")}`;
}

function titleCaseType(type: string): string {
  if (!type) return "Experience";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function pickLocalized(
  locale: "en" | "ar",
  ar: string | null | undefined,
  en: string | null | undefined
): string {
  const preferred = locale === "ar" ? ar || en : en || ar;
  return (preferred || "").trim();
}

export function mapZoneToUi(zone: ApiZone, locale: "en" | "ar" = "en"): Zone {
  const typeKey = (zone.type || "").toLowerCase();
  const slugKey = (zone.slug_en || "").toLowerCase();
  const cmsDescription = pickLocalized(
    locale,
    zone.description_ar,
    zone.description_en
  );

  const typedFallback = ZONE_COPY[typeKey];
  const slugFallback = SLUG_ZONE_COPY[slugKey];
  const fallback =
    typedFallback ??
    slugFallback ?? {
      description: `${zone.name_en} at Zalina Arabian Village in Luxor.`,
      bestFor: zone.is_bookable_online
        ? "Online booking available"
        : "Inquire to book",
      mood: titleCaseType(zone.type || "Zone"),
    };

  const title = locale === "ar" ? zone.name_ar || zone.name_en : zone.name_en;
  const cover = resolveCoverImage(zone, { entityName: title });
  return {
    id: zone.slug_en,
    title,
    description: cmsDescription || fallback.description,
    bestFor: fallback.bestFor,
    mood: fallback.mood,
    image: cover.url,
    imageAlt: cover.alt,
    apiId: zone.id,
    type: zone.type,
    isBookableOnline: zone.is_bookable_online,
    slug: zone.slug_en,
  };
}

/** CMS experiences catalog card — marketing only, not bookable in V2 checkout. */
export function mapExperienceToCatalogItem(
  item: ApiExperience,
  locale: "en" | "ar" = "en"
): ExperienceItem {
  // Prefer CMS `category` (day/night); fall back to legacy `type`.
  const categoryKey = (item.category || item.type || "").toLowerCase();
  const labelMap: Record<string, ExperienceItem["label"]> = {
    day: "Day",
    night: "Night",
  };
  const label = labelMap[categoryKey] ?? titleCaseType(categoryKey || "Experience");
  const filterCategory =
    label === "Day" || label === "Night" ? label : null;
  const title =
    locale === "ar" ? item.name_ar || item.name_en : item.name_en;
  const zoneName =
    locale === "ar"
      ? item.zone?.name_ar || item.zone?.name_en || ""
      : item.zone?.name_en || "";
  const price = parsePrice(item.price_per_person);
  const cmsDescription = pickLocalized(
    locale,
    item.description_ar,
    item.description_en
  );

  const categories: ExperienceItem["categories"] = ["All Experiences"];
  if (filterCategory) categories.push(filterCategory);

  const cover = resolveCoverImage(item, { entityName: title });

  let description = cmsDescription;
  if (!description) {
    description =
      price > 0
        ? `${formatEgp(price)} per person · ${zoneName || "Luxor"}`
        : zoneName
          ? `${zoneName} · Zalina Arabian Village, Luxor`
          : "Zalina Arabian Village, Luxor";
  }

  return {
    id: String(item.id),
    title,
    description,
    image: cover.url,
    imageAlt: cover.alt,
    label,
    categories,
    tags: [label, zoneName, "Luxor"].filter(Boolean),
    href: "/book-now",
    type: item.type || item.category,
    price,
  };
}

export function addOneDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
