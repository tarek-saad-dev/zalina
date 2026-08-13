"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getTicketByBookingCode,
  type ApiBooking,
  type BookingTicketLookup,
} from "@/lib/api";
import { canShowBookingQr, isTicketMetadataReady } from "./bookingStatusModel";

export function useBookingTicket(
  booking: ApiBooking | null,
  locale?: string
) {
  const [ticket, setTicket] = useState<BookingTicketLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const lastCode = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!booking) return null;
    if (!canShowBookingQr(booking) && !isTicketMetadataReady(booking)) {
      return null;
    }
    const code = booking.booking_code;
    if (!code) return null;
    if (inFlight.current) return ticket;
    if (lastCode.current === code && ticket) return ticket;

    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const next = await getTicketByBookingCode(code, locale);
      lastCode.current = code;
      setTicket(next);
      return next;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(null); // still preparing
        setTicket(null);
        return null;
      }
      setError(err instanceof Error ? err.message : "Ticket unavailable");
      return null;
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [booking, locale, ticket]);

  useEffect(() => {
    if (!booking) {
      setTicket(null);
      lastCode.current = null;
      return;
    }
    if (canShowBookingQr(booking) || isTicketMetadataReady(booking)) {
      void load();
    }
  }, [
    booking?.booking_code,
    booking?.status,
    booking?.tickets_count,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    booking,
    load,
  ]);

  return { ticket, loading, error, reload: load };
}
