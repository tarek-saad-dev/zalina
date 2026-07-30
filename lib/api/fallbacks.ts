const ZONE_IMAGES: Record<string, string> = {
  souk: "/assets/Twilight Gatherings.png",
  vip: "/assets/Starlit.png",
  arena: "/assets/Cultural Performances.png",
};

const EXPERIENCE_IMAGES: Record<string, string> = {
  dinner: "/assets/Flavors.png",
  show: "/assets/Cultural Performances.png",
  ritual: "/assets/Moments to Remember.png",
};

const DEFAULT_ZONE_IMAGE = "/assets/zalina-hero-bg.png";
const DEFAULT_EXPERIENCE_IMAGE = "/assets/night.png";
const DEFAULT_STAY_IMAGE = "/assets/day.png";

export function zoneFallbackImage(type?: string): string {
  if (!type) return DEFAULT_ZONE_IMAGE;
  return ZONE_IMAGES[type.toLowerCase()] ?? DEFAULT_ZONE_IMAGE;
}

export function experienceFallbackImage(type?: string): string {
  if (!type) return DEFAULT_EXPERIENCE_IMAGE;
  return EXPERIENCE_IMAGES[type.toLowerCase()] ?? DEFAULT_EXPERIENCE_IMAGE;
}

export function stayFallbackImage(zoneType?: string): string {
  if (!zoneType) return DEFAULT_STAY_IMAGE;
  return ZONE_IMAGES[zoneType.toLowerCase()] ?? DEFAULT_STAY_IMAGE;
}

export function mediaUrl(
  media?: Array<{ url?: string; original_url?: string }> | null
): string | null {
  if (!media?.length) return null;
  const first = media[0];
  return first.url || first.original_url || null;
}
