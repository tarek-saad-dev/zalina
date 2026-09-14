import {
  ApiError,
  createBubbleStayBooking,
  createDayUseBooking,
  initiatePayment,
  type ApiBooking,
  type PaymentGateway,
} from "@/lib/api";
import type {
  AccommodationTypeMeta,
  BookingState,
  BookingValidationIssue,
} from "./types";
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
import {
  translateValidationIssue,
  validateFullBookingReadiness,
} from "./bookingValidation";

/** Localized checkout strings — keys mirror `bookNow.checkout.*`. */
export type CheckoutCopy = {
  conflict: string;
  validation: string;
  rateLimit: string;
  createFailed: string;
  createNetwork: string;
  createRetry: string;
  incomplete: string;
  securing: string;
  reserved: string;
  holdExpired: string;
  preparingPayment: string;
  redirecting: string;
  invalidPaymentLink: string;
  bookingNotFound: string;
  alreadyPaid: string;
  paymentExpired: string;
  paymentRateLimit: string;
  paymentFailed: string;
  /** Template: `{message}` `{requestId}` */
  paymentRetrySupport: string;
  /** Template: `{message}` */
  paymentRetry: string;
  paymentNetwork: string;
  paymentRetryNoNew: string;
  productsLoadFailed: string;
};

export const DEFAULT_CHECKOUT_COPY: CheckoutCopy = {
  conflict:
    "This bubble was just booked by another guest. We've refreshed the available bubbles.",
  validation: "Please check your booking details.",
  rateLimit: "Too many requests. Please wait a moment before trying again.",
  createFailed: "Unable to create your reservation.",
  createNetwork:
    "We could not confirm whether your reservation was created. Please wait a moment, then check carefully before trying again — do not submit repeatedly.",
  createRetry: "Unable to create your reservation. Please try again.",
  incomplete: "Please complete all booking details before continuing.",
  securing: "Securing your reservation…",
  reserved: "Your booking is temporarily reserved while you complete payment.",
  holdExpired:
    "Your reservation hold has expired. Please check availability again.",
  preparingPayment: "Preparing secure payment…",
  redirecting: "Redirecting to secure payment…",
  invalidPaymentLink:
    "Payment could not be started — invalid payment link from server.",
  bookingNotFound: "Booking not found.",
  alreadyPaid:
    "This booking appears to be already paid. Your reference has been saved for lookup.",
  paymentExpired:
    "This reservation hold has expired. Please check availability again.",
  paymentRateLimit:
    "Too many payment attempts. Please wait a moment before retrying.",
  paymentFailed: "Unable to start payment.",
  paymentRetrySupport:
    "{message} You can retry payment without creating a new booking. Support ref: {requestId}",
  paymentRetry:
    "{message} You can retry payment without creating a new booking.",
  paymentNetwork:
    "Payment could not be started due to a network issue. Your reservation hold is unchanged — you can retry payment.",
  paymentRetryNoNew:
    "Unable to start payment. You can retry without creating a new booking.",
  productsLoadFailed: "Could not load Day Use products.",
};

function fillTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function mapCreateError(
  err: unknown,
  copy: CheckoutCopy = DEFAULT_CHECKOUT_COPY
): CheckoutError {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return {
        message: err.message || copy.conflict,
        status: 409,
        fieldErrors: err.errors,
        kind: "conflict",
      };
    }
    if (err.status === 422) {
      return {
        message: err.message || copy.validation,
        status: 422,
        fieldErrors: err.errors,
        kind: "validation",
      };
    }
    if (err.status === 429) {
      return {
        message: err.message || copy.rateLimit,
        status: 429,
        fieldErrors: err.errors,
        kind: "rate_limit",
      };
    }
    return {
      message: err.message || copy.createFailed,
      status: err.status,
      fieldErrors: err.errors,
      kind: "generic",
    };
  }

  if (err instanceof TypeError) {
    return {
      message: copy.createNetwork,
      status: null,
      kind: "network",
    };
  }

  return {
    message: copy.createRetry,
    status: null,
    kind: "generic",
  };
}

export function mapPaymentError(
  err: unknown,
  copy: CheckoutCopy = DEFAULT_CHECKOUT_COPY
): CheckoutError {
  if (err instanceof ApiError) {
    if (err.status === 404) {
      return {
        message: err.message || copy.bookingNotFound,
        status: 404,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 409) {
      return {
        message: err.message || copy.alreadyPaid,
        status: 409,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 422) {
      return {
        message: err.message || copy.paymentExpired,
        status: 422,
        kind: "payment",
        requestId: err.requestId,
      };
    }
    if (err.status === 429) {
      return {
        message: err.message || copy.paymentRateLimit,
        status: 429,
        kind: "rate_limit",
        requestId: err.requestId,
      };
    }
    const base = err.message?.trim() || copy.paymentFailed;
    const withRef =
      err.status != null && err.status >= 500 && err.requestId
        ? fillTemplate(copy.paymentRetrySupport, {
            message: base,
            requestId: err.requestId,
          })
        : err.status != null && err.status >= 500
          ? fillTemplate(copy.paymentRetry, { message: base })
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
      message: copy.paymentNetwork,
      status: null,
      kind: "network",
    };
  }

  return {
    message: copy.paymentRetryNoNew,
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

export type ValidationIssueTranslator = (
  issue: BookingValidationIssue
) => string;

export interface CheckoutRunnerDeps {
  createDayUse?: typeof createDayUseBooking;
  createBubbleStay?: typeof createBubbleStayBooking;
  pay?: typeof initiatePayment;
  resolveGateway?: () => PaymentGateway;
  persist?: (booking: ApiBooking) => void;
  navigate?: (url: string, bookingReference?: string) => void;
  onBubbleConflict?: (message: string) => void;
  copy?: CheckoutCopy;
  translateValidation?: ValidationIssueTranslator;
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
  private copy: CheckoutCopy;
  private translateValidation?: ValidationIssueTranslator;

  constructor(private deps: CheckoutRunnerDeps = {}) {
    this.copy = deps.copy ?? DEFAULT_CHECKOUT_COPY;
    this.translateValidation = deps.translateValidation;
  }

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

  setCopy(copy: CheckoutCopy) {
    this.copy = copy;
  }

  setTranslateValidation(fn: ValidationIssueTranslator | undefined) {
    this.translateValidation = fn;
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
      statusMessage: this.copy.reserved,
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
      const first = readiness[0];
      const message = first
        ? this.translateValidation
          ? this.translateValidation(first)
          : translateValidationIssue(first)
        : this.copy.incomplete;
      this.state = {
        ...this.state,
        phase: "error",
        error: {
          message,
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
      statusMessage: this.copy.securing,
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
        statusMessage: this.copy.reserved,
      };
      // Keep inFlight locked across create → pay so a second click cannot
      // start a duplicate /pay before pay() sets its own lock.
      return booking;
    } catch (err) {
      this.inFlight = false;
      const mapped = mapCreateError(err, this.copy);
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
        statusMessage: this.copy.holdExpired,
        error: {
          message: this.copy.holdExpired,
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
      statusMessage: this.copy.preparingPayment,
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
            message: this.copy.invalidPaymentLink,
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
        statusMessage: this.copy.redirecting,
      };
      navigate(session.payment_url, booking.booking_reference);
      // Page unload expected; clear lock so retry paths remain usable if navigation is blocked.
      this.inFlight = false;
      return true;
    } catch (err) {
      this.inFlight = false;
      const mapped = mapPaymentError(err, this.copy);
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
