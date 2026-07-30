// ============================================
// WEDDINGS PAGE — TYPED DATA & VALIDATORS
// ============================================

// ── VENUE TYPES ─────────────────────────────

export const WEDDING_VENUE_IDS = [
  "royal-wedding-court",
  "banquet-hall",
  "desert-lounge",
  "poolside-pavilion",
] as const;

export type WeddingVenueId = (typeof WEDDING_VENUE_IDS)[number];

export interface WeddingVenue {
  id: WeddingVenueId;
  number: string;
  title: string;
  description: string;
  capacity: string;
  mood: string;
  bestFor: string;
  image: string;
}

export function isWeddingVenueId(value: string): value is WeddingVenueId {
  return WEDDING_VENUE_IDS.includes(value as WeddingVenueId);
}

export function getSafeWeddingVenueId(value: string): WeddingVenueId {
  return isWeddingVenueId(value) ? value : "royal-wedding-court";
}

export const WEDDING_VENUES: WeddingVenue[] = [
  {
    id: "royal-wedding-court",
    number: "01",
    title: "The Royal Wedding Court",
    description:
      "Grand open-air celebration beneath palms, lanterns, and heritage architecture.",
    capacity: "Up to 300 guests",
    mood: "Grand / Cinematic / Regal",
    bestFor: "Large weddings and formal celebrations",
    image: "/assets/wedding.png",
  },
  {
    id: "banquet-hall",
    number: "02",
    title: "The Banquet Hall",
    description:
      "An elegant indoor atmosphere for refined wedding dinners and milestone celebrations.",
    capacity: "Up to 180 guests",
    mood: "Elegant / Formal / Warm",
    bestFor: "Formal dinners and gala-style weddings",
    image: "/assets/Twilight Gatherings.png",
  },
  {
    id: "desert-lounge",
    number: "03",
    title: "The Desert Lounge",
    description:
      "An intimate setting for pre-wedding gatherings, family nights, and private celebrations.",
    capacity: "Up to 80 guests",
    mood: "Intimate / Warm / Relaxed",
    bestFor: "Henna nights, engagement dinners, private gatherings",
    image: "/assets/Starlit.png",
  },
  {
    id: "poolside-pavilion",
    number: "04",
    title: "Poolside Pavilion",
    description:
      "Golden-hour receptions beside water, palms, and soft evening light.",
    capacity: "Up to 120 guests",
    mood: "Fresh / Sunset / Romantic",
    bestFor: "Receptions, cocktail evenings, daytime celebrations",
    image: "/assets/day.png",
  },
];

// ── JOURNEY TIMELINE ────────────────────────

export const WEDDING_JOURNEY_IDS = [
  "welcome",
  "ceremony",
  "dinner",
  "celebration",
  "memory",
] as const;

export type WeddingJourneyStepId = (typeof WEDDING_JOURNEY_IDS)[number];

export interface WeddingJourneyStep {
  id: WeddingJourneyStepId;
  number: number;
  title: string;
  description: string;
  image: string;
}

export const WEDDING_JOURNEY_STEPS: WeddingJourneyStep[] = [
  {
    id: "welcome",
    number: 1,
    title: "The Welcome",
    description:
      "Guests arrive through lantern-lit pathways and warm hospitality.",
    image: "/assets/aboutHero.png",
  },
  {
    id: "ceremony",
    number: 2,
    title: "The Ceremony",
    description:
      "A cinematic moment framed by heritage architecture.",
    image: "/assets/wedding.png",
  },
  {
    id: "dinner",
    number: 3,
    title: "The Dinner",
    description:
      "Curated dining beneath palms, golden light, and open skies.",
    image: "/assets/Flavors.png",
  },
  {
    id: "celebration",
    number: 4,
    title: "The Celebration",
    description:
      "Music, movement, and atmosphere beneath the stars.",
    image: "/assets/Cultural Performances.png",
  },
  {
    id: "memory",
    number: 5,
    title: "The Memory",
    description:
      "Every corner designed for timeless photographs.",
    image: "/assets/Moments to Remember.png",
  },
];

export function clampJourneyStep(step: number): number {
  return Math.max(1, Math.min(5, step));
}

// ── WEDDING DETAILS ─────────────────────────

export interface WeddingDetail {
  title: string;
  description: string;
}

export const WEDDING_DETAILS: WeddingDetail[] = [
  { title: "Bridal Entrance Styling", description: "A curated arrival that sets the tone for the celebration." },
  { title: "Lantern & Floral Atmosphere", description: "Warm, ambient lighting and natural arrangements throughout." },
  { title: "Private Dining Setup", description: "Dedicated table design for intimate or grand wedding dinners." },
  { title: "Guest Hospitality Flow", description: "Seamless arrival, seating, and service choreography." },
  { title: "Photography Moments", description: "Designated scenes and backdrops for timeless imagery." },
  { title: "Music & Celebration Mood", description: "Live or curated entertainment matched to the atmosphere." },
  { title: "Premium Seating Arrangements", description: "Elegant, comfortable layouts for every guest count." },
  { title: "Dedicated Coordination", description: "End-to-end wedding management and on-site support." },
];

// ── CELEBRATION STYLES ──────────────────────

export const CELEBRATION_STYLE_IDS = [
  "intimate",
  "grand",
  "destination",
  "pre-wedding",
] as const;

export type CelebrationStyleId = (typeof CELEBRATION_STYLE_IDS)[number];

export interface CelebrationStyle {
  id: CelebrationStyleId;
  title: string;
  description: string;
  image: string;
  cta: string;
}

export const CELEBRATION_STYLES: CelebrationStyle[] = [
  {
    id: "intimate",
    title: "Intimate Wedding",
    description:
      "For close family, private vows, and deeply personal celebrations.",
    image: "/assets/Starlit.png",
    cta: "Inquire",
  },
  {
    id: "grand",
    title: "Grand Celebration",
    description:
      "For large weddings, formal dining, and a complete guest experience.",
    image: "/assets/wedding.png",
    cta: "Inquire",
  },
  {
    id: "destination",
    title: "Destination Wedding",
    description:
      "For couples seeking an immersive celebration beneath the stars.",
    image: "/assets/night.png",
    cta: "Inquire",
  },
  {
    id: "pre-wedding",
    title: "Pre-Wedding Gathering",
    description:
      "Henna nights, engagement dinners, family receptions, and private rituals.",
    image: "/assets/Twilight Gatherings.png",
    cta: "Inquire",
  },
];

// ── GALLERY MOMENTS ─────────────────────────

export interface GalleryMoment {
  caption: string;
  image: string;
}

export const GALLERY_MOMENTS: GalleryMoment[] = [
  { caption: "Lantern aisle", image: "/assets/aboutHero.png" },
  { caption: "Palace gate entrance", image: "/assets/zalina-hero-bg.png" },
  { caption: "Dinner tables", image: "/assets/Flavors.png" },
  { caption: "Bride and groom silhouette", image: "/assets/wedding.png" },
  { caption: "Dance beneath the stars", image: "/assets/Cultural Performances.png" },
  { caption: "Coffee ritual", image: "/assets/about1.png" },
  { caption: "Palm-lit courtyard", image: "/assets/night.png" },
  { caption: "Golden reception", image: "/assets/Twilight Gatherings.png" },
];

// ── REASONS TO CHOOSE ───────────────────────

export interface ReasonCard {
  title: string;
  description: string;
}

export const REASONS_TO_CHOOSE: ReasonCard[] = [
  {
    title: "Cinematic Atmosphere",
    description:
      "A setting designed to make every moment feel extraordinary.",
  },
  {
    title: "Heritage Luxury",
    description:
      "Architecture, light, and detail inspired by timeless regional beauty.",
  },
  {
    title: "Flexible Spaces",
    description: "From intimate gatherings to grand celebrations.",
  },
  {
    title: "Curated Hospitality",
    description:
      "Warm service and thoughtful guest flow from arrival to farewell.",
  },
  {
    title: "Photography-Ready Scenes",
    description: "Every corner designed for beautiful memories.",
  },
  {
    title: "Private Event Coordination",
    description:
      "Support for planning, flow, atmosphere, and experience details.",
  },
];

// ── SIGNATURE FEATURES ──────────────────────

export const SIGNATURE_FEATURES: string[] = [
  "Ceremony beneath the stars",
  "Lantern-lit dinner setting",
  "Curated entrance moment",
  "Live entertainment atmosphere",
  "Photography-ready scenes",
  "Private hospitality coordination",
];
