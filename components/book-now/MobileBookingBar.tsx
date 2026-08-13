"use client";

import { ArrowRight } from "lucide-react";
import type { BookingState } from "./types";
import type { CheckoutState } from "./checkoutTypes";
import { nightsBetween } from "./bookingValidation";
import { formatMoneyAmount, parseMoney } from "./bookingMedia";
import { useHoldCountdown } from "./useHoldCountdown";

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
  ctaLabel = "Continue",
}: MobileBookingBarProps) {
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
      ? "Day Use"
      : state.productType === "bubble_stay"
        ? "Bubble Stay"
        : "Choose an experience";

  let subtitle = "Day Use or Bubble Stay";
  if (state.productType === "day_use") {
    subtitle = state.dayUse.visitDate
      ? `${state.dayUse.visitDate} · ${state.dayUse.guests} guests`
      : "Select visit date";
  } else if (state.productType === "bubble_stay") {
    if (state.bubbleStay.checkIn && state.bubbleStay.checkOut) {
      subtitle = `${nights} night${nights === 1 ? "" : "s"} · ${allocatedGuests}/${state.bubbleStay.totalGuests} guests · ${state.bubbleStay.selections.length} bubble${state.bubbleStay.selections.length === 1 ? "" : "s"}`;
    } else {
      subtitle = "Select stay dates";
    }
  }

  let totalText = "";
  if (booking) {
    const amount = parseMoney(booking.total);
    const formatted =
      amount == null
        ? booking.total
        : formatMoneyAmount(amount, booking.currency ?? dayUseCurrency);
    totalText = ` · Total due ${formatted}`;
    if (countdown.label && !countdown.isExpired) {
      totalText += ` · ${countdown.label}`;
    }
  } else if (estimatedTotal != null) {
    totalText =
      state.productType === "day_use" && dayUseCurrency
        ? ` · Est. ${formatMoneyAmount(estimatedTotal, dayUseCurrency)}`
        : ` · Est. ${Math.round(estimatedTotal).toLocaleString("en-US")}`;
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
          {ctaLabel}
          {canProceed && <ArrowRight size={15} />}
        </button>
      </div>
    </div>
  );
}
