"use client";

import { useTranslations } from "next-intl";
import type { ApiBooking, DayUseSettings } from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import type { CheckoutState } from "./checkoutTypes";
import { nightsBetween } from "./bookingValidation";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "./bookingMedia";
import { useHoldCountdown } from "./useHoldCountdown";
import { isBusyCheckoutPhase } from "./checkoutTypes";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepReviewV2Props {
  state: BookingState;
  accommodationTypes: AccommodationTypeMeta[];
  locale: "en" | "ar";
  estimatedTotal: number | null;
  dayUseSettings: DayUseSettings | null;
  checkout: CheckoutState;
  onReserveAndPay: () => void;
  onRetryPayment: () => void;
  onStartNewReservation: () => void;
  onReturnToBubbles: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between gap-4 py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: "12px", color: TEXT_MUTED }}>{label}</span>
      <span style={{ fontSize: "13px", color: TEXT_PRIMARY, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function formatServerTotal(booking: ApiBooking, locale: "en" | "ar"): string {
  const amount = parseMoney(booking.total);
  if (amount == null) return booking.total;
  return formatMoneyAmount(amount, booking.currency, locale);
}

function reviewCtaLabel(
  checkout: CheckoutState,
  t: ReturnType<typeof useTranslations<"bookNow">>
): string {
  if (checkout.phase === "creating") return t("review.ctaSecuring");
  if (checkout.phase === "initiating_payment")
    return t("review.ctaPreparingPayment");
  if (checkout.phase === "redirecting") return t("review.ctaRedirecting");
  if (checkout.booking) return t("review.ctaProceedPayment");
  return t("review.ctaReserveContinue");
}

export function StepReviewV2({
  state,
  accommodationTypes,
  locale,
  estimatedTotal,
  dayUseSettings,
  checkout,
  onReserveAndPay,
  onRetryPayment,
  onStartNewReservation,
  onReturnToBubbles,
}: StepReviewV2Props) {
  const t = useTranslations("bookNow");
  const emDash = t("summary.emDash");
  const byId = new Map(accommodationTypes.map((meta) => [meta.id, meta]));
  const nights =
    state.bubbleStay.checkIn && state.bubbleStay.checkOut
      ? nightsBetween(state.bubbleStay.checkIn, state.bubbleStay.checkOut)
      : 0;

  const booking = checkout.booking;
  const countdown = useHoldCountdown({
    payment_expires_at: booking?.payment_expires_at,
    hold_expires_at: booking?.hold_expires_at,
  });

  const busy = isBusyCheckoutPhase(checkout.phase);
  const expired =
    checkout.phase === "expired" || (booking != null && countdown.isExpired);
  const alreadyPaid = checkout.phase === "already_paid";
  const hasHold = booking != null && !expired && !alreadyPaid;

  const estimateDiffers =
    booking != null &&
    checkout.estimateAtCreate != null &&
    parseMoney(booking.total) != null &&
    Math.abs((parseMoney(booking.total) as number) - checkout.estimateAtCreate) >
      0.009;

  const payDisabled = busy || expired || alreadyPaid;
  const primaryAction = hasHold
    ? checkout.phase === "error"
      ? onRetryPayment
      : onReserveAndPay
    : onReserveAndPay;

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          fontWeight: 500,
          marginBottom: "10px",
        }}
      >
        {t("review.eyebrow")}
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          marginBottom: "12px",
        }}
      >
        {hasHold ? t("review.titlePay") : t("review.titleConfirm")}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: 1.7,
          marginBottom: "28px",
          maxWidth: "42rem",
        }}
      >
        {hasHold ? t("review.subtitlePay") : t("review.subtitleConfirm")}
      </p>

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "18px 20px",
          marginBottom: "22px",
        }}
      >
        {state.productType === "day_use" && (
          <>
            <Row label={t("review.experience")} value={t("summary.dayUse")} />
            <Row
              label={t("review.visitDate")}
              value={state.dayUse.visitDate ?? emDash}
            />
            <Row
              label={t("review.guests")}
              value={String(state.dayUse.guests)}
            />
          </>
        )}

        {state.productType === "bubble_stay" && (
          <>
            <Row
              label={t("review.experience")}
              value={t("summary.bubbleStay")}
            />
            <Row
              label={t("review.stay")}
              value={
                state.bubbleStay.checkIn && state.bubbleStay.checkOut
                  ? `${state.bubbleStay.checkIn} → ${state.bubbleStay.checkOut}`
                  : emDash
              }
            />
            <Row
              label={t("review.nights")}
              value={nights > 0 ? String(nights) : emDash}
            />
            <Row
              label={t("review.guests")}
              value={String(state.bubbleStay.totalGuests)}
            />

            {booking && booking.bubbles.length > 0
              ? booking.bubbles.map((bubble, index) => (
                  <div key={bubble.id} style={{ marginTop: "10px" }}>
                    <Row
                      label={t("review.bubbleN", { number: index + 1 })}
                      value={localizedName(bubble, locale)}
                    />
                    <Row
                      label={t("review.guests")}
                      value={String(bubble.guests)}
                    />
                    {bubble.accommodation_type && (
                      <Row
                        label={t("review.type")}
                        value={localizedName(bubble.accommodation_type, locale)}
                      />
                    )}
                  </div>
                ))
              : state.bubbleStay.selections.map((selection, index) => {
                  const type = byId.get(selection.accommodationTypeId);
                  const typeName = type
                    ? localizedName(type, locale)
                    : selection.accommodationSlug;
                  const assignment =
                    selection.assignmentMode === "random"
                      ? t("review.zalinaWillAssign")
                      : selection.bubbleId != null
                        ? t("review.selectedBubble")
                        : t("review.pendingBubble");
                  const nightly = type
                    ? parseMoney(type.price_per_night)
                    : null;
                  const lineEstimate =
                    nightly != null && nights > 0 ? nightly * nights : null;
                  const amountLabel =
                    lineEstimate != null
                      ? formatMoneyAmount(lineEstimate, null, locale)
                      : null;
                  return (
                    <div key={selection.key} style={{ marginTop: "10px" }}>
                      <Row
                        label={t("review.bubbleN", { number: index + 1 })}
                        value={typeName}
                      />
                      <Row label={t("review.assignment")} value={assignment} />
                      <Row
                        label={t("review.guests")}
                        value={String(selection.guests)}
                      />
                      <Row
                        label={t("review.lineEstimate")}
                        value={
                          amountLabel != null
                            ? nights === 1
                              ? t("review.lineEstimateValue", {
                                  amount: amountLabel,
                                  nights,
                                })
                              : t("review.lineEstimateValuePlural", {
                                  amount: amountLabel,
                                  nights,
                                })
                            : emDash
                        }
                      />
                    </div>
                  );
                })}
          </>
        )}

        <Row
          label={t("review.guestName")}
          value={state.guest.name || emDash}
        />
        <Row label={t("review.email")} value={state.guest.email || emDash} />
        <Row label={t("review.phone")} value={state.guest.phone || emDash} />

        {booking ? (
          <>
            <Row
              label={t("review.bookingReference")}
              value={booking.booking_reference}
            />
            <Row
              label={t("review.bookingCode")}
              value={booking.booking_code}
            />
            <Row label={t("review.status")} value={booking.status} />
            <Row
              label={t("review.totalDue")}
              value={formatServerTotal(booking, locale)}
            />
            {estimateDiffers && checkout.estimateAtCreate != null && (
              <Row
                label={t("review.previousEstimate")}
                value={
                  dayUseSettings
                    ? formatMoneyAmount(
                        checkout.estimateAtCreate,
                        booking.currency ?? dayUseSettings.currency,
                        locale
                      )
                    : formatMoneyAmount(
                        checkout.estimateAtCreate,
                        null,
                        locale
                      )
                }
              />
            )}
            {countdown.label != null && (
              <Row
                label={t("review.paymentWindow")}
                value={
                  countdown.isExpired
                    ? t("review.expired")
                    : t("review.remaining", { time: countdown.label })
                }
              />
            )}
          </>
        ) : (
          <Row
            label={t("review.estimatedTotal")}
            value={
              estimatedTotal == null
                ? emDash
                : state.productType === "day_use" && dayUseSettings
                  ? formatMoneyAmount(
                      estimatedTotal,
                      dayUseSettings.currency,
                      locale
                    )
                  : formatMoneyAmount(estimatedTotal, null, locale)
            }
          />
        )}
      </div>

      {checkout.statusMessage && !checkout.error && (
        <p
          style={{
            marginBottom: "14px",
            fontSize: "13px",
            color: GOLD,
            lineHeight: 1.6,
          }}
          role="status"
        >
          {checkout.statusMessage}
        </p>
      )}

      {checkout.error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(220,160,100,0.35)",
            background: "rgba(220,160,100,0.08)",
          }}
          role="alert"
        >
          <p style={{ fontSize: "13px", color: "rgba(248,220,180,0.95)", lineHeight: 1.6 }}>
            {checkout.error.message}
          </p>
          {checkout.error.fieldErrors &&
            Object.entries(checkout.error.fieldErrors).map(([field, msgs]) => (
              <p
                key={field}
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: TEXT_MUTED,
                }}
              >
                {field}: {msgs.join(", ")}
              </p>
            ))}
          {checkout.error.kind === "conflict" && (
            <button
              type="button"
              onClick={onReturnToBubbles}
              style={{
                marginTop: "10px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: GOLD,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {t("review.chooseAvailableBubbles")}
            </button>
          )}
        </div>
      )}

      {expired && (
        <p
          style={{
            marginBottom: "14px",
            fontSize: "13px",
            color: "rgba(220,160,100,0.95)",
            lineHeight: 1.6,
          }}
          role="alert"
        >
          {t("review.holdExpired")}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          type="button"
          onClick={payDisabled ? undefined : primaryAction}
          disabled={payDisabled}
          aria-busy={busy}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: payDisabled ? "rgba(248,242,231,0.25)" : "#0D0B08",
            background: payDisabled
              ? "rgba(255,255,255,0.05)"
              : "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))",
            border: payDisabled ? "1px solid rgba(255,255,255,0.06)" : "none",
            borderRadius: "9px",
            padding: "14px 28px",
            cursor: payDisabled ? "not-allowed" : "pointer",
            opacity: payDisabled ? 0.75 : 1,
          }}
        >
          {reviewCtaLabel(checkout, t)}
        </button>

        {(hasHold || expired || alreadyPaid) && (
          <button
            type="button"
            onClick={onStartNewReservation}
            disabled={busy}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: TEXT_MUTED,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9px",
              padding: "12px 18px",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {t("review.startNewReservation")}
          </button>
        )}
      </div>

      {!booking && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: TEXT_MUTED,
          }}
        >
          {t("review.redirectNote")}
        </p>
      )}
    </div>
  );
}
