"use client";

import { ArrowRight } from "lucide-react";
import type { DayUseSettings } from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import type { CheckoutState } from "./checkoutTypes";
import { nightsBetween } from "./bookingValidation";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "./bookingMedia";
import { useHoldCountdown } from "./useHoldCountdown";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";

interface BookingSummaryProps {
  state: BookingState;
  accommodationTypes: AccommodationTypeMeta[];
  locale: "en" | "ar";
  estimatedTotal: number | null;
  allocatedGuests: number;
  remainingGuests: number;
  dayUseSettings: DayUseSettings | null;
  checkout: CheckoutState;
  onContinue: () => void;
  isLastStep: boolean;
  canProceed?: boolean;
  ctaLabel?: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2">
      <span style={{ fontSize: "12px", color: TEXT_MUTED }}>{label}</span>
      <span
        style={{
          fontSize: "13px",
          color: TEXT_PRIMARY,
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function BookingSummary({
  state,
  accommodationTypes,
  locale,
  estimatedTotal,
  allocatedGuests,
  remainingGuests,
  dayUseSettings,
  checkout,
  onContinue,
  isLastStep,
  canProceed,
  ctaLabel,
}: BookingSummaryProps) {
  const ctaEnabled = canProceed !== false;
  const nights =
    state.bubbleStay.checkIn && state.bubbleStay.checkOut
      ? nightsBetween(state.bubbleStay.checkIn, state.bubbleStay.checkOut)
      : 0;

  const productLabel =
    state.productType === "day_use"
      ? "Day Use"
      : state.productType === "bubble_stay"
        ? "Bubble Stay"
        : "Not selected";

  const booking = checkout.booking;
  const countdown = useHoldCountdown({
    payment_expires_at: booking?.payment_expires_at,
    hold_expires_at: booking?.hold_expires_at,
  });

  const estimateLabel =
    estimatedTotal == null
      ? "—"
      : state.productType === "day_use" && dayUseSettings
        ? formatMoneyAmount(estimatedTotal, dayUseSettings.currency)
        : Math.round(estimatedTotal).toLocaleString("en-US");

  const serverTotalLabel = booking
    ? (() => {
        const amount = parseMoney(booking.total);
        if (amount == null) return booking.total;
        return formatMoneyAmount(amount, booking.currency);
      })()
    : null;

  return (
    <aside
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "22px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: GOLD,
          marginBottom: "14px",
        }}
      >
        Booking summary
      </p>

      <SummaryRow label="Experience" value={productLabel} />

      {state.productType === "day_use" && (
        <>
          <SummaryRow label="Visit" value={state.dayUse.visitDate ?? "—"} />
          <SummaryRow label="Guests" value={String(state.dayUse.guests)} />
        </>
      )}

      {state.productType === "bubble_stay" && (
        <>
          <SummaryRow
            label="Stay"
            value={
              state.bubbleStay.checkIn && state.bubbleStay.checkOut
                ? `${state.bubbleStay.checkIn} → ${state.bubbleStay.checkOut}`
                : "—"
            }
          />
          <SummaryRow
            label="Nights"
            value={nights > 0 ? String(nights) : "—"}
          />
          <SummaryRow
            label="Guests"
            value={`${allocatedGuests}/${state.bubbleStay.totalGuests}`}
          />
          <SummaryRow label="Remaining" value={String(remainingGuests)} />
          <SummaryRow
            label="Bubbles"
            value={
              booking && booking.bubbles.length > 0
                ? booking.bubbles
                    .map((b) => localizedName(b, locale))
                    .join(", ")
                : state.bubbleStay.selections.length
                  ? state.bubbleStay.selections
                      .map((s) => {
                        const type = accommodationTypes.find(
                          (t) => t.id === s.accommodationTypeId
                        );
                        return type
                          ? localizedName(type, locale)
                          : s.accommodationSlug;
                      })
                      .join(", ")
                  : "—"
            }
          />
        </>
      )}

      <SummaryRow label="Guest" value={state.guest.name || "—"} />

      <div
        style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {booking ? (
          <>
            <SummaryRow label="Total due" value={serverTotalLabel ?? "—"} />
            {countdown.label != null && (
              <SummaryRow
                label="Hold"
                value={
                  countdown.isExpired
                    ? "Expired"
                    : `${countdown.label} left`
                }
              />
            )}
            <p style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "6px" }}>
              Server total is final for this reservation.
            </p>
          </>
        ) : (
          <>
            <SummaryRow label="Estimated total" value={estimateLabel} />
            <p style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "6px" }}>
              Estimate only — server total after create is final.
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={ctaEnabled ? onContinue : undefined}
        disabled={!ctaEnabled}
        className="w-full flex items-center justify-center gap-2 mt-5"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: ctaEnabled ? "#0D0B08" : "rgba(248,242,231,0.25)",
          background: ctaEnabled
            ? "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))"
            : "rgba(255,255,255,0.05)",
          borderRadius: "9px",
          padding: "13px 18px",
          border: ctaEnabled ? "none" : "1px solid rgba(255,255,255,0.06)",
          cursor: ctaEnabled ? "pointer" : "not-allowed",
        }}
      >
        {ctaLabel ?? (isLastStep ? "Reserve & Continue to Payment" : "Continue")}
        {ctaEnabled && <ArrowRight size={14} />}
      </button>
    </aside>
  );
}
