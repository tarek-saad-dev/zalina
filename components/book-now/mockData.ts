import type { BookingStep, EnhancementAddOn, StayOption, ExperienceOption, OccasionOption } from "./types";

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

export const STAY_OPTIONS: StayOption[] = [
  {
    id: "desert-tent",
    title: "Desert Tent",
    zone: "Lounge",
    price: 4500,
    priceLabel: "EGP 4,500",
    maxGuests: 2,
    badge: "Intimate Escape",
    description:
      "A refined private tent designed for calm evenings, warm lighting, and desert stillness.",
    gradientFrom: "#1c1208",
    gradientTo: "#0e0904",
  },
  {
    id: "royal-cabana",
    title: "Royal Cabana",
    zone: "VIP",
    price: 7500,
    priceLabel: "EGP 7,500",
    maxGuests: 4,
    badge: "Most Requested",
    description:
      "A premium cabana with elevated privacy, curated service, and a cinematic outdoor setting.",
    gradientFrom: "#180f06",
    gradientTo: "#100a04",
  },
  {
    id: "family-majlis",
    title: "Family Majlis",
    zone: "Souk",
    price: 9000,
    priceLabel: "EGP 9,000",
    maxGuests: 6,
    badge: "Family Favorite",
    description:
      "A generous Arabian-inspired setting for families and small groups.",
    gradientFrom: "#14100a",
    gradientTo: "#0b0905",
  },
  {
    id: "signature-pavilion",
    title: "Signature Pavilion",
    zone: "Arena",
    price: 14000,
    priceLabel: "EGP 14,000",
    maxGuests: 10,
    badge: "Signature",
    description:
      "A larger ceremonial space designed for special evenings and elevated hospitality.",
    gradientFrom: "#1a1208",
    gradientTo: "#0e0a05",
  },
];

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    id: "arabian-dinner",
    title: "Arabian Dinner",
    zone: "Lounge",
    price: 1250,
    priceLabel: "EGP 1,250",
    minGuests: 2,
    badge: "Dining",
    description:
      "An open-air Arabian dining experience with warm service and atmospheric lighting.",
    gradientFrom: "#160c08",
    gradientTo: "#0b0604",
  },
  {
    id: "sunset-ritual",
    title: "Sunset Ritual",
    zone: "Arena",
    price: 950,
    priceLabel: "EGP 950",
    minGuests: 1,
    badge: "Golden Hour",
    description:
      "A golden-hour welcome experience inspired by Arabian hospitality and storytelling.",
    gradientFrom: "#1a1006",
    gradientTo: "#0e0804",
  },
  {
    id: "night-rituals",
    title: "Night Rituals",
    zone: "Souk",
    price: 1600,
    priceLabel: "EGP 1,600",
    minGuests: 2,
    badge: "Cultural",
    description:
      "An immersive cultural evening with firelight, scents, music, and ceremonial details.",
    gradientFrom: "#0d0c14",
    gradientTo: "#07060e",
  },
  {
    id: "vip-dining",
    title: "VIP Dining Lounge",
    zone: "VIP",
    price: 2800,
    priceLabel: "EGP 2,800",
    minGuests: 2,
    badge: "VIP",
    description:
      "A more private dining experience with premium seating and elevated service.",
    gradientFrom: "#180f08",
    gradientTo: "#0d0805",
  },
];

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

export const ENHANCEMENT_ADDONS: EnhancementAddOn[] = [
  { id: "transfer", category: "Arrival", name: "Private Arrival Transfer", description: "A seamless arrival experience arranged by the Zalina concierge.", price: 1200, pricingType: "fixed", selected: false },
  { id: "welcome-drinks", category: "Arrival", name: "Welcome Drinks", description: "Signature welcome drinks served on arrival.", price: 350, pricingType: "per-guest", selected: false },
  { id: "vip-host", category: "Arrival", name: "VIP Entry Host", description: "A dedicated host to welcome and guide your party.", price: 900, pricingType: "fixed", selected: false },
  { id: "table-styling", category: "Dining", name: "Premium Table Styling", description: "Layered table styling with candles, textiles, and golden accents.", price: 1800, pricingType: "fixed", selected: false },
  { id: "cake", category: "Dining", name: "Celebration Cake", description: "A custom celebration cake prepared for your occasion.", price: 1100, pricingType: "fixed", selected: false },
  { id: "waiter", category: "Dining", name: "Private Waiter", description: "Dedicated service throughout your selected experience.", price: 1500, pricingType: "fixed", selected: false },
  { id: "fire-show", category: "Atmosphere", name: "Fire Show Moment", description: "A short atmospheric fire performance for a cinematic highlight.", price: 2500, pricingType: "fixed", selected: false },
  { id: "oud", category: "Atmosphere", name: "Oud Performance", description: "Live oud music to create a warm Arabian atmosphere.", price: 3000, pricingType: "fixed", selected: false },
  { id: "candle-path", category: "Atmosphere", name: "Candle Path Setup", description: "A candle-lit arrival path designed for photos and ambience.", price: 1400, pricingType: "fixed", selected: false },
  { id: "photographer", category: "Memories", name: "Photographer", description: "A professional photographer for selected highlights.", price: 3500, pricingType: "fixed", selected: false },
  { id: "souvenir", category: "Memories", name: "Printed Souvenir", description: "A refined keepsake prepared for your visit.", price: 450, pricingType: "per-guest", selected: false },
  { id: "gift-box", category: "Memories", name: "Custom Gift Box", description: "A curated Zalina gift box with premium local details.", price: 850, pricingType: "per-guest", selected: false },
];

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

export function getMockUnavailableDates(): Set<string> {
  const today = new Date();
  const offsets = [3, 7, 12];
  const unavailable = new Set<string>();
  offsets.forEach((n) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    unavailable.add(`${y}-${mo}-${dy}`);
  });
  return unavailable;
}
