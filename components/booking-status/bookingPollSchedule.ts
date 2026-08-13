/**
 * Bounded progressive polling intervals (ms).
 * Starts ~2.5s, then 5s, then 8–10s, then slower background cadence.
 */
export const BOOKING_POLL_INTERVALS_MS = [
  2500, 2500, 3000, 5000, 5000, 8000, 10000, 15000, 20000, 30000,
] as const;

/** After exhausting the schedule, keep a slow background poll. */
export const BOOKING_POLL_BACKGROUND_MS = 30_000;

/** Temporary pause after HTTP 429. */
export const BOOKING_POLL_RATE_LIMIT_PAUSE_MS = 20_000;

export function nextPollDelayMs(attemptIndex: number): number {
  if (attemptIndex < 0) return BOOKING_POLL_INTERVALS_MS[0];
  if (attemptIndex < BOOKING_POLL_INTERVALS_MS.length) {
    return BOOKING_POLL_INTERVALS_MS[attemptIndex];
  }
  return BOOKING_POLL_BACKGROUND_MS;
}
