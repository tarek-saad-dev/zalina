import {
  ApiError,
  createBubbleStayBooking,
  createDayUseBooking,
  initiatePayment,
  type ApiBooking,
  type PaymentGateway,
} from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import {
  createInitialCheckoutState,
  isBusyCheckoutPhase,
  type CheckoutError,
  type CheckoutPhase,
  type CheckoutState,
} from "./checkoutTypes";
import { prepareBookingPayload } from "./prepareBookingPayload";
import { resolvePaymentGateway } from "./paymentGateway";
import {
  isSafePaymentUrl,
  navigateAfterPaymentInitiation,
} from "./paymentUrl";
import { savePendingPaymentBooking } from "./paymentHandoffStorage";
import { pickExpiryTimestamp } from "./useHoldCountdown";
import { selectEstimatedTotal } from "./bookingSelectors";
import { validateFullBookingReadiness } from "./bookingValidation";

export function mapCreateError(err: unknown): CheckoutError {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return {
        message:
          err.message ||
          "This bubble was just booked by another guest. We've refreshed the available bubbles.",
        status: 409,
        fieldErrors: err.errors,
        kind: "conflict",
      };
    }
    if (err.status === 422) {
      return {
        message: err.message || "Please check your booking details.",
        status: 422,
        fieldErrors: err.errors,
        kind: "validation",
      };
    }
    if (err.status === 429) {
      return {
        message:
          err.message ||
          "Too many requests. Please wait a moment before trying again.",
        status: 429,
        fieldErrors: err.errors,
        kind: "rate_limit",
      };
    }
    return {
      message: err.message || "Unable to create your reservation.",
      status: err.status,
      fieldErrors: err.errors,
      kind: "generic",
    };
  }

  if (err instanceof TypeError) {
    return {
      message:
        "We could not confirm whether your reservation was created. Please wait a moment, then check carefully before trying again — do not submit repeatedly.",
      status: null,
      kind: "network",
    };
  }

  return {
    message: "Unable to create your reservation. Please try again.",
    status: null,
    kind: "generic",
  };
}

export function mapPaymentError(err: unknown): CheckoutError {
  if (err instanceof ApiError) {
    if (err.status === 404) {
      return {
        message: err.message || "Booking not found.",
        status: 404,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 409) {
      return {
        message:
          err.message ||
          "This booking appears to be already paid. Your reference has been saved for lookup.",
        status: 409,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 422) {
      return {
        message:
          err.message ||
          "This reservation hold has expired. Please check availability again.",
        status: 422,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 429) {
      return {
        message:
          err.message ||
          "Too many payment attempts. Please wait a moment before retrying.",
        status: 429,
        kind: "rate_limit",
        requestId: err.requestId,
      };
    }
    const base = err.message?.trim() || "Unable to start payment.";
    const withRef =
      err.status != null && err.status >= 500 && err.requestId
        ? `${base} You can retry payment without creating a new booking. Support ref: ${err.requestId}`
        : err.status != null && err.status >= 500
          ? `${base} You can retry payment without creating a new booking.`
          : base;
    return {
      message: withRef,
      status: err.status,
      kind: "payment",
      requestId: err.requestId,
    };
  }

  if (err instanceof TypeError) {
    return {
      message:
        "Payment could not be started due to a network issue. Your reservation hold is unchanged — you can retry payment.",
      status: null,
      kind: "network",
    };
  }

  return {
    message:
      "Unable to start payment. You can retry without creating a new booking.",
    status: null,
    kind: "payment",
  };
}

/** Documented production pay body — no return_url / callback_url. */
export function buildPaymentInitBody(gateway: PaymentGateway): {
  gateway: PaymentGateway;
} {
  return { gateway };
}

export function isHoldExpired(booking: ApiBooking, nowMs = Date.now()): boolean {
  const expiry = pickExpiryTimestamp({
    payment_expires_at: booking.payment_expires_at,
    hold_expires_at: booking.hold_expires_at,
  });
  if (expiry == null) return false;
  return nowMs >= expiry;
}

export interface CheckoutRunnerDeps {
  createDayUse?: typeof createDayUseBooking;
  createBubbleStay?: typeof createBubbleStayBooking;
  pay?: typeof initiatePayment;
  resolveGateway?: () => PaymentGateway;
  persist?: (booking: ApiBooking) => void;
  navigate?: (url: string, bookingReference?: string) => void;
  onBubbleConflict?: (message: string) => void;
}

/**
 * Testable checkout orchestrator — single create pipeline + idempotent pay.
 * Booking creation is NOT client-idempotent; payment initiation is.
 */
export class BookingCheckoutRunner {
  state: CheckoutState = createInitialCheckoutState();
  private inFlight = false;
  private createCount = 0;
  private payCount = 0;
  private lastPayReference: string | null = null;
  private lastPayBody: { gateway: PaymentGateway } | null = null;

  constructor(private deps: CheckoutRunnerDeps = {}) {}

  get createCallCount() {
    return this.createCount;
  }

  get payCallCount() {
    return this.payCount;
  }

  get lastPaymentReference() {
    return this.lastPayReference;
  }

  get lastPaymentBody() {
    return this.lastPayBody;
  }

  reset() {
    this.state = createInitialCheckoutState();
    this.inFlight = false;
    this.createCount = 0;
    this.payCount = 0;
    this.lastPayReference = null;
    this.lastPayBody = null;
  }

  setPhase(phase: CheckoutPhase) {
    this.state = { ...this.state, phase };
  }

  seedBooking(booking: ApiBooking, estimate: number | null = null) {
    this.state = {
      phase: "created",
      booking,
      error: null,
      estimateAtCreate: estimate,
      statusMessage:
        "Your booking is temporarily reserved while you complete payment.",
    };
  }

  async create(
    wizard: BookingState,
    accommodationTypes: AccommodationTypeMeta[],
    dayUsePricePerGuest?: number | null,
    locale?: string
  ): Promise<ApiBooking | null> {
    if (this.inFlight || isBusyCheckoutPhase(this.state.phase)) return null;
    if (this.state.booking) return this.state.booking;

    const prepared = prepareBookingPayload(wizard, accommodationTypes);
    if (!prepared) {
      const readiness = validateFullBookingReadiness(
        wizard,
        accommodationTypes
      );
      this.state = {
        ...this.state,
        phase: "error",
        error: {
          message:
            readiness[0]?.message ??
            "Please complete all booking details before continuing.",
          status: null,
          kind: "validation",
        },
        statusMessage: null,
      };
      return null;
    }

    this.inFlight = true;
    const estimate = selectEstimatedTotal(
      wizard,
      accommodationTypes,
      dayUsePricePerGuest
    );
    this.state = {
      ...this.state,
      phase: "creating",
      error: null,
      estimateAtCreate: estimate,
      statusMessage: "Securing your reservation…",
    };

    const createDayUse = this.deps.createDayUse ?? createDayUseBooking;
    const createBubbleStay = this.deps.createBubbleStay ?? createBubbleStayBooking;
    const persist = this.deps.persist ?? savePendingPaymentBooking;

    try {
      this.createCount += 1;
      const booking =
        prepared.product === "day_use"
          ? await createDayUse(prepared.payload, locale)
          : await createBubbleStay(prepared.payload, locale);

      persist(booking);
      this.state = {
        phase: "created",
        booking,
        error: null,
        estimateAtCreate: estimate,
        statusMessage:
          "Your booking is temporarily reserved while you complete payment.",
      };
      // Keep inFlight locked across create → pay so a second click cannot
      // start a duplicate /pay before pay() sets its own lock.
      return booking;
    } catch (err) {
      this.inFlight = false;
      const mapped = mapCreateError(err);
      this.state = {
        ...this.state,
        phase: "error",
        booking: mapped.kind === "conflict" ? null : this.state.booking,
        error: mapped,
        statusMessage: null,
      };
      if (mapped.kind === "conflict") {
        this.deps.onBubbleConflict?.(mapped.message);
      }
      return null;
    }
  }

  async pay(booking: ApiBooking, locale?: string): Promise<boolean> {
    // Allow create→pay handoff while inFlight is still held from create().
    if (this.inFlight && this.state.phase !== "created") return false;
    if (isHoldExpired(booking)) {
      this.inFlight = false;
      this.state = {
        ...this.state,
        phase: "expired",
        booking,
        statusMessage:
          "Your reservation hold has expired. Please check availability again.",
        error: {
          message:
            "Your reservation hold has expired. Please check availability again.",
          status: null,
          kind: "payment",
        },
      };
      return false;
    }

    this.inFlight = true;
    this.state = {
      ...this.state,
      phase: "initiating_payment",
      error: null,
      booking,
      statusMessage: "Preparing secure payment…",
    };

    const pay = this.deps.pay ?? initiatePayment;
    const resolveGateway = this.deps.resolveGateway ?? resolvePaymentGateway;
    const persist = this.deps.persist ?? savePendingPaymentBooking;
    const navigate =
      this.deps.navigate ??
      ((url: string, bookingRef?: string) => {
        if (bookingRef) {
          navigateAfterPaymentInitiation({
            paymentUrl: url,
            bookingReference: bookingRef,
          });
          return;
        }
        window.location.assign(url);
      });

    try {
      const gateway = resolveGateway();
      const body = buildPaymentInitBody(gateway);
      this.lastPayBody = body;
      this.lastPayReference = booking.booking_reference;
      this.payCount += 1;

      const session = await pay(booking.booking_reference, gateway, locale);

      if (!isSafePaymentUrl(session.payment_url)) {
        this.inFlight = false;
        this.state = {
          ...this.state,
          phase: "error",
          error: {
            message:
              "Payment could not be started — invalid payment link from server.",
            status: null,
            kind: "payment",
          },
          statusMessage: null,
        };
        return false;
      }

      persist(booking);
      this.state = {
        ...this.state,
        phase: "redirecting",
        statusMessage: "Redirecting to secure payment…",
      };
      navigate(session.payment_url, booking.booking_reference);
      // Page unload expected; clear lock so retry paths remain usable if navigation is blocked.
      this.inFlight = false;
      return true;
    } catch (err) {
      this.inFlight = false;
      const mapped = mapPaymentError(err);
      if (mapped.status === 409) {
        persist(booking);
        this.state = {
          ...this.state,
          phase: "already_paid",
          booking,
          error: mapped,
          statusMessage: mapped.message,
        };
        return false;
      }
      if (mapped.status === 422) {
        this.state = {
          ...this.state,
          phase: "expired",
          booking,
          error: mapped,
          statusMessage: mapped.message,
        };
        return false;
      }
      this.state = {
        ...this.state,
        phase: "error",
        booking,
        error: mapped,
        statusMessage: null,
      };
      return false;
    }
  }

  async reserveAndPay(
    wizard: BookingState,
    accommodationTypes: AccommodationTypeMeta[],
    dayUsePricePerGuest?: number | null,
    locale?: string
  ): Promise<void> {
    if (this.inFlight || isBusyCheckoutPhase(this.state.phase)) return;

    let booking = this.state.booking;
    if (!booking) {
      booking = await this.create(
        wizard,
        accommodationTypes,
        dayUsePricePerGuest,
        locale
      );
      if (!booking) return;
    }
    await this.pay(booking, locale);
  }

  async retryPayment(locale?: string): Promise<void> {
    const booking = this.state.booking;
    if (!booking || this.inFlight) return;
    await this.pay(booking, locale);
  }
}
