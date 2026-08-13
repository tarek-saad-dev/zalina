import { apiFetch } from "./client";
import {
  assertNoLegacyBookingFields,
  buildBubbleStayManualPayload,
  buildBubbleStayRandomPayload,
  buildDayUseBookingPayload,
  normalizeBooking,
  type RawApiBooking,
} from "./adapters";
import type {
  ApiBooking,
  CreateBubbleStayBookingPayload,
  CreateBubbleStayManualPayload,
  CreateBubbleStayRandomPayload,
  CreateDayUseBookingPayload,
} from "./booking-types";
import { resolveApiLocale } from "./locale";

function postBooking(
  payload: CreateDayUseBookingPayload | CreateBubbleStayBookingPayload,
  locale?: string
): Promise<ApiBooking> {
  assertNoLegacyBookingFields(payload as unknown as Record<string, unknown>);
  return apiFetch<RawApiBooking>("/bookings", {
    method: "POST",
    locale: resolveApiLocale(locale),
    body: payload,
    cache: "no-store",
  }).then(normalizeBooking);
}

/** POST /bookings — Day Use product. */
export async function createDayUseBooking(
  input:
    | Omit<CreateDayUseBookingPayload, "product_type">
    | CreateDayUseBookingPayload,
  locale?: string
): Promise<ApiBooking> {
  const payload: CreateDayUseBookingPayload =
    "product_type" in input && input.product_type === "day_use"
      ? input
      : buildDayUseBookingPayload(input);
  return postBooking(payload, locale);
}

/** POST /bookings — Bubble Stay (manual bubble_id lines or random_assignment). */
export async function createBubbleStayBooking(
  input: CreateBubbleStayBookingPayload,
  locale?: string
): Promise<ApiBooking> {
  const payload: CreateBubbleStayBookingPayload =
    "random_assignment" in input && input.random_assignment === true
      ? buildBubbleStayRandomPayload(input)
      : buildBubbleStayManualPayload(input as CreateBubbleStayManualPayload);
  return postBooking(payload, locale);
}

/** Convenience: build + create Day Use from field bag. */
export async function createDayUseBookingFromFields(
  fields: {
    visit_date: string;
    guests: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
  },
  locale?: string
): Promise<ApiBooking> {
  return createDayUseBooking(buildDayUseBookingPayload(fields), locale);
}

/** Convenience: build + create manual Bubble Stay. */
export async function createBubbleStayManualBooking(
  fields: {
    check_in: string;
    check_out: string;
    guests: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    bubbles: CreateBubbleStayManualPayload["bubbles"];
  },
  locale?: string
): Promise<ApiBooking> {
  return createBubbleStayBooking(buildBubbleStayManualPayload(fields), locale);
}

/** Convenience: build + create random-assignment Bubble Stay. */
export async function createBubbleStayRandomBooking(
  fields: {
    check_in: string;
    check_out: string;
    guests: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    bubbles: CreateBubbleStayRandomPayload["bubbles"];
  },
  locale?: string
): Promise<ApiBooking> {
  return createBubbleStayBooking(buildBubbleStayRandomPayload(fields), locale);
}

/** GET /bookings/{reference} — public poll surface; guest PII may be absent. */
export async function getBooking(
  reference: string,
  locale?: string
): Promise<ApiBooking> {
  const raw = await apiFetch<RawApiBooking>(`/bookings/${reference}`, {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return normalizeBooking(raw);
}
