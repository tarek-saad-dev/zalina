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

export async function runWeddingCheckout(input: {
  payload: Omit<CreateWeddingBookingPayload, "product_type">;
  locale?: string;
  gateway?: PaymentGateway;
  createWedding?: typeof createWeddingBooking;
  pay?: typeof initiatePayment;
  navigate?: typeof navigateAfterPaymentInitiation;
}): Promise<WeddingCheckoutResult | WeddingCheckoutFailure> {
  const create = input.createWedding ?? createWeddingBooking;
  const pay = input.pay ?? initiatePayment;
  const navigate = input.navigate ?? navigateAfterPaymentInitiation;

  let booking: ApiBooking | null = null;

  try {
    booking = await create(input.payload, input.locale);
    savePendingPaymentBooking(booking);

    const session = await pay(
      booking.booking_reference,
      input.gateway ?? resolvePaymentGateway(),
      input.locale
    );

    if (!isSafePaymentUrl(session.payment_url)) {
      return {
        ok: false,
        booking,
        error: {
          message: "Payment could not be started safely. Please try again.",
          status: null,
          kind: "payment",
        },
      };
    }

    navigate({
      paymentUrl: session.payment_url,
      bookingReference: booking.booking_reference,
    });
    return { ok: true, booking };
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
