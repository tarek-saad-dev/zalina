/**
 * Wedding Book + Pay runner.
 *
 * Supports pay-only retry when create already succeeded (do not create a
 * second booking on payment failure).
 */
import {
  ApiError,
  createWeddingBooking,
  initiatePayment,
  type ApiBooking,
  type CreateWeddingBookingPayload,
  type PaymentGateway,
} from "@/lib/api";
import {
  mapCreateError,
  mapPaymentError,
} from "@/components/book-now/bookingCheckoutRunner";
import type { CheckoutError } from "@/components/book-now/checkoutTypes";
import { resolvePaymentGateway } from "@/components/book-now/paymentGateway";
import {
  isSafePaymentUrl,
  navigateAfterPaymentInitiation,
} from "@/components/book-now/paymentUrl";
import { savePendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";

export type WeddingCheckoutPhase =
  | "idle"
  | "creating"
  | "initiating_payment"
  | "redirecting"
  | "error";

export interface WeddingCheckoutResult {
  ok: true;
  booking: ApiBooking;
}

export interface WeddingCheckoutFailure {
  ok: false;
  error: CheckoutError;
  booking: ApiBooking | null;
}

function normalizeGateway(gateway: PaymentGateway): PaymentGateway {
  const g = String(gateway).trim().toLowerCase();
  return g === "mock" ? "mock" : "paymob";
}

async function initiateWeddingPayment(input: {
  booking: ApiBooking;
  locale?: string;
  gateway: PaymentGateway;
  pay: typeof initiatePayment;
  navigate: typeof navigateAfterPaymentInitiation;
}): Promise<WeddingCheckoutResult | WeddingCheckoutFailure> {
  const gateway = normalizeGateway(input.gateway);
  try {
    const session = await input.pay(
      input.booking.booking_reference,
      gateway,
      input.locale
    );

    if (!isSafePaymentUrl(session.payment_url)) {
      return {
        ok: false,
        booking: input.booking,
        error: {
          message: "Payment could not be started safely. Please try again.",
          status: null,
          kind: "payment",
        },
      };
    }

    input.navigate({
      paymentUrl: session.payment_url,
      bookingReference: input.booking.booking_reference,
    });
    return { ok: true, booking: input.booking };
  } catch (err) {
    const mapped = mapPaymentError(err);
    const gatewayHint =
      mapped.status != null &&
      mapped.status >= 500 &&
      gateway === "paymob"
        ? " If you are testing locally, set NEXT_PUBLIC_PAYMENT_GATEWAY=mock."
        : "";
    return {
      ok: false,
      booking: input.booking,
      error: {
        ...mapped,
        message: `${mapped.message}${gatewayHint}`,
      },
    };
  }
}

export async function runWeddingCheckout(input: {
  payload: Omit<CreateWeddingBookingPayload, "product_type">;
  locale?: string;
  gateway?: PaymentGateway;
  /** When set, skip create and only (re)start payment for this hold. */
  existingBooking?: ApiBooking | null;
  createWedding?: typeof createWeddingBooking;
  pay?: typeof initiatePayment;
  navigate?: typeof navigateAfterPaymentInitiation;
}): Promise<WeddingCheckoutResult | WeddingCheckoutFailure> {
  const create = input.createWedding ?? createWeddingBooking;
  const pay = input.pay ?? initiatePayment;
  const navigate = input.navigate ?? navigateAfterPaymentInitiation;
  const gateway = normalizeGateway(
    input.gateway ?? resolvePaymentGateway()
  );

  let booking: ApiBooking | null = input.existingBooking ?? null;

  try {
    if (!booking) {
      booking = await create(input.payload, input.locale);
      savePendingPaymentBooking(booking);
    } else {
      savePendingPaymentBooking(booking);
    }

    return await initiateWeddingPayment({
      booking,
      locale: input.locale,
      gateway,
      pay,
      navigate,
    });
  } catch (err) {
    const mapped =
      booking == null ? mapCreateError(err) : mapPaymentError(err);

    if (
      err instanceof ApiError &&
      err.status === 422 &&
      booking == null
    ) {
      return {
        ok: false,
        booking: null,
        error: {
          ...mapped,
          message:
            mapped.message ||
            "This wedding date is no longer available. Please choose another date.",
          kind: "validation",
        },
      };
    }

    return { ok: false, booking, error: mapped };
  }
}

export { mapCreateError, mapPaymentError };
