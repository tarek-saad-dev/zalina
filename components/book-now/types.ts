export type JourneyType = "stay" | "evening" | "private" | null;

export type PreferredPeriod = "Sunset" | "Evening" | "Full Night" | null;

export type EnhancementCategory = "Arrival" | "Dining" | "Atmosphere" | "Memories";

export type PricingType = "fixed" | "per-guest";

export type OccasionType =
  | "none"
  | "birthday"
  | "anniversary"
  | "honeymoon"
  | "proposal"
  | "family"
  | "corporate"
  | "other";

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface DateSelection {
  checkIn: string | null;
  checkOut: string | null;
  date: string | null;
  timeSlot: string | null;
  preferredPeriod: PreferredPeriod;
  nights: number;
}

export interface GuestContactDetails {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  occasion: OccasionType;
  specialRequests: string;
}

export interface EnhancementAddOn {
  id: string;
  category: EnhancementCategory;
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
  selected: boolean;
}

export interface StayOption {
  id: string;
  title: string;
  zone: string;
  price: number;
  priceLabel: string;
  maxGuests: number;
  badge: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface ExperienceOption {
  id: string;
  title: string;
  zone: string;
  price: number;
  priceLabel: string;
  minGuests: number;
  badge: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface OccasionOption {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export type BookingStatus = "idle" | "submitting" | "submitted" | "failed";

export type PaymentMode = "pay-now" | "concierge-confirmation";

export interface BookingState {
  currentStep: number;
  journeyType: JourneyType;
  selectedItem: string | null;
  selectedItemTitle: string | null;
  selectedItemPrice: number;
  selectedItemMaxGuests: number | null;
  selectedOccasionId: string | null;
  selectedOccasionTitle: string | null;
  isPrivateCustom: boolean;
  dateSelection: DateSelection;
  guests: number;
  participants: number;
  estimatedGuests: number;
  enhancements: EnhancementAddOn[];
  guestDetails: GuestContactDetails;
  baseTotal: number;
  addOnsTotal: number;
  estimatedTotal: number;
  bookingStatus: BookingStatus;
  bookingReference: string | null;
  paymentMode: PaymentMode;
  submissionError: string | null;
}

export interface BookingStep {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
}
