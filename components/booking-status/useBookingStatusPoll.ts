"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getBooking, type ApiBooking } from "@/lib/api";
import {
  isDurableTerminalBooking,
  shouldPollBooking,
} from "./bookingStatusModel";
import {
  BOOKING_POLL_RATE_LIMIT_PAUSE_MS,
  nextPollDelayMs,
} from "./bookingPollSchedule";
import { shouldPollEventBooking } from "@/lib/api/event-view";
import type { EventBooking } from "@/lib/api/events";
const shouldPoll = (booking: ApiBooking | null) => booking && (booking.product_type as string) === "event" ? shouldPollEventBooking(booking as unknown as EventBooking) : shouldPollBooking(booking);
import { clearPendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";

export type BookingStatusFetchState =
  | "idle"
  | "loading"
  | "ready"
  | "not_found"
  | "error";

export interface UseBookingStatusPollOptions {
  reference: string | null;
  locale?: string;
  enabled?: boolean;
}

export function useBookingStatusPoll({
  reference,
  locale,
  enabled = true,
}: UseBookingStatusPollOptions) {
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [fetchState, setFetchState] =
    useState<BookingStatusFetchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);

  const rateLimitRef = useRef(0);
  const inFlightRef = useRef(false);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);
  const bookingRef = useRef<ApiBooking | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyBooking = useCallback((next: ApiBooking) => {
    bookingRef.current = next;
    setBooking(next);
    if (isDurableTerminalBooking(next)) {
      clearPendingPaymentBooking(next.booking_reference);
    }
  }, []);

  const fetchOnce = useCallback(
    async (opts?: { silent?: boolean }): Promise<ApiBooking | null> => {
      if (!reference || !enabled) return null;
      if (inFlightRef.current) return bookingRef.current;
      if (Date.now() < rateLimitRef.current) {
        return bookingRef.current;
      }

      inFlightRef.current = true;
      if (!opts?.silent && !bookingRef.current) {
        setFetchState("loading");
      }
      setErrorMessage(null);

      try {
        const next = await getBooking(reference, locale);
        if (!mountedRef.current) return null;
        if (next.booking_reference !== reference) throw new Error("Booking reference mismatch");
        applyBooking(next);
        setFetchState("ready");
        rateLimitRef.current = 0;
        setRateLimitedUntil(null);
        return next;
      } catch (err) {
        if (!mountedRef.current) return null;
        if (err instanceof ApiError && err.status === 404) {
          setFetchState("not_found");
          setErrorMessage(err.message);
          clearTimer();
          return null;
        }
        if (err instanceof ApiError && err.status === 429) {
          rateLimitRef.current = Date.now() + BOOKING_POLL_RATE_LIMIT_PAUSE_MS;
          setRateLimitedUntil(rateLimitRef.current);
          setErrorMessage(err.message);
          // Keep last known state
          if (bookingRef.current) setFetchState("ready");
          else setFetchState("error");
          return bookingRef.current;
        }
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to refresh reservation status"
        );
        if (bookingRef.current) setFetchState("ready");
        else setFetchState("error");
        return bookingRef.current;
      } finally {
        inFlightRef.current = false;
      }
    },
    [applyBooking, clearTimer, enabled, locale, rateLimitedUntil, reference]
  );

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (!enabled || !reference || fetchState === "not_found") return;
    if (hiddenRef.current) return;

    const current = bookingRef.current;
    if (current && !shouldPoll(current)) return;

    const delay =
      rateLimitRef.current > Date.now()
        ? Math.max(rateLimitRef.current - Date.now(), 1000)
        : nextPollDelayMs(attemptRef.current);

    timerRef.current = setTimeout(() => {
      void (async () => {
        const next = await fetchOnce({ silent: true });
        if (!mountedRef.current) return;
        attemptRef.current += 1;
        setPollAttempt(attemptRef.current);
        if (!next || shouldPoll(next)) {
          scheduleNext();
        }
      })();
    }, delay);
  }, [
    clearTimer,
    enabled,
    fetchState,
    fetchOnce,
    rateLimitedUntil,
    reference,
  ]);

  // Initial load + restart when reference changes
  useEffect(() => {
    attemptRef.current = 0;
    setPollAttempt(0);
    bookingRef.current = null;
    setBooking(null);
    setErrorMessage(null);
    rateLimitRef.current = 0;
    setRateLimitedUntil(null);
    clearTimer();

    if (!reference || !enabled) {
      setFetchState("idle");
      return;
    }

    void (async () => {
      const next = await fetchOnce({ silent: false });
      if (!mountedRef.current) return;
      if (!next || shouldPoll(next)) {
        scheduleNext();
      }
    })();

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional reset on reference
  }, [reference, enabled, locale]);

  // Visibility: pause aggressive polling; refresh on return
  useEffect(() => {
    if (typeof document === "undefined") return;

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (document.hidden) {
        clearTimer();
        return;
      }
      void (async () => {
        const next = await fetchOnce({ silent: true });
        if (next && shouldPoll(next)) {
          scheduleNext();
        }
      })();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [clearTimer, fetchOnce, scheduleNext]);

  // Resume scheduling when rate-limit window ends
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const wait = Math.max(rateLimitedUntil - Date.now(), 0);
    const id = setTimeout(() => {
      setRateLimitedUntil(null);
      if (!bookingRef.current || shouldPoll(bookingRef.current)) {
        scheduleNext();
      }
    }, wait + 50);
    return () => clearTimeout(id);
  }, [rateLimitedUntil, scheduleNext]);

  const refresh = useCallback(async () => {
    const next = await fetchOnce({ silent: Boolean(bookingRef.current) });
    if (next && shouldPoll(next)) {
      attemptRef.current = Math.min(attemptRef.current, 3);
      setPollAttempt(attemptRef.current);
      scheduleNext();
    }
    return next;
  }, [fetchOnce, scheduleNext]);

  return {
    booking,
    fetchState,
    errorMessage,
    rateLimitedUntil,
    pollAttempt,
    isPolling:
      Boolean(booking) &&
      shouldPoll(booking) &&
      fetchState !== "not_found",
    refresh,
    inFlight: inFlightRef,
  };
}
