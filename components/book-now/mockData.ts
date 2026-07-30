import type {
  BookingStep,
  EnhancementAddOn,
  StayOption,
  ExperienceOption,
  OccasionOption,
} from "./types";

export const BOOKING_STEPS: BookingStep[] = [
  { id: 1, key: "journey", label: "Journey", shortLabel: "Journey" },
  { id: 2, key: "stay", label: "Stay / Experience", shortLabel: "Stay" },
  { id: 3, key: "date", label: "Date", shortLabel: "Date" },
  { id: 4, key: "enhancements", label: "Enhancements", shortLabel: "Add-ons" },
  { id: 5, key: "details", label: "Details", shortLabel: "Details" },
  { id: 6, key: "payment", label: "Payment", shortLabel: "Pay" },
];

export const JOURNEY_OPTIONS = [
  {
    id: "stay",
    title: "Stay at Zalina",
    description:
      "Reserve a private tent or cabana for an immersive overnight escape.",
    tags: ["Tents", "Cabanas", "Private Stay"],
    tag: "OVERNIGHT",
    gradientFrom: "#1a120a",
    gradientTo: "#0d0905",
    accentColor: "rgba(212,175,55,0.85)",
  },
  {
    id: "evening",
    title: "Evening Experience",
    description:
      "Book a curated dinner, sunset ritual, or cultural evening experience.",
    tags: ["Dining", "Sunset", "Rituals"],
    tag: "EVENING",
    gradientFrom: "#0e0d14",
    gradientTo: "#070610",
    accentColor: "rgba(180,140,220,0.85)",
  },
  {
    id: "private",
    title: "Private Celebration",
    description:
      "Plan a wedding, proposal, corporate gathering, or private occasion.",
    tags: ["Weddings", "Events", "Concierge"],
    tag: "PRIVATE",
    gradientFrom: "#12100a",
    gradientTo: "#080706",
    accentColor: "rgba(220,180,100,0.85)",
  },
];

/** @deprecated Catalog comes from the API via BookNowPage props. */
export const STAY_OPTIONS: StayOption[] = [];

/** @deprecated Catalog comes from the API via BookNowPage props. */
export const EXPERIENCE_OPTIONS: ExperienceOption[] = [];

export const OCCASION_OPTIONS: OccasionOption[] = [
  {
    id: "wedding",
    title: "Wedding",
    icon: "✦",
    description: "A grand celebration of love in an authentic Arabian setting.",
  },
  {
    id: "proposal",
    title: "Proposal",
    icon: "◆",
    description: "An intimate, perfectly arranged moment under the Arabian sky.",
  },
  {
    id: "corporate",
    title: "Corporate Gathering",
    icon: "▲",
    description: "Elegant corporate events with premium hospitality and setup.",
  },
  {
    id: "private-event",
    title: "Private Celebration",
    icon: "✶",
    description: "A bespoke private occasion tailored entirely to your vision.",
  },
];

/** @deprecated Add-ons come from the API via BookNowPage props. */
export const ENHANCEMENT_ADDONS: EnhancementAddOn[] = [];

export const LUXURY_TAGS = ["Stay", "Dining", "Sunset", "Rituals", "Private Events"];

export const JOURNEY_TYPE_LABELS: Record<string, string> = {
  stay: "Stay at Zalina",
  evening: "Evening Experience",
  private: "Private Celebration",
};

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "sunset", label: "Sunset Arrival", time: "5:00 PM" },
  { id: "dinner", label: "Golden Dinner", time: "7:30 PM" },
  { id: "night", label: "Night Ritual", time: "9:30 PM" },
];

export const PREFERRED_PERIODS = ["Sunset", "Evening", "Full Night"] as const;

/** No client-side blocked dates — availability is checked via the API. */
export function getMockUnavailableDates(): Set<string> {
  return new Set();
}
