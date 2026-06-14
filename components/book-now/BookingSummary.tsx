"use client";

import { Shield, Zap, QrCode } from "lucide-react";
import type { BookingState } from "./types";
import { JOURNEY_TYPE_LABELS } from "./mockData";

interface BookingSummaryProps {
  state: BookingState;
  onContinue: () => void;
  isLastStep?: boolean;
  canProceed?: boolean;
  ctaLabel?: string;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_FAINT = "rgba(212,175,55,0.14)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.50)";

function SummaryRow({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="flex justify-between items-center py-3"
      style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: TEXT_MUTED,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: highlight ? GOLD : muted ? "rgba(248,242,231,0.38)" : TEXT_PRIMARY,
          fontWeight: highlight ? 600 : 400,
          fontStyle: muted ? "italic" : "normal",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function BookingSummary({ state, onContinue, isLastStep, canProceed, ctaLabel }: BookingSummaryProps) {
  const selectedEnhancements = state.enhancements.filter((e) => e.selected);

  const journeyLabel = state.journeyType
    ? JOURNEY_TYPE_LABELS[state.journeyType]
    : "Not selected";

  const selectionLabel = state.isPrivateCustom
    ? state.selectedOccasionTitle ?? "Not selected"
    : state.selectedItemTitle ?? "Not selected";

  const ds = state.dateSelection;
  const dateLabel = (() => {
    if (state.journeyType === "stay") {
      if (ds.checkIn && ds.checkOut)
        return `${ds.checkIn} → ${ds.checkOut}`;
      if (ds.checkIn) return ds.checkIn;
      return "Not selected";
    }
    if (state.journeyType === "evening") {
      if (ds.date && ds.timeSlot) {
        const slot = ds.timeSlot.charAt(0).toUpperCase() + ds.timeSlot.slice(1);
        return `${ds.date} · ${slot}`;
      }
      return ds.date ?? "Not selected";
    }
    if (state.journeyType === "private") {
      const parts: string[] = [];
      if (ds.date) parts.push(ds.date);
      if (ds.preferredPeriod) parts.push(ds.preferredPeriod);
      return parts.length ? parts.join(" · ") : "Not selected";
    }
    return "Not selected";
  })();

  const enhancementsLabel =
    selectedEnhancements.length > 0
      ? `${selectedEnhancements.length} selected`
      : "None";

  const guestNameLabel = state.guestDetails.fullName.trim() || null;

  const occasionLabel =
    state.guestDetails.occasion !== "none" && state.guestDetails.occasion
      ? state.guestDetails.occasion.charAt(0).toUpperCase() + state.guestDetails.occasion.slice(1)
      : null;

  const totalLabel = state.isPrivateCustom
    ? "Custom proposal"
    : state.estimatedTotal > 0
    ? `EGP ${state.estimatedTotal.toLocaleString()}`
    : "EGP 0";

  const ctaEnabled = canProceed !== false;

  return (
    <aside
      style={{
        background: "rgba(15,11,7,0.92)",
        border: `1px solid ${GOLD_BORDER}`,
        borderRadius: "16px",
        padding: "28px 24px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.05)",
      }}
    >
      {/* Card header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div
            style={{
              width: "20px",
              height: "1px",
              background: GOLD,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 500,
            }}
          >
            Your Booking
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            lineHeight: 1.2,
          }}
        >
          Your Zalina Journey
        </h2>
      </div>

      {/* Summary rows */}
      <div>
        <SummaryRow label="Journey" value={journeyLabel} />
        <SummaryRow label="Selection" value={selectionLabel} />
        <SummaryRow label="Date" value={dateLabel} />
        {state.journeyType === "evening" ? (
          <SummaryRow label="Participants" value={`${state.participants} participant${state.participants !== 1 ? "s" : ""}`} />
        ) : state.journeyType === "private" ? (
          <SummaryRow label="Est. Guests" value={`~${state.estimatedGuests} guests`} />
        ) : (
          <SummaryRow label="Guests" value={`${state.guests} guest${state.guests !== 1 ? "s" : ""}`} />
        )}
        <SummaryRow label="Enhancements" value={enhancementsLabel} />
        {guestNameLabel && (
          <SummaryRow label="Guest" value={guestNameLabel} />
        )}
        {occasionLabel && (
          <SummaryRow label="Occasion" value={occasionLabel} />
        )}
        <SummaryRow
          label="Estimated Total"
          value={totalLabel}
          highlight={!state.isPrivateCustom}
          muted={state.isPrivateCustom}
        />
      </div>

      {/* CTA Button */}
      <button
        onClick={ctaEnabled ? onContinue : undefined}
        disabled={!ctaEnabled}
        className="w-full mt-6 transition-all duration-300"
        style={{
          height: "50px",
          background: ctaEnabled
            ? `linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(232,199,102,0.95) 100%)`
            : "rgba(255,255,255,0.05)",
          color: ctaEnabled ? "#0D0B08" : "rgba(248,242,231,0.22)",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: "10px",
          border: ctaEnabled ? "none" : "1px solid rgba(255,255,255,0.06)",
          cursor: ctaEnabled ? "pointer" : "not-allowed",
          opacity: ctaEnabled ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (ctaEnabled) {
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(212,175,55,0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {ctaLabel ?? (isLastStep ? "Confirm Booking" : "Continue")}
      </button>

      {/* Trust strip */}
      <div className="mt-4 flex flex-col gap-1.5">
        {[
          { icon: Shield, text: "Secure payment" },
          { icon: Zap, text: "Instant booking reference" },
          { icon: QrCode, text: "QR ticket after confirmation" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={11} color={TEXT_MUTED} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: TEXT_MUTED,
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* Ornamental bottom accent */}
      <div
        className="mt-5"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
        }}
      />
    </aside>
  );
}
