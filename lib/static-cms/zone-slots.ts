import "server-only";
import { getZones, mapZoneToUi } from "@/lib/api";
import { zoneImageSlots } from "./schema";

export async function catalogZoneData(locale: "ar" | "en" = "en") {
  const zones = await getZones(locale);
  if (!Array.isArray(zones)) return { slots: [], featured: undefined, images: [] as string[] };
  const slots = zoneImageSlots(zones.map(zone => ({
    id: zone.id, title: zone.name_en, titleAr: zone.name_ar,
    image: mapZoneToUi(zone, locale).image,
  })));
  const featured = zones.find(zone => zone.is_bookable_online) ?? zones[0];
  return { slots, images: zones.map(zone => mapZoneToUi(zone, locale).image), featured: featured ? mapZoneToUi(featured, locale).image : undefined };
}
