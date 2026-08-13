"use client";

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

function formatServerTotal(booking: ApiBooking): string {
  const amount = parseMoney(booking.total);
  if (amount == null) return booking.total;
  return formatMoneyAmount(amount, booking.currency);
}

function ctaLabel(checkout: CheckoutState): string {
  if (checkout.phase === "creating") return "Securing your reservation…";
  if (checkout.phase === "initiating_payment") return "Preparing secure payment…";
  if (checkout.phase === "redirecting") return "Redirecting…";
  if (checkout.booking) return "Proceed to Secure Payment";
  return "Reserve & Continue to Payment";
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
  const byId = new Map(accommodationTypes.map((t) => [t.id, t]));
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
        Review
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
        {hasHold ? "Complete your payment" : "Confirm your details"}
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
        {hasHold
          ? "Your booking is temporarily reserved while you complete payment."
          : "Review your experience details before securing your reservation."}
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
            <Row label="Experience" value="Day Use" />
            <Row label="Visit date" value={state.dayUse.visitDate ?? "—"} />
            <Row label="Guests" value={String(state.dayUse.guests)} />
          </>
        )}

        {state.productType === "bubble_stay" && (
          <>
            <Row label="Experience" value="Bubble Stay" />
            <Row
              label="Stay"
              value={
                state.bubbleStay.checkIn && state.bubbleStay.checkOut
                  ? `${state.bubbleStay.checkIn} → ${state.bubbleStay.checkOut}`
                  : "—"
              }
            />
            <Row
              label="Nights"
              value={nights > 0 ? String(nights) : "—"}
            />
            <Row label="Guests" value={String(state.bubbleStay.totalGuests)} />

            {booking && booking.bubbles.length > 0
              ? booking.bubbles.map((bubble, index) => (
                  <div key={bubble.id} style={{ marginTop: "10px" }}>
                    <Row
                      label={`Bubble ${index + 1}`}
                      value={localizedName(bubble, locale)}
                    />
                    <Row label="Guests" value={String(bubble.guests)} />
                    {bubble.accommodation_type && (
                      <Row
                        label="Type"
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
                      ? "Zalina will assign"
                      : selection.bubbleId != null
                        ? "Selected bubble"
                        : "Pending bubble";
                  const nightly = type
                    ? parseMoney(type.price_per_night)
                    : null;
                  const lineEstimate =
                    nightly != null && nights > 0 ? nightly * nights : null;
                  return (
                    <div key={selection.key} style={{ marginTop: "10px" }}>
                      <Row label={`Bubble ${index + 1}`} value={typeName} />
                      <Row label="Assignment" value={assignment} />
                      <Row label="Guests" value={String(selection.guests)} />
                      <Row
                        label="Line estimate"
                        value={
                          lineEstimate != null
                            ? `${Math.round(lineEstimate).toLocaleString("en-US")} (${nights} night${nights === 1 ? "" : "s"})`
                            : "—"
                        }
                      />
                    </div>
                  );
                })}
          </>
        )}

        <Row label="Guest name" value={state.guest.name || "—"} />
        <Row label="Email" value={state.guest.email || "—"} />
        <Row label="Phone" value={state.guest.phone || "—"} />

        {booking ? (
          <>
            <Row label="Booking reference" value={booking.booking_reference} />
            <Row label="Booking code" value={booking.booking_code} />
            <Row label="Status" value={booking.status} />
            <Row label="Total due" value={formatServerTotal(booking)} />
            {estimateDiffers && checkout.estimateAtCreate != null && (
              <Row
                label="Previous estimate"
                value={
                  dayUseSettings
                    ? formatMoneyAmount(
                        checkout.estimateAtCreate,
                        booking.currency ?? dayUseSettings.currency
                      )
                    : Math.round(checkout.estimateAtCreate).toLocaleString(
                        "en-US"
                      )
                }
              />
            )}
            {countdown.label != null && (
              <Row
                label="Payment window"
                value={
                  countdown.isExpired
                    ? "Expired"
                    : `${countdown.label} remaining`
                }
              />
            )}
          </>
        ) : (
          <Row
            label="Estimated total"
            value={
              estimatedTotal == null
                ? "—"
                : state.productType === "day_use" && dayUseSettings
                  ? formatMoneyAmount(estimatedTotal, dayUseSettings.currency)
                  : Math.round(estimatedTotal).toLocaleString("en-US")
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
              Choose available bubbles
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
          Your hold has expired. Availability must be checked again before a new
          reservation.
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
          {ctaLabel(checkout)}
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
            Start a new reservation
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
          You will be redirected to a secure payment page after your reservation
          is held.
        </p>
      )}
    </div>
  );
}
