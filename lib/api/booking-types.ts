import type { MediaAsset } from "@/lib/media";

/** Booking Domain V2 product types (contract constants). */
export type BookingProductType = "day_use" | "bubble_stay";

/** Guest-facing / admin booking lifecycle statuses from the V2 brief. */
export type BookingStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "no_show"
  | (string & {});

export type PaymentGateway = "paymob" | "mock";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | (string & {});

export type TicketType = "day_use" | "bubble" | (string & {});

/* ─── Day Use settings ───────────────────────────────────── */

export interface DayUseSettings {
  price_per_guest: string;
  currency: string;
  is_active: boolean;
  booking_notice: string | null;
}

/* ─── Physical bubbles & accommodation types ─────────────── */

/**
 * Physical bubble inventory unit (catalog or date-specific availability).
 * Optional fields stay optional — Postman snapshots vary slightly.
 */
export interface PhysicalBubble {
  id: number;
  code?: string;
  name_en: string;
  name_ar: string;
  status: string;
  accommodation_type_id?: number;
  cover_image?: MediaAsset | null;
  gallery?: MediaAsset[];
  media?: MediaAsset[];
}

/**
 * Stable internal accommodation type shape.
 * Catalog bubbles always live on `bubbles` (never a numeric count field).
 */
export interface AccommodationType {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  description_en?: string;
  description_ar?: string;
  max_guests: number;
  price_per_night: string;
  is_active: boolean;
  bubbles_count: number;
  cover_image?: MediaAsset | null;
  gallery?: MediaAsset[];
  media?: MediaAsset[];
  /** Normalized catalog / inventory bubbles for this type. */
  bubbles: PhysicalBubble[];
}

/**
 * Date-window availability for one accommodation type.
 * `available_bubbles` is the numeric free count.
 * `bubbles` is the list of bookable physical bubbles for those dates.
 */
export interface AccommodationAvailability {
  availability: boolean;
  available_bubbles: number;
  price_per_night: string | null;
  total_estimate: string | null;
  bubbles: PhysicalBubble[];
}

/* ─── Create payloads (strict V2 — no V1 fields) ─────────── */

export interface CreateDayUseBookingPayload {
  product_type: "day_use";
  visit_date: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

export interface BubbleStayManualBubbleLine {
  accommodation_type_id: number;
  bubble_id: number;
  guests: number;
}

export interface CreateBubbleStayManualPayload {
  product_type: "bubble_stay";
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  bubbles: BubbleStayManualBubbleLine[];
}

export interface BubbleStayRandomBubbleLine {
  accommodation_type_id: number;
  guests: number;
}

export interface CreateBubbleStayRandomPayload {
  product_type: "bubble_stay";
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  random_assignment: true;
  bubbles: BubbleStayRandomBubbleLine[];
}

export type CreateBubbleStayBookingPayload =
  | CreateBubbleStayManualPayload
  | CreateBubbleStayRandomPayload;

export type CreateBookingV2Payload =
  | CreateDayUseBookingPayload
  | CreateBubbleStayBookingPayload;

/** Keys removed in Booking Domain V2 — must never appear on create payloads. */
export const LEGACY_BOOKING_PAYLOAD_KEYS = [
  "accommodation_id",
  "check_in_date",
  "check_out_date",
  "add_ons",
  "experiences",
] as const;

export type LegacyBookingPayloadKey =
  (typeof LEGACY_BOOKING_PAYLOAD_KEYS)[number];

/* ─── Booking response ───────────────────────────────────── */

export interface BookingBubbleAccommodationType {
  id: number;
  name_en: string;
  name_ar: string;
  price_per_night: string;
  max_guests: number;
}

export interface BookingBubble {
  id: number;
  name_en: string;
  name_ar: string;
  guests: number;
  accommodation_type?: BookingBubbleAccommodationType;
}

export interface BookingTicketSummary {
  ticket_code?: string;
  type: TicketType;
  title?: string;
  valid_from?: string;
  valid_to?: string;
}

export interface BookingPaymentSummary {
  status: PaymentStatus;
}

/**
 * Public / create booking resource.
 * Guest PII is present on create responses; public GET by reference omits it.
 */
export interface ApiBooking {
  booking_reference: string;
  booking_code: string;
  product_type: BookingProductType;
  status: BookingStatus;
  operational_status?: string | null;
  total: string;
  currency?: string;
  guests: number;
  hold_expires_at: string | null;
  payment_expires_at: string | null;
  valid_from: string;
  valid_to: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  bubbles: BookingBubble[];
  payment?: BookingPaymentSummary;
  tickets_count?: number;
  tickets?: BookingTicketSummary[];
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

export interface ApiPaymentSession {
  payment_url: string;
}

/* ─── Ticket lookup ──────────────────────────────────────── */

export interface TicketGuest {
  name: string;
  email: string;
  phone: string;
}

export interface TicketBubble {
  id: number;
  name_en: string;
  name_ar: string;
  type?: string;
  guests: number;
  valid_from?: string;
  valid_to?: string;
  accommodation_type?: BookingBubbleAccommodationType;
}

/**
 * Booking-level ticket lookup (one booking → one booking_code / QR).
 * Do not assume one ticket per bubble.
 */
export interface BookingTicketLookup {
  booking_code: string;
  booking_reference: string;
  product_type: BookingProductType;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  guests: number;
  valid_from: string;
  valid_to: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  bubbles: TicketBubble[];
  guest?: TicketGuest;
  total?: string;
  currency?: string;
}
