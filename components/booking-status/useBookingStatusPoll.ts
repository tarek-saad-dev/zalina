"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getBooking, type ApiBooking } from "@/lib/api";
import { isDurableTerminalBooking, shouldPollBooking } from "./bookingStatusModel";
import { BOOKING_POLL_RATE_LIMIT_PAUSE_MS, nextPollDelayMs } from "./bookingPollSchedule";
import { shouldPollEventBooking } from "@/lib/api/event-view";
import type { EventBooking } from "@/lib/api/events";
import { clearPendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";

const shouldPoll = (booking: ApiBooking | null) => booking && (booking.product_type as string) === "event" ? shouldPollEventBooking(booking as unknown as EventBooking) : shouldPollBooking(booking);
export type BookingStatusFetchState = "idle" | "loading" | "ready" | "not_found" | "error";
export interface UseBookingStatusPollOptions { reference: string | null; locale?: string; enabled?: boolean }
type Generation = { reference: string | null; locale?: string; enabled: boolean; active: boolean; booking: ApiBooking | null; inFlight: boolean; attempt: number; rateLimit: number; timer: ReturnType<typeof setTimeout> | null; notFound: boolean };
const makeGeneration = (reference: string | null, locale: string | undefined, enabled: boolean): Generation => ({ reference, locale, enabled, active: true, booking: null, inFlight: false, attempt: 0, rateLimit: 0, timer: null, notFound: false });

export function useBookingStatusPoll({ reference, locale, enabled = true }: UseBookingStatusPollOptions) {
  const current = useRef<Generation | null>(null);
  const inFlight = useRef(false);
  if (!current.current || current.current.reference !== reference || current.current.locale !== locale || current.current.enabled !== enabled) {
    if (current.current) current.current.active = false;
    current.current = makeGeneration(reference, locale, enabled);
    inFlight.current = false;
  }
  const [state, setState] = useState<{ gen: Generation; booking: ApiBooking | null; fetchState: BookingStatusFetchState; errorMessage: string | null; rateLimitedUntil: number | null; pollAttempt: number }>(() => ({ gen: current.current!, booking: null, fetchState: "idle", errorMessage: null, rateLimitedUntil: null, pollAttempt: 0 }));
  const valid = (g: Generation) => g.active && current.current === g;
  const update = (g: Generation, patch: Partial<Omit<typeof state, "gen">>) => { if (valid(g)) setState(s => s.gen === g ? { ...s, ...patch } : { gen: g, booking: g.booking, fetchState: "idle", errorMessage: null, rateLimitedUntil: null, pollAttempt: 0, ...patch }); };
  const clearTimer = (g: Generation) => { if (g.timer !== null) clearTimeout(g.timer); g.timer = null; };

  const run = useCallback((g: Generation) => {
    const fetchOnce = async (silent = false): Promise<ApiBooking | null> => {
      if (!valid(g) || !g.reference || !g.enabled || g.inFlight || Date.now() < g.rateLimit) return valid(g) ? g.booking : null;
      g.inFlight = true; inFlight.current = true;
      update(g, { ...(!silent && !g.booking ? { fetchState: "loading" as const } : {}), errorMessage: null });
      try {
        const next = await getBooking(g.reference, g.locale);
        if (!valid(g)) return null;
        if (next.booking_reference !== g.reference) throw new Error("Booking reference mismatch");
        g.booking = next; g.rateLimit = 0; g.notFound = false;
        if (isDurableTerminalBooking(next)) clearPendingPaymentBooking(next.booking_reference);
        update(g, { booking: next, fetchState: "ready", rateLimitedUntil: null });
        return next;
      } catch (err) {
        if (!valid(g)) return null;
        if (err instanceof ApiError && err.status === 404) { g.notFound = true; clearTimer(g); update(g, { fetchState: "not_found", errorMessage: err.message }); return null; }
        if (err instanceof ApiError && err.status === 429) { g.rateLimit = Date.now() + BOOKING_POLL_RATE_LIMIT_PAUSE_MS; update(g, { rateLimitedUntil: g.rateLimit }); }
        update(g, { fetchState: g.booking ? "ready" : "error", errorMessage: err instanceof Error ? err.message : "Unable to refresh reservation status" });
        return g.booking;
      } finally { g.inFlight = false; if (valid(g)) inFlight.current = false; }
    };
    const schedule = () => {
      clearTimer(g);
      if (!valid(g) || !g.enabled || !g.reference || g.notFound || (typeof document !== "undefined" && document.hidden) || (g.booking && !shouldPoll(g.booking))) return;
      const delay = g.rateLimit > Date.now() ? Math.max(g.rateLimit - Date.now(), 1000) : nextPollDelayMs(g.attempt);
      g.timer = setTimeout(async () => {
        if (!valid(g)) return;
        await fetchOnce(true);
        if (!valid(g)) return;
        g.attempt++; update(g, { pollAttempt: g.attempt }); schedule();
      }, delay);
    };
    return { fetchOnce, schedule };
  }, []);

  useEffect(() => {
    let g = current.current!;
    if (!g.active) { g = makeGeneration(reference, locale, enabled); current.current = g; inFlight.current = false; }
    const { fetchOnce, schedule } = run(g);
    update(g, { booking: null, fetchState: reference && enabled ? "loading" : "idle", errorMessage: null, rateLimitedUntil: null, pollAttempt: 0 });
    if (reference && enabled) void fetchOnce().then(() => { if (valid(g)) schedule(); });
    const visibility = () => { if (!valid(g)) return; if (document.hidden) clearTimer(g); else void fetchOnce(true).then(() => { if (valid(g)) schedule(); }); };
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", visibility);
    return () => { g.active = false; clearTimer(g); if (typeof document !== "undefined") document.removeEventListener("visibilitychange", visibility); };
  }, [reference, locale, enabled, run]);

  const refresh = useCallback(async () => {
    const g = current.current!; const { fetchOnce, schedule } = run(g);
    const next = await fetchOnce(Boolean(g.booking));
    if (valid(g) && next && shouldPoll(next)) { g.attempt = Math.min(g.attempt, 3); update(g, { pollAttempt: g.attempt }); schedule(); }
    return next;
  }, [run]);
  const visible = state.gen === current.current && current.current?.active ? state : { booking: null, fetchState: (reference && enabled ? "loading" : "idle") as BookingStatusFetchState, errorMessage: null, rateLimitedUntil: null, pollAttempt: 0 };
  return { ...visible, isPolling: Boolean(visible.booking) && Boolean(shouldPoll(visible.booking)) && visible.fetchState !== "not_found", refresh, inFlight };
}
