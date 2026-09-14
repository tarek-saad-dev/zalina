"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookingState } from "./types";
import type { CheckoutState } from "./checkoutTypes";
import { nightsBetween } from "./bookingValidation";
import { formatMoneyAmount, parseMoney } from "./bookingMedia";
import { useHoldCountdown } from "./useHoldCountdown";
import { useBookingLocale } from "./useBookingLocale";

interface MobileBookingBarProps {
  state: BookingState;
  estimatedTotal: number | null;
  allocatedGuests: number;
  dayUseCurrency?: string;
  checkout: CheckoutState;
  onContinue: () => void;
  canProceed: boolean;
  ctaLabel?: string;
}

export function MobileBookingBar({
  state,
  estimatedTotal,
  allocatedGuests,
  dayUseCurrency,
  checkout,
  onContinue,
  canProceed,
  ctaLabel,
}: MobileBookingBarProps) {
  const t = useTranslations("bookNow");
  const locale = useBookingLocale();
  const resolvedCta = ctaLabel ?? t("cta.continue");
  const nights =
    state.bubbleStay.checkIn && state.bubbleStay.checkOut
      ? nightsBetween(state.bubbleStay.checkIn, state.bubbleStay.checkOut)
      : 0;

  const booking = checkout.booking;
  const countdown = useHoldCountdown({
    payment_expires_at: booking?.payment_expires_at,
    hold_expires_at: booking?.hold_expires_at,
  });

  const title =
    state.productType === "day_use"
      ? t("summary.dayUse")
      : state.productType === "bubble_stay"
        ? t("summary.bubbleStay")
        : t("mobile.chooseExperience");

  let subtitle = t("mobile.dayUseOrBubbleStay");
  if (state.productType === "day_use") {
    subtitle = state.dayUse.visitDate
      ? t("mobile.visitSummary", {
          date: state.dayUse.visitDate,
          count: state.dayUse.guests,
        })
      : t("mobile.selectVisitDate");
  } else if (state.productType === "bubble_stay") {
    if (state.bubbleStay.checkIn && state.bubbleStay.checkOut) {
      const summaryKey =
        nights === 1 ? "mobile.staySummaryOneNight" : "mobile.staySummary";
      subtitle = t(summaryKey, {
        nights,
        allocated: allocatedGuests,
        total: state.bubbleStay.totalGuests,
        bubbles: state.bubbleStay.selections.length,
      });
    } else {
      subtitle = t("mobile.selectStayDates");
    }
  }

  let totalText = "";
  if (booking) {
    const amount = parseMoney(booking.total);
    const formatted =
      amount == null
        ? booking.total
        : formatMoneyAmount(
            amount,
            booking.currency ?? dayUseCurrency,
            locale
          );
    totalText = t("mobile.totalDue", { amount: formatted });
    if (countdown.label && !countdown.isExpired) {
      totalText += ` · ${countdown.label}`;
    }
  } else if (estimatedTotal != null) {
    const formatted =
      state.productType === "day_use" && dayUseCurrency
        ? formatMoneyAmount(estimatedTotal, dayUseCurrency, locale)
        : formatMoneyAmount(estimatedTotal, null, locale);
    totalText = t("mobile.est", { amount: formatted });
  }

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{
        background: "rgba(12,9,6,0.96)",
        borderTop: "1px solid rgba(212,175,55,0.14)",
        padding: "14px 16px calc(14px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "#F8F2E7",
              fontWeight: 500,
            }}
            className="truncate"
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "rgba(248,242,231,0.45)",
            }}
            className="truncate"
          >
            {subtitle}
            {totalText}
          </p>
        </div>

        <button
          type="button"
          onClick={canProceed ? onContinue : undefined}
          disabled={!canProceed}
          className="flex items-center gap-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: canProceed
              ? "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))"
              : "rgba(255,255,255,0.05)",
            color: canProceed ? "#0D0B08" : "rgba(248,242,231,0.22)",
            borderRadius: "9px",
            padding: "12px 16px",
            border: canProceed ? "none" : "1px solid rgba(255,255,255,0.06)",
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.6,
            flexShrink: 0,
          }}
        >
          {resolvedCta}
          {canProceed && <ArrowRight size={15} />}
        </button>
      </div>
    </div>
  );
}
