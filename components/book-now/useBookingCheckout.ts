"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ApiBooking } from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import {
  createInitialCheckoutState,
  isBusyCheckoutPhase,
  type CheckoutState,
} from "./checkoutTypes";
import {
  BookingCheckoutRunner,
  type CheckoutCopy,
} from "./bookingCheckoutRunner";
import { prepareBookingPayload } from "./prepareBookingPayload";
import { clearPendingPaymentBooking } from "./paymentHandoffStorage";
import { navigateAfterPaymentInitiation } from "./paymentUrl";
import { pickExpiryTimestamp } from "./useHoldCountdown";
import { translateValidationIssue } from "./bookingValidation";

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
  const tCheckout = useTranslations("bookNow.checkout");
  const tValidation = useTranslations("validation");

  const checkoutCopy = useMemo<CheckoutCopy>(
    () => ({
      conflict: tCheckout("conflict"),
      validation: tCheckout("validation"),
      rateLimit: tCheckout("rateLimit"),
      createFailed: tCheckout("createFailed"),
      createNetwork: tCheckout("createNetwork"),
      createRetry: tCheckout("createRetry"),
      incomplete: tCheckout("incomplete"),
      securing: tCheckout("securing"),
      reserved: tCheckout("reserved"),
      holdExpired: tCheckout("holdExpired"),
      preparingPayment: tCheckout("preparingPayment"),
      redirecting: tCheckout("redirecting"),
      invalidPaymentLink: tCheckout("invalidPaymentLink"),
      bookingNotFound: tCheckout("bookingNotFound"),
      alreadyPaid: tCheckout("alreadyPaid"),
      paymentExpired: tCheckout("paymentExpired"),
      paymentRateLimit: tCheckout("paymentRateLimit"),
      paymentFailed: tCheckout("paymentFailed"),
      paymentRetrySupport: tCheckout("paymentRetrySupport"),
      paymentRetry: tCheckout("paymentRetry"),
      paymentNetwork: tCheckout("paymentNetwork"),
      paymentRetryNoNew: tCheckout("paymentRetryNoNew"),
      productsLoadFailed: tCheckout("productsLoadFailed"),
    }),
    [tCheckout]
  );

  const translateValidation = useCallback(
    (issue: Parameters<typeof translateValidationIssue>[0]) =>
      translateValidationIssue(issue, (key, values) =>
        tValidation(key as Parameters<typeof tValidation>[0], values)
      ),
    [tValidation]
  );

  const [checkout, setCheckout] = useState<CheckoutState>(
    createInitialCheckoutState
  );

  const onConflictRef = useRef(onBubbleConflict);
  onConflictRef.current = onBubbleConflict;
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;
  const copyRef = useRef(checkoutCopy);
  copyRef.current = checkoutCopy;

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

  useEffect(() => {
    runnerRef.current?.setCopy(checkoutCopy);
    runnerRef.current?.setTranslateValidation(translateValidation);
  }, [checkoutCopy, translateValidation]);

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
        const holdExpired = copyRef.current.holdExpired;
        if (runner) {
          runner.state = {
            ...runner.state,
            phase: "expired",
            booking,
            statusMessage: holdExpired,
            error: {
              message: holdExpired,
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
    runner.setCopy(copyRef.current);
    runner.setTranslateValidation(translateValidation);
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
    translateValidation,
  ]);

  const retryPayment = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner?.state.booking) return;
    runner.setCopy(copyRef.current);
    runner.setTranslateValidation(translateValidation);
    if (markExpiredIfNeeded(runner.state.booking)) return;
    await runner.retryPayment(locale);
    syncFromRunner();
  }, [locale, markExpiredIfNeeded, syncFromRunner, translateValidation]);

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
