import { ApiError, getBooking, type ApiBooking } from "@/lib/api";
import { clearPendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import {
  isDurableTerminalBooking,
  shouldPollBooking,
} from "./bookingStatusModel";
import {
  BOOKING_POLL_RATE_LIMIT_PAUSE_MS,
  nextPollDelayMs,
} from "./bookingPollSchedule";

export type PollFetchState =
  | "idle"
  | "loading"
  | "ready"
  | "not_found"
  | "error";

export interface PollControllerDeps {
  getBookingFn?: typeof getBooking;
  clearHandoff?: () => void;
  now?: () => number;
  isDocumentHidden?: () => boolean;
}

/**
 * Testable polling controller — no React.
 * Ensures non-overlapping fetches, backoff, 429 pause, visibility gate.
 */
export class BookingStatusPollController {
  booking: ApiBooking | null = null;
  fetchState: PollFetchState = "idle";
  errorMessage: string | null = null;
  rateLimitedUntil: number | null = null;
  attemptIndex = 0;
  fetchCount = 0;
  inFlight = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(
    private reference: string,
    private locale?: string,
    private deps: PollControllerDeps = {}
  ) {}

  private now() {
    return this.deps.now?.() ?? Date.now();
  }

  private hidden() {
    return this.deps.isDocumentHidden?.() ?? false;
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  async fetchOnce(silent = false): Promise<ApiBooking | null> {
    if (this.stopped) return this.booking;
    if (this.inFlight) return this.booking;
    if (this.rateLimitedUntil && this.now() < this.rateLimitedUntil) {
      return this.booking;
    }

    this.inFlight = true;
    if (!silent && !this.booking) this.fetchState = "loading";
    this.errorMessage = null;
    this.fetchCount += 1;

    const get = this.deps.getBookingFn ?? getBooking;
    const clearHandoff = this.deps.clearHandoff ?? clearPendingPaymentBooking;

    try {
      const next = await get(this.reference, this.locale);
      this.booking = next;
      this.fetchState = "ready";
      this.rateLimitedUntil = null;
      if (isDurableTerminalBooking(next)) clearHandoff();
      return next;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        this.fetchState = "not_found";
        this.errorMessage = err.message;
        this.stop();
        return null;
      }
      if (err instanceof ApiError && err.status === 429) {
        this.rateLimitedUntil = this.now() + BOOKING_POLL_RATE_LIMIT_PAUSE_MS;
        this.errorMessage = err.message;
        this.fetchState = this.booking ? "ready" : "error";
        return this.booking;
      }
      this.errorMessage =
        err instanceof Error ? err.message : "Unable to refresh";
      this.fetchState = this.booking ? "ready" : "error";
      return this.booking;
    } finally {
      this.inFlight = false;
    }
  }

  scheduleNext(onTick?: () => void): void {
    if (this.stopped) return;
    if (this.timer) clearTimeout(this.timer);
    if (this.hidden()) return;
    if (this.booking && !shouldPollBooking(this.booking)) return;
    if (this.fetchState === "not_found") return;

    const delay =
      this.rateLimitedUntil && this.now() < this.rateLimitedUntil
        ? Math.max(this.rateLimitedUntil - this.now(), 1000)
        : nextPollDelayMs(this.attemptIndex);

    this.timer = setTimeout(() => {
      void (async () => {
        await this.fetchOnce(true);
        this.attemptIndex += 1;
        onTick?.();
        if (this.booking && shouldPollBooking(this.booking)) {
          this.scheduleNext(onTick);
        }
      })();
    }, delay);
  }

  async start(): Promise<void> {
    const next = await this.fetchOnce(false);
    if (next && shouldPollBooking(next)) {
      this.scheduleNext();
    }
  }
}
