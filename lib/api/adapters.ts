import type { ApiMedia } from "./types";
import type {
  AccommodationAvailability,
  AccommodationType,
  ApiBooking,
  BookingBubble,
  BookingTicketLookup,
  BookingTicketSummary,
  CreateBubbleStayManualPayload,
  CreateBubbleStayRandomPayload,
  CreateDayUseBookingPayload,
  DayUseSettings,
  PhysicalBubble,
  TicketBubble,
  TicketGuest,
} from "./booking-types";
import {
  LEGACY_BOOKING_PAYLOAD_KEYS as LEGACY_KEYS,
  type LegacyBookingPayloadKey,
} from "./booking-types";

/* ─── Raw API shapes (tolerate collection drift) ─────────── */

export interface RawPhysicalBubble {
  id: number;
  code?: string;
  name_en: string;
  name_ar: string;
  status?: string;
  accommodation_type_id?: number;
  cover_image?: string | null;
  gallery?: Array<string | ApiMedia>;
  media?: ApiMedia[];
}

/**
 * Accommodation type catalog payloads may nest inventory bubbles as
 * `bubbles` or (in some collection snapshots) `available_bubbles` as an array.
 * Date availability uses numeric `available_bubbles` + `bubbles[]` — different concept.
 */
export interface RawAccommodationType {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  description_en?: string;
  description_ar?: string;
  max_guests: number;
  price_per_night?: string;
  /** @deprecated V1 field — ignored for V2 pricing; never sent on bookings. */
  base_price?: string;
  is_active: boolean;
  bubbles_count?: number;
  bubbles?: RawPhysicalBubble[];
  available_bubbles?: number | RawPhysicalBubble[];
  cover_image?: string | null;
  gallery?: Array<string | ApiMedia>;
  media?: ApiMedia[];
}

export interface RawAccommodationAvailability {
  availability: boolean;
  available_bubbles?: number | RawPhysicalBubble[];
  price_per_night?: string | null;
  total_estimate?: string | null;
  bubbles?: RawPhysicalBubble[];
}

export interface RawDayUseSettings {
  price_per_guest: string;
  currency: string;
  is_active: boolean;
  booking_notice?: string | null;
}

export interface RawBookingBubble {
  id: number;
  name_en: string;
  name_ar: string;
  guests: number;
  accommodation_type?: {
    id: number;
    name_en: string;
    name_ar: string;
    price_per_night: string;
    max_guests: number;
  };
}

export interface RawApiBooking {
  booking_reference: string;
  booking_code: string;
  product_type: "day_use" | "bubble_stay";
  status: string;
  operational_status?: string | null;
  total: string;
  currency?: string;
  guests: number;
  hold_expires_at?: string | null;
  payment_expires_at?: string | null;
  valid_from: string;
  valid_to: string;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  created_at: string;
  bubbles?: RawBookingBubble[];
  payment?: { status: string };
  tickets_count?: number;
  tickets?: Array<{
    ticket_code?: string;
    type: string;
    title?: string;
    valid_from?: string;
    valid_to?: string;
  }>;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

export interface RawTicketLookup {
  booking_code: string;
  booking_reference: string;
  product_type: "day_use" | "bubble_stay";
  status: string;
  payment_status?: string;
  guests: number;
  valid_from: string;
  valid_to: string;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  bubbles?: Array<{
    id: number;
    name_en: string;
    name_ar: string;
    type?: string;
    guests: number;
    valid_from?: string;
    valid_to?: string;
    accommodation_type?: RawBookingBubble["accommodation_type"];
  }>;
  guest?: {
    name?: string;
    email?: string;
    phone?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
  };
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  total?: string;
  currency?: string;
  payment?: { status: string };
}

function isBubbleArray(
  value: unknown
): value is RawPhysicalBubble[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item != null &&
        typeof item === "object" &&
        typeof (item as RawPhysicalBubble).id === "number"
    )
  );
}

export function normalizePhysicalBubble(
  raw: RawPhysicalBubble
): PhysicalBubble {
  return {
    id: raw.id,
    code: raw.code,
    name_en: raw.name_en,
    name_ar: raw.name_ar,
    status: raw.status ?? "available",
    accommodation_type_id: raw.accommodation_type_id,
    cover_image: raw.cover_image ?? null,
    gallery: raw.gallery,
    media: raw.media,
  };
}

/**
 * Normalize accommodation type catalog drift into a stable AccommodationType.
 * Catalog inventory bubbles → always `bubbles: PhysicalBubble[]`.
 */
export function normalizeAccommodationType(
  raw: RawAccommodationType
): AccommodationType {
  const fromBubbles = isBubbleArray(raw.bubbles) ? raw.bubbles : [];
  const fromAvailableAlias = isBubbleArray(raw.available_bubbles)
    ? raw.available_bubbles
    : [];

  const catalogBubbles = (
    fromBubbles.length > 0 ? fromBubbles : fromAvailableAlias
  ).map(normalizePhysicalBubble);

  const price =
    raw.price_per_night ??
    // Tolerate accidental V1 catalog leftovers on wire; never preferred.
    raw.base_price ??
    "0";

  const bubblesCount =
    typeof raw.bubbles_count === "number"
      ? raw.bubbles_count
      : catalogBubbles.length;

  return {
    id: raw.id,
    name_en: raw.name_en,
    name_ar: raw.name_ar,
    slug_en: raw.slug_en,
    slug_ar: raw.slug_ar,
    description_en: raw.description_en,
    description_ar: raw.description_ar,
    max_guests: raw.max_guests,
    price_per_night: String(price),
    is_active: raw.is_active,
    bubbles_count: bubblesCount,
    cover_image: raw.cover_image ?? null,
    gallery: raw.gallery,
    media: raw.media,
    bubbles: catalogBubbles,
  };
}

/**
 * Availability: keep numeric free-count separate from bookable `bubbles[]`.
 */
export function normalizeAccommodationAvailability(
  raw: RawAccommodationAvailability
): AccommodationAvailability {
  const bubbles = (raw.bubbles ?? []).map(normalizePhysicalBubble);

  let availableCount = 0;
  if (typeof raw.available_bubbles === "number") {
    availableCount = raw.available_bubbles;
  } else if (isBubbleArray(raw.available_bubbles)) {
    // Mis-shaped availability payloads: treat array length as count,
    // and prefer explicit `bubbles` list when present.
    availableCount = raw.available_bubbles.length;
  } else {
    availableCount = bubbles.length;
  }

  return {
    availability: Boolean(raw.availability),
    available_bubbles: availableCount,
    price_per_night:
      raw.price_per_night === undefined || raw.price_per_night === null
        ? null
        : String(raw.price_per_night),
    total_estimate:
      raw.total_estimate === undefined || raw.total_estimate === null
        ? null
        : String(raw.total_estimate),
    bubbles,
  };
}

export function normalizeDayUseSettings(raw: RawDayUseSettings): DayUseSettings {
  return {
    price_per_guest: String(raw.price_per_guest),
    currency: raw.currency,
    is_active: Boolean(raw.is_active),
    booking_notice: raw.booking_notice ?? null,
  };
}

function normalizeBookingBubble(raw: RawBookingBubble): BookingBubble {
  return {
    id: raw.id,
    name_en: raw.name_en,
    name_ar: raw.name_ar,
    guests: raw.guests,
    accommodation_type: raw.accommodation_type,
  };
}

function normalizeTicketSummary(
  raw: NonNullable<RawApiBooking["tickets"]>[number]
): BookingTicketSummary {
  return {
    ticket_code: raw.ticket_code,
    type: raw.type,
    title: raw.title,
    valid_from: raw.valid_from,
    valid_to: raw.valid_to,
  };
}

export function normalizeBooking(raw: RawApiBooking): ApiBooking {
  return {
    booking_reference: raw.booking_reference,
    booking_code: raw.booking_code,
    product_type: raw.product_type,
    status: raw.status,
    operational_status: raw.operational_status ?? null,
    total: String(raw.total),
    currency: raw.currency,
    guests: raw.guests,
    hold_expires_at: raw.hold_expires_at ?? null,
    payment_expires_at: raw.payment_expires_at ?? null,
    valid_from: raw.valid_from,
    valid_to: raw.valid_to,
    checked_in_at: raw.checked_in_at ?? null,
    checked_out_at: raw.checked_out_at ?? null,
    created_at: raw.created_at,
    bubbles: (raw.bubbles ?? []).map(normalizeBookingBubble),
    payment: raw.payment
      ? { status: raw.payment.status }
      : undefined,
    tickets_count: raw.tickets_count,
    tickets: raw.tickets?.map(normalizeTicketSummary),
    guest_name: raw.guest_name,
    guest_email: raw.guest_email,
    guest_phone: raw.guest_phone,
  };
}

function normalizeTicketGuest(raw: RawTicketLookup): TicketGuest | undefined {
  if (raw.guest) {
    const name = raw.guest.name ?? raw.guest.guest_name;
    const email = raw.guest.email ?? raw.guest.guest_email;
    const phone = raw.guest.phone ?? raw.guest.guest_phone;
    if (name && email && phone) {
      return { name, email, phone };
    }
  }
  if (raw.guest_name && raw.guest_email && raw.guest_phone) {
    return {
      name: raw.guest_name,
      email: raw.guest_email,
      phone: raw.guest_phone,
    };
  }
  return undefined;
}

function normalizeTicketBubble(
  raw: NonNullable<RawTicketLookup["bubbles"]>[number]
): TicketBubble {
  return {
    id: raw.id,
    name_en: raw.name_en,
    name_ar: raw.name_ar,
    type: raw.type,
    guests: raw.guests,
    valid_from: raw.valid_from,
    valid_to: raw.valid_to,
    accommodation_type: raw.accommodation_type,
  };
}

/** Isolate ticket-response drift (nested guest vs flat PII, etc.). */
export function normalizeTicketLookup(raw: RawTicketLookup): BookingTicketLookup {
  return {
    booking_code: raw.booking_code,
    booking_reference: raw.booking_reference,
    product_type: raw.product_type,
    status: raw.status,
    payment_status: raw.payment_status ?? raw.payment?.status,
    guests: raw.guests,
    valid_from: raw.valid_from,
    valid_to: raw.valid_to,
    checked_in_at: raw.checked_in_at ?? null,
    checked_out_at: raw.checked_out_at ?? null,
    bubbles: (raw.bubbles ?? []).map(normalizeTicketBubble),
    guest: normalizeTicketGuest(raw),
    total: raw.total,
    currency: raw.currency,
  };
}

/* ─── Payload builders (guarantee no V1 keys) ────────────── */

export function assertNoLegacyBookingFields(
  payload: Record<string, unknown>
): void {
  for (const key of LEGACY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      throw new Error(
        `Legacy Booking V1 field "${key}" must not be sent on Booking Domain V2 payloads.`
      );
    }
  }
}

export function buildDayUseBookingPayload(input: {
  visit_date: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}): CreateDayUseBookingPayload {
  const payload: CreateDayUseBookingPayload = {
    product_type: "day_use",
    visit_date: input.visit_date,
    guests: input.guests,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    guest_phone: input.guest_phone,
  };
  assertNoLegacyBookingFields(payload as unknown as Record<string, unknown>);
  return payload;
}

export function buildBubbleStayManualPayload(input: {
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  bubbles: CreateBubbleStayManualPayload["bubbles"];
}): CreateBubbleStayManualPayload {
  const payload: CreateBubbleStayManualPayload = {
    product_type: "bubble_stay",
    check_in: input.check_in,
    check_out: input.check_out,
    guests: input.guests,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    guest_phone: input.guest_phone,
    bubbles: input.bubbles.map((b) => ({
      accommodation_type_id: b.accommodation_type_id,
      bubble_id: b.bubble_id,
      guests: b.guests,
    })),
  };
  assertNoLegacyBookingFields(payload as unknown as Record<string, unknown>);
  for (const line of payload.bubbles) {
    assertNoLegacyBookingFields(line as unknown as Record<string, unknown>);
  }
  return payload;
}

export function buildBubbleStayRandomPayload(input: {
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  bubbles: CreateBubbleStayRandomPayload["bubbles"];
}): CreateBubbleStayRandomPayload {
  const payload: CreateBubbleStayRandomPayload = {
    product_type: "bubble_stay",
    check_in: input.check_in,
    check_out: input.check_out,
    guests: input.guests,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    guest_phone: input.guest_phone,
    random_assignment: true,
    bubbles: input.bubbles.map((b) => ({
      accommodation_type_id: b.accommodation_type_id,
      guests: b.guests,
    })),
  };
  assertNoLegacyBookingFields(payload as unknown as Record<string, unknown>);
  for (const line of payload.bubbles) {
    if ("bubble_id" in line && (line as { bubble_id?: unknown }).bubble_id != null) {
      throw new Error(
        "random_assignment Bubble Stay lines must omit bubble_id."
      );
    }
    assertNoLegacyBookingFields(line as unknown as Record<string, unknown>);
  }
  return payload;
}

export type { LegacyBookingPayloadKey };
export { LEGACY_KEYS as LEGACY_BOOKING_PAYLOAD_KEY_LIST };
