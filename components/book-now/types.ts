import type { BookingProductType } from "@/lib/api";

/** Semantic wizard step IDs (product-specific flows). */
export type BookingStepId =
  | "product"
  | "date_guests"
  | "dates_guests"
  | "bubbles"
  | "guest_details"
  | "review";

export type AssignmentMode = "manual" | "random";

export type BookingUiStatus = "idle" | "submitting" | "submitted" | "failed";

/**
 * One line in a multi-bubble Bubble Stay booking.
 * Catalog names/prices/capacity live in API metadata — not duplicated here.
 */
export interface BubbleSelection {
  key: string;
  accommodationTypeId: number;
  accommodationSlug: string;
  /** Required when assignmentMode === "manual"; must be absent for random. */
  bubbleId?: number;
  guests: number;
  assignmentMode: AssignmentMode;
}

export interface DayUseState {
  visitDate: string | null;
  guests: number;
}

export interface BubbleStayState {
  checkIn: string | null;
  checkOut: string | null;
  totalGuests: number;
  selections: BubbleSelection[];
}

export interface GuestDetailsState {
  name: string;
  email: string;
  phone: string;
}

/**
 * Booking Domain V2 wizard state.
 * schemaVersion guards against legacy (V1) persisted blobs.
 */
export interface BookingState {
  schemaVersion: typeof BOOKING_STATE_SCHEMA_VERSION;
  productType: BookingProductType | null;
  /** 0-based index into the active product step list. */
  currentStepIndex: number;
  dayUse: DayUseState;
  bubbleStay: BubbleStayState;
  guest: GuestDetailsState;
  bookingStatus: BookingUiStatus;
  bookingReference: string | null;
  submissionError: string | null;
}

export const BOOKING_STATE_SCHEMA_VERSION = 2 as const;

/** Slim catalog metadata for capacity / estimate helpers (not mutation state). */
export interface AccommodationTypeMeta {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  max_guests: number;
  price_per_night: string;
  is_active: boolean;
  bubbles_count: number;
  cover_image?: string | null;
  gallery?: Array<string | { url?: string; original_url?: string }>;
  media?: Array<{ url?: string; original_url?: string }>;
  /** Catalog inventory only — never use as date-specific availability. */
  bubbles: Array<{
    id: number;
    name_en: string;
    name_ar: string;
    status: string;
    cover_image?: string | null;
    gallery?: Array<string | { url?: string; original_url?: string }>;
    media?: Array<{ url?: string; original_url?: string }>;
  }>;
}

export interface BookingCatalog {
  accommodationTypes: AccommodationTypeMeta[];
}

export interface BookingStepDefinition {
  id: BookingStepId;
  label: string;
  shortLabel: string;
}

export type BookingValidationCode =
  | "missing_product"
  | "invalid_visit_date"
  | "invalid_guest_count"
  | "invalid_check_in"
  | "invalid_check_out"
  | "check_out_not_after_check_in"
  | "no_bubble_selections"
  | "guest_under_allocated"
  | "guest_over_allocated"
  | "selection_guests_min"
  | "selection_guests_over_capacity"
  | "missing_accommodation_type"
  | "missing_manual_bubble_id"
  | "duplicate_manual_bubble"
  | "random_has_bubble_id"
  | "mixed_assignment_modes"
  | "invalid_guest_name"
  | "invalid_guest_email"
  | "invalid_guest_phone";

export interface BookingValidationIssue {
  code: BookingValidationCode;
  message: string;
  selectionKey?: string;
  field?: string;
}
