"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("bookNow");
  const ctaEnabled = canProceed !== false;
  const emDash = t("summary.emDash");
  const nights =
    state.bubbleStay.checkIn && state.bubbleStay.checkOut
      ? nightsBetween(state.bubbleStay.checkIn, state.bubbleStay.checkOut)
      : 0;

  const productLabel =
    state.productType === "day_use"
      ? t("summary.dayUse")
      : state.productType === "bubble_stay"
        ? t("summary.bubbleStay")
        : t("summary.notSelected");

  const booking = checkout.booking;
  const countdown = useHoldCountdown({
    payment_expires_at: booking?.payment_expires_at,
    hold_expires_at: booking?.hold_expires_at,
  });

  const estimateLabel =
    estimatedTotal == null
      ? emDash
      : state.productType === "day_use" && dayUseSettings
        ? formatMoneyAmount(estimatedTotal, dayUseSettings.currency, locale)
        : formatMoneyAmount(estimatedTotal, null, locale);

  const serverTotalLabel = booking
    ? (() => {
        const amount = parseMoney(booking.total);
        if (amount == null) return booking.total;
        return formatMoneyAmount(amount, booking.currency, locale);
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
        {t("summary.title")}
      </p>

      <SummaryRow label={t("summary.experience")} value={productLabel} />

      {state.productType === "day_use" && (
        <>
          <SummaryRow
            label={t("summary.visit")}
            value={state.dayUse.visitDate ?? emDash}
          />
          <SummaryRow
            label={t("summary.guests")}
            value={String(state.dayUse.guests)}
          />
        </>
      )}

      {state.productType === "bubble_stay" && (
        <>
          <SummaryRow
            label={t("summary.stay")}
            value={
              state.bubbleStay.checkIn && state.bubbleStay.checkOut
                ? `${state.bubbleStay.checkIn} → ${state.bubbleStay.checkOut}`
                : emDash
            }
          />
          <SummaryRow
            label={t("summary.nights")}
            value={nights > 0 ? String(nights) : emDash}
          />
          <SummaryRow
            label={t("summary.guests")}
            value={`${allocatedGuests}/${state.bubbleStay.totalGuests}`}
          />
          <SummaryRow
            label={t("summary.remaining")}
            value={String(remainingGuests)}
          />
          <SummaryRow
            label={t("summary.bubbles")}
            value={
              booking && booking.bubbles.length > 0
                ? booking.bubbles
                    .map((b) => localizedName(b, locale))
                    .join(", ")
                : state.bubbleStay.selections.length
                  ? state.bubbleStay.selections
                      .map((s) => {
                        const type = accommodationTypes.find(
                          (meta) => meta.id === s.accommodationTypeId
                        );
                        return type
                          ? localizedName(type, locale)
                          : s.accommodationSlug;
                      })
                      .join(", ")
                  : emDash
            }
          />
        </>
      )}

      <SummaryRow
        label={t("summary.guest")}
        value={state.guest.name || emDash}
      />

      <div
        style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {booking ? (
          <>
            <SummaryRow
              label={t("summary.totalDue")}
              value={serverTotalLabel ?? emDash}
            />
            {countdown.label != null && (
              <SummaryRow
                label={t("summary.hold")}
                value={
                  countdown.isExpired
                    ? t("summary.expired")
                    : t("summary.holdLeft", { time: countdown.label })
                }
              />
            )}
            <p style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "6px" }}>
              {t("summary.serverTotalNote")}
            </p>
          </>
        ) : (
          <>
            <SummaryRow
              label={t("summary.estimatedTotal")}
              value={estimateLabel}
            />
            <p style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "6px" }}>
              {t("summary.estimateNote")}
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
        {ctaLabel ??
          (isLastStep
            ? t("cta.reserveContinueToPayment")
            : t("cta.continue"))}
        {ctaEnabled && <ArrowRight size={14} />}
      </button>
    </aside>
  );
}
