import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

export const GALLERY_CATEGORY_IDS = [
  "all",
  "dining",
  "weddings",
  "zones",
  "rituals",
  "night-atmosphere",
  "details",
] as const;

export type GalleryCategoryId = (typeof GALLERY_CATEGORY_IDS)[number];

export interface GalleryCategory {
  id: GalleryCategoryId;
  label: string;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: "all", label: "All" },
  { id: "dining", label: "Dining" },
  { id: "weddings", label: "Weddings" },
  { id: "zones", label: "Zones" },
  { id: "rituals", label: "Rituals" },
  { id: "night-atmosphere", label: "Night Atmosphere" },
  { id: "details", label: "Details" },
];

export function isGalleryCategoryId(value: string): value is GalleryCategoryId {
  return GALLERY_CATEGORY_IDS.includes(value as GalleryCategoryId);
}

export function getSafeGalleryCategoryId(value: string): GalleryCategoryId {
  return isGalleryCategoryId(value) ? value : "all";
}

export const GALLERY_ITEM_IDS = [
  "lantern-pathway",
  "sunset-dining",
  "private-majlis",
  "wedding-aisle",
  "wedding-celebration",
  "coffee-ritual",
  "culinary-preparation",
  "palm-courtyard",
  "night-entertainment",
  "desert-arrival",
  "architectural-arches",
  "table-styling",
  "golden-reception",
  "atmosphere-details",
  "couple-silhouette",
  "guest-gathering",
] as const;

export type GalleryItemId = (typeof GALLERY_ITEM_IDS)[number];
export type GalleryAspect = "wide" | "portrait" | "square" | "tall";

export interface GalleryItem {
  id: GalleryItemId;
  title: string;
  category: Exclude<GalleryCategoryId, "all">;
  image: string;
  alt: string;
  aspect: GalleryAspect;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "lantern-pathway", title: "Lantern Pathway", category: "night-atmosphere", image: NEUTRAL_MEDIA_FALLBACK, alt: "Lantern-lit heritage pathway at Zalina Arabian Village", aspect: "tall" },
  { id: "sunset-dining", title: "Sunset Dining", category: "dining", image: NEUTRAL_MEDIA_FALLBACK, alt: "Golden-hour dining scene at Zalina", aspect: "wide" },
  { id: "private-majlis", title: "Private Majlis", category: "zones", image: NEUTRAL_MEDIA_FALLBACK, alt: "Intimate private majlis beneath warm night light", aspect: "portrait" },
  { id: "wedding-aisle", title: "Wedding Aisle", category: "weddings", image: NEUTRAL_MEDIA_FALLBACK, alt: "Cinematic wedding setting at Zalina Arabian Village", aspect: "wide" },
  { id: "wedding-celebration", title: "Golden Reception", category: "weddings", image: NEUTRAL_MEDIA_FALLBACK, alt: "Warm celebration gathering in a Zalina courtyard", aspect: "square" },
  { id: "coffee-ritual", title: "Coffee Ritual", category: "rituals", image: NEUTRAL_MEDIA_FALLBACK, alt: "Arabian coffee ritual detail at Zalina", aspect: "portrait" },
  { id: "culinary-preparation", title: "Culinary Preparation", category: "dining", image: NEUTRAL_MEDIA_FALLBACK, alt: "Curated culinary presentation at Zalina", aspect: "square" },
  { id: "palm-courtyard", title: "Palm Courtyard", category: "night-atmosphere", image: NEUTRAL_MEDIA_FALLBACK, alt: "Palm silhouettes and a glowing Zalina courtyard at night", aspect: "tall" },
  { id: "night-entertainment", title: "Night Entertainment", category: "night-atmosphere", image: NEUTRAL_MEDIA_FALLBACK, alt: "Cultural entertainment during a Zalina evening celebration", aspect: "wide" },
  { id: "desert-arrival", title: "Desert Arrival", category: "zones", image: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village arrival framed by heritage architecture", aspect: "wide" },
  { id: "architectural-arches", title: "Architectural Arches", category: "details", image: NEUTRAL_MEDIA_FALLBACK, alt: "Heritage architectural arches in golden light", aspect: "portrait" },
  { id: "table-styling", title: "Table Styling", category: "details", image: NEUTRAL_MEDIA_FALLBACK, alt: "Refined dining table styling at Zalina", aspect: "square" },
  { id: "golden-reception", title: "Golden Reception", category: "weddings", image: NEUTRAL_MEDIA_FALLBACK, alt: "Golden wedding reception scene at Zalina", aspect: "portrait" },
  { id: "atmosphere-details", title: "Atmosphere Details", category: "details", image: NEUTRAL_MEDIA_FALLBACK, alt: "Warmly lit hospitality detail at Zalina", aspect: "square" },
  { id: "couple-silhouette", title: "A Moment in Gold", category: "weddings", image: NEUTRAL_MEDIA_FALLBACK, alt: "Wedding couple moment in a lantern-lit Zalina setting", aspect: "tall" },
  { id: "guest-gathering", title: "Guest Gathering", category: "zones", image: NEUTRAL_MEDIA_FALLBACK, alt: "Guests gathered in a warm heritage courtyard", aspect: "wide" },
];

export function getGalleryItemById(id: string): GalleryItem | null {
  return GALLERY_ITEMS.find((item) => item.id === id) ?? null;
}

export const FEATURED_STORY_ITEMS = [
  { label: "Golden arrival", image: NEUTRAL_MEDIA_FALLBACK, alt: "Golden arrival at Zalina" },
  { label: "Lantern-lit dinner", image: NEUTRAL_MEDIA_FALLBACK, alt: "Lantern-lit dining at Zalina" },
  { label: "Night atmosphere", image: NEUTRAL_MEDIA_FALLBACK, alt: "Night atmosphere at Zalina" },
] as const;

export const DAY_NIGHT_FRAMES = [
  { label: "Sunset", image: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina in soft golden-hour light" },
  { label: "Blue Hour", image: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina at blue hour before nightfall" },
  { label: "Night Glow", image: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina glowing beneath the night sky" },
] as const;

export const WEDDING_PREVIEW_ITEMS = [
  { title: "Wedding Ceremony", image: NEUTRAL_MEDIA_FALLBACK, alt: "Wedding ceremony scene at Zalina" },
  { title: "Celebration Dinner", image: NEUTRAL_MEDIA_FALLBACK, alt: "Celebration dinner at Zalina" },
  { title: "Guest Gathering", image: NEUTRAL_MEDIA_FALLBACK, alt: "Guests gathering at Zalina" },
] as const;

export const ATMOSPHERE_ITEMS = [
  { title: "Lantern glow", image: NEUTRAL_MEDIA_FALLBACK, alt: "Lantern glow against heritage architecture" },
  { title: "Arabic coffee", image: NEUTRAL_MEDIA_FALLBACK, alt: "Arabian coffee ritual detail" },
  { title: "Carved arches", image: NEUTRAL_MEDIA_FALLBACK, alt: "Carved heritage arches" },
  { title: "Palm shadows", image: NEUTRAL_MEDIA_FALLBACK, alt: "Palm shadows at night" },
  { title: "Table styling", image: NEUTRAL_MEDIA_FALLBACK, alt: "Refined table styling" },
  { title: "Gold reflections", image: NEUTRAL_MEDIA_FALLBACK, alt: "Gold reflections in the evening light" },
] as const;

export const REEL_IDS = ["sunset-arrival", "night-at-zalina", "celebration-moments", "artisan-story", "culinary-journey"] as const;
export type ReelItemId = (typeof REEL_IDS)[number];

export const REEL_ITEMS: { id: ReelItemId; title: string; duration: string; image: string; alt: string }[] = [
  { id: "sunset-arrival", title: "Sunset Arrival", duration: "0:28", image: NEUTRAL_MEDIA_FALLBACK, alt: "Sunset arrival reel preview" },
  { id: "night-at-zalina", title: "Night at Zalina", duration: "0:42", image: NEUTRAL_MEDIA_FALLBACK, alt: "Night at Zalina reel preview" },
  { id: "celebration-moments", title: "Celebration Moments", duration: "0:36", image: NEUTRAL_MEDIA_FALLBACK, alt: "Celebration moments reel preview" },
  { id: "artisan-story", title: "The Artisan Story", duration: "0:31", image: NEUTRAL_MEDIA_FALLBACK, alt: "Artisan story reel preview" },
  { id: "culinary-journey", title: "Culinary Journey", duration: "0:25", image: NEUTRAL_MEDIA_FALLBACK, alt: "Culinary journey reel preview" },
];

export const GALLERY_REASONS = [
  { title: "Premium Storytelling", description: "Each frame reflects the atmosphere, detail, and emotion of Zalina." },
  { title: "Emotional Atmosphere", description: "A visual journey through warmth, celebration, and memory." },
  { title: "Curated Hospitality", description: "Moments shaped by service, culture, and refined design." },
] as const;
