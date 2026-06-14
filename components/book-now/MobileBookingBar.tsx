"use client";

import { ArrowRight } from "lucide-react";
import type { BookingState } from "./types";
import { JOURNEY_TYPE_LABELS, BOOKING_STEPS } from "./mockData";

interface MobileBookingBarProps {
  state: BookingState;
  onContinue: () => void;
  canProceed: boolean;
}

export function MobileBookingBar({ state, onContinue, canProceed }: MobileBookingBarProps) {
  const ds = state.dateSelection;
  const hasDate =
    (state.journeyType === "stay" && ds.checkIn) ||
    (state.journeyType === "evening" && ds.date) ||
    (state.journeyType === "private" && ds.date);

  const selectionTitle = state.isPrivateCustom
    ? state.selectedOccasionTitle
    : state.selectedItemTitle;

  const guestName = state.guestDetails.fullName.trim();

  const displayLabel = guestName && state.currentStep >= 5
    ? guestName
    : hasDate
    ? (() => {
        if (state.journeyType === "stay" && ds.checkIn)
          return ds.checkOut ? `${ds.checkIn} → ${ds.checkOut}` : ds.checkIn;
        if (ds.date) return ds.date;
        return selectionTitle ?? JOURNEY_TYPE_LABELS[state.journeyType!];
      })()
    : selectionTitle
    ? selectionTitle
    : state.journeyType
    ? JOURNEY_TYPE_LABELS[state.journeyType]
    : "Start your journey";

  const totalLabel = state.isPrivateCustom
    ? "Custom proposal"
    : state.estimatedTotal > 0
    ? `EGP ${state.estimatedTotal.toLocaleString()}`
    : "EGP 0";

  const isLastStep = state.currentStep === BOOKING_STEPS.length;

  const ctaLabel = isLastStep
    ? state.isPrivateCustom
      ? "Send Request"
      : "Confirm"
    : "Continue";

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(12,9,6,0.97)",
        borderTop: "1px solid rgba(212,175,55,0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "12px 20px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Summary row */}
      <div className="flex items-center justify-between mb-3">
        <div style={{ maxWidth: "55%" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "rgba(248,242,231,0.40)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            {state.currentStep > 1 ? "Selected" : "Journey"}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "#F8F2E7",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayLabel}
          </p>
        </div>

        <div className="text-right">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "rgba(248,242,231,0.40)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Estimated
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: state.isPrivateCustom ? "12px" : "15px",
              color: "rgba(212,175,55,0.92)",
              fontWeight: 600,
              fontStyle: state.isPrivateCustom ? "italic" : "normal",
            }}
          >
            {totalLabel}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={canProceed ? onContinue : undefined}
        disabled={!canProceed}
        className="w-full flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          height: "52px",
          background: canProceed
            ? "linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(232,199,102,0.95) 100%)"
            : "rgba(255,255,255,0.05)",
          color: canProceed ? "#0D0B08" : "rgba(248,242,231,0.22)",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          borderRadius: "10px",
          border: canProceed ? "none" : "1px solid rgba(255,255,255,0.06)",
          cursor: canProceed ? "pointer" : "not-allowed",
          opacity: canProceed ? 1 : 0.6,
        }}
      >
        {ctaLabel}
        {canProceed && <ArrowRight size={15} />}
      </button>
    </div>
  );
}
