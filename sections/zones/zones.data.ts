// ============================================
// ZONES PAGE - TYPED DATA & CONSTANTS
// ============================================

import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

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
  imageAlt?: string;
  apiId?: number;
  type?: string;
  isBookableOnline?: boolean;
  slug?: string;
}

export interface OccasionDef {
  id: OccasionId;
  /** Message key under `zones.occasions.items.*` */
  messageKey:
    | "dayEvents"
    | "eveningAffairs"
    | "weddings"
    | "corporate"
    | "private";
  symbol: string;
  recommendedZones: ZoneId[];
}

export interface JourneyStepDef {
  number: number;
  /** Message key under `zones.journey.steps.*` */
  messageKey: "arrival" | "explore" | "live" | "depart";
  image: string;
}

export interface PromiseCardDef {
  /** Message key under `zones.promise.items.*` */
  messageKey: "quality" | "privacy" | "atmosphere" | "timing";
}

export interface BookingCardDef {
  /** Message key under `zones.booking.cards.*` */
  messageKey: "weddings" | "corporate" | "private";
  href: string;
  image: string;
}

/** @deprecated Prefer API-mapped zones passed as props. Kept as empty fallback. */
export const ZONES: Zone[] = [];

export const OCCASIONS: OccasionDef[] = [
  {
    id: "day-events",
    messageKey: "dayEvents",
    symbol: "☀",
    recommendedZones: [],
  },
  {
    id: "evening-affairs",
    messageKey: "eveningAffairs",
    symbol: "🌙",
    recommendedZones: [],
  },
  {
    id: "weddings",
    messageKey: "weddings",
    symbol: "💍",
    recommendedZones: [],
  },
  {
    id: "corporate",
    messageKey: "corporate",
    symbol: "◆",
    recommendedZones: [],
  },
  {
    id: "private",
    messageKey: "private",
    symbol: "✦",
    recommendedZones: [],
  },
];

export const JOURNEY_STEPS: JourneyStepDef[] = [
  {
    number: 1,
    messageKey: "arrival",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
  {
    number: 2,
    messageKey: "explore",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
  {
    number: 3,
    messageKey: "live",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
  {
    number: 4,
    messageKey: "depart",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
];

export const PROMISE_CARDS: PromiseCardDef[] = [
  { messageKey: "quality" },
  { messageKey: "privacy" },
  { messageKey: "atmosphere" },
  { messageKey: "timing" },
];

export const BOOKING_CARDS: BookingCardDef[] = [
  {
    messageKey: "weddings",
    href: "/weddings",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
  {
    messageKey: "corporate",
    href: "/book-now",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
  {
    messageKey: "private",
    href: "/book-now",
    image: NEUTRAL_MEDIA_FALLBACK,
  },
];

export const OVERVIEW_CHIP_KEYS = [
  "pathways",
  "celebration",
  "architecture",
  "hospitality",
] as const;

export const FEATURED_FEATURE_KEYS = [
  "atmosphere",
  "hospitality",
  "coordination",
  "setting",
] as const;

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
