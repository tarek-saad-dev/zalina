"use client";

import type { CSSProperties } from "react";
import type { DayUseSettings } from "@/lib/api";
import type { BookingState } from "./types";
import { BookingCalendar } from "./BookingCalendar";
import { GuestSelector } from "./GuestSelector";
import { getBookingMinDate } from "./bookingValidation";
import { formatMoneyAmount, parseMoney } from "./bookingMedia";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepDayUseDateGuestsProps {
  state: BookingState;
  settings: DayUseSettings | null;
  settingsStatus: "idle" | "loading" | "ready" | "error";
  settingsError: string | null;
  onReloadSettings: () => void;
  onSetVisitDate: (date: string | null) => void;
  onSetDayUseGuests: (n: number) => void;
  onSwitchToBubbleStay: () => void;
}

export function StepDayUseDateGuests({
  state,
  settings,
  settingsStatus,
  settingsError,
  onReloadSettings,
  onSetVisitDate,
  onSetDayUseGuests,
  onSwitchToBubbleStay,
}: StepDayUseDateGuestsProps) {
  if (settingsStatus === "loading" || settingsStatus === "idle") {
    return (
      <div aria-busy="true" aria-live="polite">
        <StepHeading />
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "28px",
            color: TEXT_MUTED,
            fontFamily: "var(--font-body)",
            fontSize: "14px",
          }}
        >
          Loading Day Use settings…
        </div>
      </div>
    );
  }

  if (settingsStatus === "error") {
    return (
      <div>
        <StepHeading />
        <div
          role="alert"
          style={{
            borderRadius: "14px",
            border: "1px solid rgba(220,160,100,0.35)",
            background: "rgba(220,160,100,0.06)",
            padding: "24px",
          }}
        >
          <p style={{ color: TEXT_PRIMARY, marginBottom: "10px" }}>
            {settingsError ?? "Day Use settings could not be loaded."}
          </p>
          <button
            type="button"
            onClick={onReloadSettings}
            style={ghostButtonStyle}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (settings && !settings.is_active) {
    return (
      <div>
        <StepHeading />
        <div
          role="status"
          style={{
            borderRadius: "16px",
            border: "1px solid rgba(212,175,55,0.22)",
            background: "rgba(212,175,55,0.05)",
            padding: "28px 24px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: TEXT_PRIMARY,
              marginBottom: "10px",
            }}
          >
            Day Use is currently unavailable
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: TEXT_MUTED,
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            {settings.booking_notice?.trim() ||
              "Please choose Bubble Stay, or return when Day Use opens again."}
          </p>
          <button
            type="button"
            onClick={onSwitchToBubbleStay}
            style={primaryButtonStyle}
          >
            Choose Bubble Stay
          </button>
        </div>
      </div>
    );
  }

  const pricePerGuest = parseMoney(settings?.price_per_guest);
  const currency = settings?.currency;
  const estimate =
    pricePerGuest != null ? pricePerGuest * state.dayUse.guests : null;

  return (
    <div>
      <StepHeading />
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          marginBottom: "28px",
          maxWidth: "480px",
          lineHeight: 1.7,
        }}
      >
        Choose a visit date and guests. Pricing follows live Day Use settings.
      </p>

      {settings?.booking_notice?.trim() && (
        <div
          style={{
            marginBottom: "22px",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(212,175,55,0.18)",
            background: "rgba(212,175,55,0.04)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: TEXT_MUTED,
            lineHeight: 1.6,
          }}
        >
          {settings.booking_notice}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <BookingCalendar
          mode="single"
          selectedDate={state.dayUse.visitDate}
          onSelectDate={(date) => onSetVisitDate(date)}
          minDate={getBookingMinDate()}
        />
        <div className="grid gap-4 content-start">
          <GuestSelector
            label="Guests"
            value={state.dayUse.guests}
            onChange={onSetDayUseGuests}
            min={1}
          />

          <div
            style={{
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              padding: "18px 20px",
            }}
          >
            <PriceRow
              label="Price per guest"
              value={
                pricePerGuest != null
                  ? formatMoneyAmount(pricePerGuest, currency)
                  : "—"
              }
            />
            <PriceRow label="Guests" value={String(state.dayUse.guests)} />
            <PriceRow
              label="Estimated total"
              value={
                estimate != null ? formatMoneyAmount(estimate, currency) : "—"
              }
              emphasize
            />
            <p
              style={{
                marginTop: "10px",
                fontSize: "11px",
                color: TEXT_MUTED,
                letterSpacing: "0.04em",
              }}
            >
              Estimate only — final total is confirmed when the booking is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeading() {
  return (
    <>
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
        Day Use — Date & Guests
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
        When will you visit?
      </h2>
    </>
  );
}

function PriceRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className="flex justify-between gap-3 py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: "12px", color: TEXT_MUTED }}>{label}</span>
      <span
        style={{
          fontSize: emphasize ? "15px" : "13px",
          color: emphasize ? GOLD : TEXT_PRIMARY,
          fontWeight: emphasize ? 600 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const ghostButtonStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_PRIMARY,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "9px",
  padding: "10px 16px",
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#0D0B08",
  background:
    "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))",
  border: "none",
  borderRadius: "9px",
  padding: "12px 20px",
  cursor: "pointer",
};
