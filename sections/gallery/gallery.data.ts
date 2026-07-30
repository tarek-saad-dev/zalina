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
  { id: "lantern-pathway", title: "Lantern Pathway", category: "night-atmosphere", image: "/assets/aboutHero.png", alt: "Lantern-lit heritage pathway at Zalina Arabian Village", aspect: "tall" },
  { id: "sunset-dining", title: "Sunset Dining", category: "dining", image: "/assets/day.png", alt: "Golden-hour dining scene at Zalina", aspect: "wide" },
  { id: "private-majlis", title: "Private Majlis", category: "zones", image: "/assets/Starlit.png", alt: "Intimate private majlis beneath warm night light", aspect: "portrait" },
  { id: "wedding-aisle", title: "Wedding Aisle", category: "weddings", image: "/assets/wedding.png", alt: "Cinematic wedding setting at Zalina Arabian Village", aspect: "wide" },
  { id: "wedding-celebration", title: "Golden Reception", category: "weddings", image: "/assets/Twilight Gatherings.png", alt: "Warm celebration gathering in a Zalina courtyard", aspect: "square" },
  { id: "coffee-ritual", title: "Coffee Ritual", category: "rituals", image: "/assets/about1.png", alt: "Arabian coffee ritual detail at Zalina", aspect: "portrait" },
  { id: "culinary-preparation", title: "Culinary Preparation", category: "dining", image: "/assets/Flavors.png", alt: "Curated culinary presentation at Zalina", aspect: "square" },
  { id: "palm-courtyard", title: "Palm Courtyard", category: "night-atmosphere", image: "/assets/night.png", alt: "Palm silhouettes and a glowing Zalina courtyard at night", aspect: "tall" },
  { id: "night-entertainment", title: "Night Entertainment", category: "night-atmosphere", image: "/assets/Cultural Performances.png", alt: "Cultural entertainment during a Zalina evening celebration", aspect: "wide" },
  { id: "desert-arrival", title: "Desert Arrival", category: "zones", image: "/assets/zalina-hero-bg.png", alt: "Zalina Arabian Village arrival framed by heritage architecture", aspect: "wide" },
  { id: "architectural-arches", title: "Architectural Arches", category: "details", image: "/assets/about2.png", alt: "Heritage architectural arches in golden light", aspect: "portrait" },
  { id: "table-styling", title: "Table Styling", category: "details", image: "/assets/Flavors.png", alt: "Refined dining table styling at Zalina", aspect: "square" },
  { id: "golden-reception", title: "Golden Reception", category: "weddings", image: "/assets/wedding.png", alt: "Golden wedding reception scene at Zalina", aspect: "portrait" },
  { id: "atmosphere-details", title: "Atmosphere Details", category: "details", image: "/assets/Moments to Remember.png", alt: "Warmly lit hospitality detail at Zalina", aspect: "square" },
  { id: "couple-silhouette", title: "A Moment in Gold", category: "weddings", image: "/assets/wedding.png", alt: "Wedding couple moment in a lantern-lit Zalina setting", aspect: "tall" },
  { id: "guest-gathering", title: "Guest Gathering", category: "zones", image: "/assets/Twilight Gatherings.png", alt: "Guests gathered in a warm heritage courtyard", aspect: "wide" },
];

export function getGalleryItemById(id: string): GalleryItem | null {
  return GALLERY_ITEMS.find((item) => item.id === id) ?? null;
}

export const FEATURED_STORY_ITEMS = [
  { label: "Golden arrival", image: "/assets/day.png", alt: "Golden arrival at Zalina" },
  { label: "Lantern-lit dinner", image: "/assets/Flavors.png", alt: "Lantern-lit dining at Zalina" },
  { label: "Night atmosphere", image: "/assets/night.png", alt: "Night atmosphere at Zalina" },
] as const;

export const DAY_NIGHT_FRAMES = [
  { label: "Sunset", image: "/assets/day.png", alt: "Zalina in soft golden-hour light" },
  { label: "Blue Hour", image: "/assets/Twilight Gatherings.png", alt: "Zalina at blue hour before nightfall" },
  { label: "Night Glow", image: "/assets/night.png", alt: "Zalina glowing beneath the night sky" },
] as const;

export const WEDDING_PREVIEW_ITEMS = [
  { title: "Wedding Ceremony", image: "/assets/wedding.png", alt: "Wedding ceremony scene at Zalina" },
  { title: "Celebration Dinner", image: "/assets/Flavors.png", alt: "Celebration dinner at Zalina" },
  { title: "Guest Gathering", image: "/assets/Twilight Gatherings.png", alt: "Guests gathering at Zalina" },
] as const;

export const ATMOSPHERE_ITEMS = [
  { title: "Lantern glow", image: "/assets/aboutHero.png", alt: "Lantern glow against heritage architecture" },
  { title: "Arabic coffee", image: "/assets/about1.png", alt: "Arabian coffee ritual detail" },
  { title: "Carved arches", image: "/assets/about2.png", alt: "Carved heritage arches" },
  { title: "Palm shadows", image: "/assets/night.png", alt: "Palm shadows at night" },
  { title: "Table styling", image: "/assets/Flavors.png", alt: "Refined table styling" },
  { title: "Gold reflections", image: "/assets/Moments to Remember.png", alt: "Gold reflections in the evening light" },
] as const;

export const REEL_IDS = ["sunset-arrival", "night-at-zalina", "celebration-moments", "artisan-story", "culinary-journey"] as const;
export type ReelItemId = (typeof REEL_IDS)[number];

export const REEL_ITEMS: { id: ReelItemId; title: string; duration: string; image: string; alt: string }[] = [
  { id: "sunset-arrival", title: "Sunset Arrival", duration: "0:28", image: "/assets/day.png", alt: "Sunset arrival reel preview" },
  { id: "night-at-zalina", title: "Night at Zalina", duration: "0:42", image: "/assets/night.png", alt: "Night at Zalina reel preview" },
  { id: "celebration-moments", title: "Celebration Moments", duration: "0:36", image: "/assets/wedding.png", alt: "Celebration moments reel preview" },
  { id: "artisan-story", title: "The Artisan Story", duration: "0:31", image: "/assets/Cultural Performances.png", alt: "Artisan story reel preview" },
  { id: "culinary-journey", title: "Culinary Journey", duration: "0:25", image: "/assets/Flavors.png", alt: "Culinary journey reel preview" },
];

export const GALLERY_REASONS = [
  { title: "Premium Storytelling", description: "Each frame reflects the atmosphere, detail, and emotion of Zalina." },
  { title: "Emotional Atmosphere", description: "A visual journey through warmth, celebration, and memory." },
  { title: "Curated Hospitality", description: "Moments shaped by service, culture, and refined design." },
] as const;
