import type { EnhancementAddOn, ExperienceOption, StayOption } from "@/components/book-now/types";
import type { ExperienceItem } from "@/sections/experiences/types";
import type { Zone } from "@/sections/zones/zones.data";
import {
  experienceFallbackImage,
  mediaUrl,
  stayFallbackImage,
  zoneFallbackImage,
} from "./fallbacks";
import type { ApiAccommodation, ApiAddOn, ApiExperience, ApiZone } from "./types";

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

const ZONE_GRADIENTS: Record<string, { from: string; to: string }> = {
  souk: { from: "#14100a", to: "#0b0905" },
  vip: { from: "#180f06", to: "#100a04" },
  arena: { from: "#1a1208", to: "#0e0a05" },
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
  const copy = ZONE_COPY[zone.type?.toLowerCase()] ?? {
    description: `${zone.name_en} at Zalina Arabian Village.`,
    bestFor: zone.is_bookable_online ? "Online booking available" : "Inquire to book",
    mood: titleCaseType(zone.type),
  };
  const title = locale === "ar" ? zone.name_ar || zone.name_en : zone.name_en;
  return {
    id: zone.slug_en,
    title,
    description: copy.description,
    bestFor: copy.bestFor,
    mood: copy.mood,
    image: mediaUrl(zone.media) ?? zoneFallbackImage(zone.type),
    apiId: zone.id,
    type: zone.type,
    isBookableOnline: zone.is_bookable_online,
    slug: zone.slug_en,
  };
}

export function mapAccommodationToStay(
  item: ApiAccommodation,
  locale: "en" | "ar" = "en"
): StayOption {
  const price = parsePrice(item.base_price);
  const zoneType = item.zone?.type ?? "souk";
  const gradients = ZONE_GRADIENTS[zoneType] ?? ZONE_GRADIENTS.souk;
  const title =
    locale === "ar" ? item.name_ar || item.name_en : item.name_en;
  const zoneName =
    locale === "ar"
      ? item.zone?.name_ar || item.zone?.name_en || ""
      : item.zone?.name_en || "";

  return {
    id: String(item.id),
    apiId: item.id,
    slug: item.slug_en,
    title,
    zone: zoneName,
    zoneId: item.zone?.id,
    zoneType,
    price,
    priceLabel: formatEgp(price),
    maxGuests: item.max_guests,
    badge: item.zone?.type ? titleCaseType(item.zone.type) : "Stay",
    description: `Up to ${item.max_guests} guests in ${zoneName || "Zalina"}.`,
    gradientFrom: gradients.from,
    gradientTo: gradients.to,
    image: mediaUrl(item.media) ?? stayFallbackImage(zoneType),
  };
}

export function mapExperienceToOption(
  item: ApiExperience,
  locale: "en" | "ar" = "en"
): ExperienceOption {
  const price = parsePrice(item.price_per_person);
  const zoneType = item.zone?.type ?? "souk";
  const gradients = ZONE_GRADIENTS[zoneType] ?? ZONE_GRADIENTS.souk;
  const title =
    locale === "ar" ? item.name_ar || item.name_en : item.name_en;
  const zoneName =
    locale === "ar"
      ? item.zone?.name_ar || item.zone?.name_en || ""
      : item.zone?.name_en || "";

  return {
    id: String(item.id),
    apiId: item.id,
    title,
    zone: zoneName,
    zoneId: item.zone?.id ?? 0,
    zoneSlug: item.zone?.slug_en ?? "",
    zoneType,
    price,
    priceLabel: formatEgp(price),
    minGuests: 1,
    badge: titleCaseType(item.type),
    description: `A ${item.type} experience in ${zoneName || "Zalina"}.`,
    gradientFrom: gradients.from,
    gradientTo: gradients.to,
    image: mediaUrl(item.media) ?? experienceFallbackImage(item.type),
  };
}

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

  return {
    id: String(item.id),
    title,
    description: `${formatEgp(price)} per person · ${zoneName}`,
    image: mediaUrl(item.media) ?? experienceFallbackImage(item.type),
    label,
    categories,
    tags: [label, zoneName].filter(Boolean),
    href: "/book-now",
    type: item.type,
    price,
  };
}

const ADDON_CATEGORY_MAP: Record<
  string,
  EnhancementAddOn["category"]
> = {
  transport: "Arrival",
  activity: "Atmosphere",
  extra: "Dining",
  upgrade: "Memories",
};

export function mapAddOnToEnhancement(item: ApiAddOn): EnhancementAddOn {
  const pricingType =
    item.pricing_type === "per_person" ? "per-guest" : "fixed";

  return {
    id: String(item.id),
    apiId: item.id,
    category: ADDON_CATEGORY_MAP[item.type?.toLowerCase()] ?? "Dining",
    name: item.name_en,
    description: `${titleCaseType(item.type)} · ${item.pricing_type.replace(/_/g, " ")}`,
    price: parsePrice(item.price),
    pricingType,
    selected: false,
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
