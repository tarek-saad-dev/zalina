"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiBooking } from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import {
  createInitialCheckoutState,
  isBusyCheckoutPhase,
  type CheckoutState,
} from "./checkoutTypes";
import { BookingCheckoutRunner } from "./bookingCheckoutRunner";
import { prepareBookingPayload } from "./prepareBookingPayload";
import { clearPendingPaymentBooking } from "./paymentHandoffStorage";
import { navigateAfterPaymentInitiation } from "./paymentUrl";
import { pickExpiryTimestamp } from "./useHoldCountdown";

export interface UseBookingCheckoutOptions {
  state: BookingState;
  accommodationTypes: AccommodationTypeMeta[];
  dayUsePricePerGuest?: number | null;
  locale?: string;
  onBubbleConflict?: (bookingMessage: string) => void;
  onExpired?: () => void;
}

/**
 * Owns create → persist → pay → redirect.
 * Step components must not call booking/payment APIs directly.
 */
export function useBookingCheckout({
  state,
  accommodationTypes,
  dayUsePricePerGuest,
  locale,
  onBubbleConflict,
  onExpired,
}: UseBookingCheckoutOptions) {
  const [checkout, setCheckout] = useState<CheckoutState>(
    createInitialCheckoutState
  );

  const onConflictRef = useRef(onBubbleConflict);
  onConflictRef.current = onBubbleConflict;
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const runnerRef = useRef<BookingCheckoutRunner | null>(null);
  if (!runnerRef.current) {
    runnerRef.current = new BookingCheckoutRunner({
      onBubbleConflict: (message) => onConflictRef.current?.(message),
      navigate: (url, bookingRef) => {
        if (typeof window === "undefined") return;
        if (bookingRef) {
          navigateAfterPaymentInitiation({
            paymentUrl: url,
            bookingReference: bookingRef,
          });
          return;
        }
        window.location.assign(url);
      },
    });
  }

  const syncFromRunner = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    setCheckout({ ...runner.state });
  }, []);

  const markExpiredIfNeeded = useCallback(
    (booking: ApiBooking | null) => {
      if (!booking) return false;
      const expiry = pickExpiryTimestamp({
        payment_expires_at: booking.payment_expires_at,
        hold_expires_at: booking.hold_expires_at,
      });
      if (expiry == null) return false;
      if (Date.now() >= expiry) {
        const runner = runnerRef.current;
        if (runner) {
          runner.state = {
            ...runner.state,
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
          syncFromRunner();
        }
        onExpiredRef.current?.();
        return true;
      }
      return false;
    },
    [syncFromRunner]
  );

  useEffect(() => {
    if (!checkout.booking) return;
    if (
      checkout.phase === "redirecting" ||
      checkout.phase === "idle" ||
      checkout.phase === "creating"
    ) {
      return;
    }
    const id = window.setInterval(() => {
      markExpiredIfNeeded(runnerRef.current?.state.booking ?? null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [checkout.booking, checkout.phase, markExpiredIfNeeded]);

  const startNewReservation = useCallback(() => {
    clearPendingPaymentBooking();
    runnerRef.current?.reset();
    setCheckout(createInitialCheckoutState());
  }, []);

  const reserveAndPay = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner) return;
    if (isBusyCheckoutPhase(runner.state.phase)) return;
    if (runner.state.booking && markExpiredIfNeeded(runner.state.booking)) {
      return;
    }
    await runner.reserveAndPay(
      state,
      accommodationTypes,
      dayUsePricePerGuest,
      locale
    );
    syncFromRunner();
  }, [
    accommodationTypes,
    dayUsePricePerGuest,
    locale,
    markExpiredIfNeeded,
    state,
    syncFromRunner,
  ]);

  const retryPayment = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner?.state.booking) return;
    if (markExpiredIfNeeded(runner.state.booking)) return;
    await runner.retryPayment(locale);
    syncFromRunner();
  }, [locale, markExpiredIfNeeded, syncFromRunner]);

  const canSubmit =
    prepareBookingPayload(state, accommodationTypes) != null &&
    !isBusyCheckoutPhase(checkout.phase) &&
    checkout.phase !== "expired" &&
    checkout.phase !== "redirecting" &&
    checkout.phase !== "already_paid";

  const hasActiveHold =
    checkout.booking != null &&
    checkout.phase !== "expired" &&
    checkout.phase !== "idle";

  return {
    checkout,
    reserveAndPay,
    retryPayment,
    startNewReservation,
    canSubmit,
    hasActiveHold,
    isBusy: isBusyCheckoutPhase(checkout.phase),
  };
}
