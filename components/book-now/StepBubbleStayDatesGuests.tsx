"use client";

import { useTranslations } from "next-intl";
import type { BookingState } from "./types";
import { BookingCalendar } from "./BookingCalendar";
import { GuestSelector } from "./GuestSelector";
import { getBookingMinDate, nightsBetween } from "./bookingValidation";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepBubbleStayDatesGuestsProps {
  state: BookingState;
  onSetBubbleStayDates: (patch: {
    checkIn?: string | null;
    checkOut?: string | null;
  }) => void;
  onSetBubbleStayGuests: (n: number) => void;
}

export function StepBubbleStayDatesGuests({
  state,
  onSetBubbleStayDates,
  onSetBubbleStayGuests,
}: StepBubbleStayDatesGuestsProps) {
  const t = useTranslations("bookNow");
  const { checkIn, checkOut, totalGuests } = state.bubbleStay;
  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const emDash = t("summary.emDash");

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
        {t("bubbleStayDates.eyebrow")}
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
        {t("bubbleStayDates.title")}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          marginBottom: "28px",
          maxWidth: "520px",
          lineHeight: 1.7,
        }}
      >
        {t("bubbleStayDates.subtitle")}
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <BookingCalendar
            mode="range"
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectRange={(from, to) =>
              onSetBubbleStayDates({ checkIn: from, checkOut: to })
            }
            minDate={getBookingMinDate()}
          />
        </div>
        <div className="grid gap-4 content-start">
          <GuestSelector
            label={t("bubbleStayDates.totalGuests")}
            value={totalGuests}
            onChange={onSetBubbleStayGuests}
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
            <MetaRow label={t("bubbleStayDates.checkIn")} value={checkIn ?? emDash} />
            <MetaRow label={t("bubbleStayDates.checkOut")} value={checkOut ?? emDash} />
            <MetaRow
              label={t("bubbleStayDates.nights")}
              value={nights > 0 ? String(nights) : emDash}
            />
            <MetaRow label={t("bubbleStayDates.guests")} value={String(totalGuests)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between gap-3 py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: "12px", color: TEXT_MUTED }}>{label}</span>
      <span style={{ fontSize: "13px", color: TEXT_PRIMARY }}>{value}</span>
    </div>
  );
}
