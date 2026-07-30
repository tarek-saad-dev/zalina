import { apiFetch } from "./client";
import type {
  ApiAvailability,
  ApiBooking,
  ApiPaymentSession,
  CreateBookingPayload,
} from "./types";

export function checkAvailability(
  accommodationSlug: string,
  params: {
    check_in: string;
    check_out: string;
    guests: number;
  },
  locale = "en"
): Promise<ApiAvailability> {
  return apiFetch<ApiAvailability>(
    `/accommodations/${accommodationSlug}/availability`,
    {
      locale,
      searchParams: {
        check_in: params.check_in,
        check_out: params.check_out,
        guests: params.guests,
      },
      cache: "no-store",
    }
  );
}

export function createBooking(
  payload: CreateBookingPayload,
  locale = "en"
): Promise<ApiBooking> {
  return apiFetch<ApiBooking>("/bookings", {
    method: "POST",
    locale,
    body: payload,
    cache: "no-store",
  });
}

export function getBooking(
  reference: string,
  locale = "en"
): Promise<ApiBooking> {
  return apiFetch<ApiBooking>(`/bookings/${reference}`, {
    locale,
    cache: "no-store",
  });
}

export function initiatePayment(
  reference: string,
  gateway: "paymob" | "mock" = "paymob",
  locale = "en"
): Promise<ApiPaymentSession> {
  return apiFetch<ApiPaymentSession>(`/bookings/${reference}/pay`, {
    method: "POST",
    locale,
    body: { gateway },
    cache: "no-store",
  });
}
