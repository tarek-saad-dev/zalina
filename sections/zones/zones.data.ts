// ============================================
// ZONES PAGE - TYPED DATA & CONSTANTS
// ============================================

export type ZoneId = string;

export type OccasionId =
  | "day-events"
  | "evening-affairs"
  | "weddings"
  | "corporate"
  | "private";

export interface Zone {
  id: ZoneId;
  title: string;
  description: string;
  bestFor: string;
  mood: string;
  image: string;
  apiId?: number;
  type?: string;
  isBookableOnline?: boolean;
  slug?: string;
}

export interface OccasionCard {
  id: OccasionId;
  title: string;
  description: string;
  symbol: string;
  recommendedZones: ZoneId[];
}

export interface JourneyStep {
  number: number;
  title: string;
  description: string;
  image: string;
}

export interface PromiseCard {
  title: string;
  description: string;
}

export interface BookingCard {
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
}

/** @deprecated Prefer API-mapped zones passed as props. Kept as empty fallback. */
export const ZONES: Zone[] = [];

// ============================================
// OCCASION CARDS DATA (structural marketing UI)
// ============================================

export const OCCASIONS: OccasionCard[] = [
  {
    id: "day-events",
    title: "Day Events",
    description: "Perfect for brunches, pool parties, and daytime celebrations",
    symbol: "☀",
    recommendedZones: [],
  },
  {
    id: "evening-affairs",
    title: "Evening Affairs",
    description: "Ideal for dinners, galas, and nighttime gatherings",
    symbol: "🌙",
    recommendedZones: [],
  },
  {
    id: "weddings",
    title: "Weddings",
    description: "Dedicated spaces for ceremonies and receptions",
    symbol: "💍",
    recommendedZones: [],
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Professional settings for business events and conferences",
    symbol: "◆",
    recommendedZones: [],
  },
  {
    id: "private",
    title: "Private",
    description: "Intimate spaces for exclusive celebrations",
    symbol: "✦",
    recommendedZones: [],
  },
];

// ============================================
// JOURNEY STEPS DATA
// ============================================

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    number: 1,
    title: "Arrival & Welcome",
    description: "Step through the grand gates into a world of Arabian elegance",
    image: "/assets/aboutHero.png",
  },
  {
    number: 2,
    title: "Explore the Zones",
    description: "Discover each unique space designed for different moments",
    image: "/assets/Twilight Gatherings.png",
  },
  {
    number: 3,
    title: "Live the Experience",
    description: "Immerse yourself in celebrations, dining, and cultural stories",
    image: "/assets/Cultural Performances.png",
  },
  {
    number: 4,
    title: "Depart with Memories",
    description: "Leave with stories that last a lifetime",
    image: "/assets/Moments to Remember.png",
  },
];

// ============================================
// PROMISE CARDS DATA
// ============================================

export const PROMISE_CARDS: PromiseCard[] = [
  {
    title: "Premium Quality",
    description: "Every detail crafted to perfection",
  },
  {
    title: "Exclusive Privacy",
    description: "Private spaces for intimate moments",
  },
  {
    title: "Unique Atmosphere",
    description: "Each zone has its own character",
  },
  {
    title: "Flexible Timing",
    description: "Day and evening availability",
  },
];

// ============================================
// BOOKING CONNECTION DATA
// ============================================

export const BOOKING_CARDS: BookingCard[] = [
  {
    title: "Wedding Packages",
    description:
      "Full wedding planning — ceremonies, receptions, and coordination in our most prestigious venues.",
    cta: "Plan Your Wedding",
    href: "/book-now",
    image: "/assets/wedding.png",
  },
  {
    title: "Corporate Events",
    description:
      "Executive-level gatherings, conferences, and branded evenings in refined private spaces.",
    cta: "Request a Quote",
    href: "/book-now",
    image: "/assets/Twilight Gatherings.png",
  },
  {
    title: "Private Celebrations",
    description:
      "Birthdays, anniversaries, and milestone occasions set in intimate, beautifully curated zones.",
    cta: "Start Planning",
    href: "/book-now",
    image: "/assets/Starlit.png",
  },
];

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidZoneId(id: string, zones: Zone[] = ZONES): id is ZoneId {
  return zones.some((z) => z.id === id);
}

export function isValidOccasionId(id: string): id is OccasionId {
  return OCCASIONS.some((o) => o.id === id);
}

export function getValidZoneId(id: string, zones: Zone[] = ZONES): ZoneId {
  if (isValidZoneId(id, zones)) return id;
  return zones[0]?.id ?? id;
}

export function getValidOccasionId(id: string): OccasionId {
  return isValidOccasionId(id) ? id : "day-events";
}

export function getRecommendedZones(
  occasionId: OccasionId,
  zones: Zone[] = ZONES
): Zone[] {
  const occasion = OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion || occasion.recommendedZones.length === 0) return zones;
  return zones.filter((z) => occasion.recommendedZones.includes(z.id));
}
