import type { ExperienceItem } from "@/sections/experiences/types";
import type { Zone } from "@/sections/zones/zones.data";
import { resolveCoverImage } from "@/lib/media";
import type { ApiExperience, ApiZone } from "./types";

const ZONE_COPY: Record<
  string,
  { description: string; bestFor: string; mood: string }
> = {
  souk: {
    description:
      "An authentic Arabian marketplace village with tents, dining, and heritage atmosphere.",
    bestFor: "Stays, dining, cultural evenings",
    mood: "Warm / Vibrant / Heritage",
  },
  vip: {
    description:
      "An exclusive oasis of private cabanas and elevated hospitality for refined gatherings.",
    bestFor: "VIP stays, private dining, celebrations",
    mood: "Private / Luxurious / Intimate",
  },
  arena: {
    description:
      "A dramatic desert arena for shows, gatherings, and cinematic night spectaculars.",
    bestFor: "Shows, large gatherings, night events",
    mood: "Grand / Theatrical / Desert night",
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

export function mapZoneToUi(zone: ApiZone, locale: "en" | "ar" = "en"): Zone {
  const typeKey = (zone.type || "").toLowerCase();
  const copy = ZONE_COPY[typeKey] ?? {
    description:
      (locale === "ar"
        ? zone.description_ar || zone.description_en
        : zone.description_en || zone.description_ar) ||
      `${zone.name_en} at Zalina Arabian Village.`,
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
    description: copy.description,
    bestFor: copy.bestFor,
    mood: copy.mood,
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
  const typeKey = (item.type || "").toLowerCase();
  const labelMap: Record<string, ExperienceItem["label"]> = {
    dinner: "Dinner",
    show: "Show",
    ritual: "Ritual",
  };
  const label = labelMap[typeKey] ?? titleCaseType(item.type);
  const category =
    label === "Dinner" || label === "Show" || label === "Ritual"
      ? label
      : null;
  const title =
    locale === "ar" ? item.name_ar || item.name_en : item.name_en;
  const zoneName =
    locale === "ar"
      ? item.zone?.name_ar || item.zone?.name_en || ""
      : item.zone?.name_en || "";
  const price = parsePrice(item.price_per_person);

  const categories: ExperienceItem["categories"] = ["All Experiences"];
  if (category) categories.push(category);

  const cover = resolveCoverImage(item, { entityName: title });

  return {
    id: String(item.id),
    title,
    description:
      price > 0
        ? `${formatEgp(price)} per person · ${zoneName}`
        : zoneName || "Zalina Arabian Village",
    image: cover.url,
    imageAlt: cover.alt,
    label,
    categories,
    tags: [label, zoneName].filter(Boolean),
    href: "/book-now",
    type: item.type,
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
