"use client";

import { useCallback, useRef, useState } from "react";
import {
  ApiError,
  initiatePayment,
  type ApiBooking,
} from "@/lib/api";
import { resolvePaymentGateway } from "@/components/book-now/paymentGateway";
import {
  isSafePaymentUrl,
  navigateAfterPaymentInitiation,
} from "@/components/book-now/paymentUrl";
import { savePendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import { canRetryPayment } from "./bookingStatusModel";

export function usePaymentRetry(locale?: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const inFlight = useRef(false);

  const retry = useCallback(
    async (booking: ApiBooking): Promise<"redirected" | "already_paid" | "error"> => {
      if (inFlight.current) return "error";
      if (!canRetryPayment(booking)) {
        setError("Payment can no longer be retried for this reservation.");
        return "error";
      }

      inFlight.current = true;
      setBusy(true);
      setError(null);
      setAlreadyPaid(false);

      try {
        const gateway = resolvePaymentGateway();
        const session = await initiatePayment(
          booking.booking_reference,
          gateway,
          locale
        );

        if (!isSafePaymentUrl(session.payment_url)) {
          setError("Invalid payment link from server.");
          return "error";
        }

        savePendingPaymentBooking(booking);
        navigateAfterPaymentInitiation({
          paymentUrl: session.payment_url,
          bookingReference: booking.booking_reference,
        });
        return "redirected";
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setAlreadyPaid(true);
          return "already_paid";
        }
        if (err instanceof ApiError && err.status === 422) {
          setError(
            err.message ||
              "This reservation hold has expired. Please start a new reservation."
          );
          return "error";
        }
        if (err instanceof ApiError && err.status === 429) {
          setError(
            err.message ||
              "Too many payment attempts. Please wait a moment."
          );
          return "error";
        }
        setError(
          err instanceof Error ? err.message : "Unable to start payment."
        );
        return "error";
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [locale]
  );

  return { retry, busy, error, alreadyPaid, clearError: () => setError(null) };
}
