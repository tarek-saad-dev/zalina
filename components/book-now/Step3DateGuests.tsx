"use client";

import { motion } from "framer-motion";
import { Info, CalendarDays, Moon } from "lucide-react";
import type { BookingState, DateSelection, PreferredPeriod } from "./types";
import { TIME_SLOTS, PREFERRED_PERIODS, getMockUnavailableDates } from "./mockData";
import { BookingCalendar } from "./BookingCalendar";
import { GuestSelector } from "./GuestSelector";

interface Step3DateGuestsProps {
  state: BookingState;
  onSetDateSelection: (patch: Partial<DateSelection>) => void;
  onSetGuests: (n: number) => void;
  onSetParticipants: (n: number) => void;
  onSetEstimatedGuests: (n: number) => void;
  onSetPreferredPeriod: (p: PreferredPeriod) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";
const TEXT_DIM = "rgba(248,242,231,0.30)";

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Availability Notice ─────────────────────────────────── */
function AvailabilityNotice({ status }: { status: "available" | "incomplete" | "unavailable" }) {
  const configs = {
    available: {
      icon: "✦",
      text: "Selected window is available in this mock preview.",
      color: GOLD,
      bg: "rgba(212,175,55,0.05)",
      border: "rgba(212,175,55,0.18)",
    },
    incomplete: {
      icon: "◌",
      text: "Choose your date details to preview availability.",
      color: TEXT_DIM,
      bg: "rgba(255,255,255,0.02)",
      border: "rgba(255,255,255,0.07)",
    },
    unavailable: {
      icon: "✕",
      text: "This date is unavailable. Please choose another day.",
      color: "rgba(212,140,55,0.85)",
      bg: "rgba(212,140,55,0.05)",
      border: "rgba(212,140,55,0.20)",
    },
  };
  const c = configs[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "10px",
        padding: "13px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <span style={{ fontFamily: "serif", fontSize: "14px", color: c.color, flexShrink: 0, marginTop: "1px" }}>
        {c.icon}
      </span>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: c.color, lineHeight: 1.65 }}>
        {c.text}
      </p>
    </motion.div>
  );
}

/* ─── Stay Case ───────────────────────────────────────────── */
function StayDateCase({
  state,
  onSetDateSelection,
  onSetGuests,
}: Pick<Step3DateGuestsProps, "state" | "onSetDateSelection" | "onSetGuests">) {
  const { dateSelection, guests, selectedItemMaxGuests } = state;
  const today = toLocalISO(new Date());
  const unavailable = getMockUnavailableDates();

  const availStatus: "available" | "incomplete" | "unavailable" = (() => {
    if (!dateSelection.checkIn) return "incomplete";
    if (unavailable.has(dateSelection.checkIn) || (dateSelection.checkOut && unavailable.has(dateSelection.checkOut))) {
      return "unavailable";
    }
    if (dateSelection.checkIn && dateSelection.checkOut) return "available";
    return "incomplete";
  })();

  return (
    <div className="flex flex-col gap-5">
      <BookingCalendar
        mode="range"
        checkIn={dateSelection.checkIn}
        checkOut={dateSelection.checkOut}
        minDate={today}
        onSelectRange={(ci, co) => {
          onSetDateSelection({ checkIn: ci, checkOut: co ?? null });
        }}
      />

      {/* Nights info strip */}
      {dateSelection.checkIn && dateSelection.checkOut && dateSelection.nights > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            background: "rgba(212,175,55,0.05)",
            border: "1px solid rgba(212,175,55,0.16)",
            borderRadius: "10px",
          }}
        >
          <Moon size={16} color={GOLD_SOFT} />
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: TEXT_PRIMARY, fontWeight: 400 }}>
              {dateSelection.nights}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_MUTED, marginLeft: "6px" }}>
              {dateSelection.nights === 1 ? "night" : "nights"}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: TEXT_DIM, marginLeft: "12px" }}>
              {formatDisplayDate(dateSelection.checkIn)} → {formatDisplayDate(dateSelection.checkOut)}
            </span>
          </div>
        </motion.div>
      )}

      <GuestSelector
        value={guests}
        min={1}
        max={selectedItemMaxGuests ?? undefined}
        label="Guests"
        sublabel={selectedItemMaxGuests ? `Up to ${selectedItemMaxGuests} guests` : undefined}
        onChange={onSetGuests}
      />

      <AvailabilityNotice status={availStatus} />
    </div>
  );
}

/* ─── Evening Case ────────────────────────────────────────── */
function EveningDateCase({
  state,
  onSetDateSelection,
  onSetParticipants,
}: Pick<Step3DateGuestsProps, "state" | "onSetDateSelection" | "onSetParticipants">) {
  const { dateSelection, participants } = state;
  const today = toLocalISO(new Date());
  const unavailable = getMockUnavailableDates();

  const availStatus: "available" | "incomplete" | "unavailable" = (() => {
    if (!dateSelection.date) return "incomplete";
    if (unavailable.has(dateSelection.date)) return "unavailable";
    if (dateSelection.timeSlot) return "available";
    return "incomplete";
  })();

  return (
    <div className="flex flex-col gap-5">
      <BookingCalendar
        mode="single"
        selectedDate={dateSelection.date}
        minDate={today}
        onSelectDate={(iso) => onSetDateSelection({ date: iso })}
      />

      {/* Time slot selector */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: TEXT_DIM,
            fontWeight: 500,
            marginBottom: "10px",
          }}
        >
          Preferred Time
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {TIME_SLOTS.map((slot) => {
            const isSelected = dateSelection.timeSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => onSetDateSelection({ timeSlot: slot.id })}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: isSelected
                    ? "1px solid rgba(212,175,55,0.42)"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: isSelected
                    ? "rgba(212,175,55,0.07)"
                    : "rgba(255,255,255,0.022)",
                  cursor: "pointer",
                  outline: "none",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "0 2px 16px rgba(212,175,55,0.08)" : "none",
                }}
                aria-pressed={isSelected}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.70)",
                    marginBottom: "3px",
                  }}
                >
                  {slot.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: isSelected ? GOLD : TEXT_DIM,
                    letterSpacing: "0.04em",
                  }}
                >
                  {slot.time}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <GuestSelector
        value={participants}
        min={1}
        label="Participants"
        onChange={onSetParticipants}
      />

      <AvailabilityNotice status={availStatus} />
    </div>
  );
}

/* ─── Private Case ────────────────────────────────────────── */
function PrivateDateCase({
  state,
  onSetDateSelection,
  onSetEstimatedGuests,
  onSetPreferredPeriod,
}: Pick<Step3DateGuestsProps, "state" | "onSetDateSelection" | "onSetEstimatedGuests" | "onSetPreferredPeriod">) {
  const { dateSelection, estimatedGuests } = state;
  const today = toLocalISO(new Date());

  const availStatus: "available" | "incomplete" | "unavailable" = (() => {
    if (!dateSelection.date || !dateSelection.preferredPeriod) return "incomplete";
    return "available";
  })();

  return (
    <div className="flex flex-col gap-5">
      <BookingCalendar
        mode="single"
        selectedDate={dateSelection.date}
        minDate={today}
        onSelectDate={(iso) => onSetDateSelection({ date: iso })}
      />

      {/* Preferred period */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: TEXT_DIM,
            fontWeight: 500,
            marginBottom: "10px",
          }}
        >
          Preferred Period
        </p>
        <div className="flex flex-wrap gap-3">
          {PREFERRED_PERIODS.map((period) => {
            const isSelected = dateSelection.preferredPeriod === period;
            return (
              <button
                key={period}
                onClick={() => onSetPreferredPeriod(period as PreferredPeriod)}
                style={{
                  padding: "11px 22px",
                  borderRadius: "10px",
                  border: isSelected
                    ? "1px solid rgba(212,175,55,0.42)"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: isSelected
                    ? "rgba(212,175,55,0.07)"
                    : "rgba(255,255,255,0.022)",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: isSelected ? 500 : 400,
                  color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.60)",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "0 2px 14px rgba(212,175,55,0.07)" : "none",
                  letterSpacing: "0.02em",
                }}
                aria-pressed={isSelected}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      <GuestSelector
        value={estimatedGuests}
        min={1}
        label="Estimated Guest Count"
        sublabel="Approximate number of attendees"
        onChange={onSetEstimatedGuests}
      />

      {/* Concierge note */}
      <div
        style={{
          background: "rgba(212,175,55,0.04)",
          border: "1px solid rgba(212,175,55,0.14)",
          borderRadius: "12px",
          padding: "16px 18px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <Info size={14} color="rgba(212,175,55,0.60)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "rgba(248,242,231,0.50)",
            lineHeight: 1.72,
          }}
        >
          Private occasions are confirmed after a tailored proposal covering
          setup, dining, entertainment, and schedule.
        </p>
      </div>

      <AvailabilityNotice status={availStatus} />
    </div>
  );
}

/* ─── Root Export ─────────────────────────────────────────── */
export function Step3DateGuests({
  state,
  onSetDateSelection,
  onSetGuests,
  onSetParticipants,
  onSetEstimatedGuests,
  onSetPreferredPeriod,
}: Step3DateGuestsProps) {
  const isStay = state.journeyType === "stay";
  const isEvening = state.journeyType === "evening";
  const isPrivate = state.journeyType === "private";

  const stepLabel = isPrivate
    ? "Occasion Window"
    : isEvening
    ? "Evening Details"
    : "Dates & Guests";

  const title = isPrivate
    ? "Choose an Occasion Window"
    : isEvening
    ? "Choose Your Evening"
    : "Choose Your Dates";

  const subtitle = isPrivate
    ? "Select a preferred date and guest estimate. The Zalina concierge team will tailor the proposal."
    : isEvening
    ? "Select the date and preferred time for your curated Zalina experience."
    : "Select your arrival and departure dates. Availability and pricing will be refined before payment.";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <CalendarDays size={15} color={GOLD} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 500,
            }}
          >
            Step 3 — {stepLabel}
          </p>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            lineHeight: 1.15,
            marginBottom: "10px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: TEXT_MUTED,
            lineHeight: 1.72,
            maxWidth: "500px",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Case content */}
      <motion.div
        key={state.journeyType ?? "default"}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {isStay && (
          <StayDateCase
            state={state}
            onSetDateSelection={onSetDateSelection}
            onSetGuests={onSetGuests}
          />
        )}
        {isEvening && (
          <EveningDateCase
            state={state}
            onSetDateSelection={onSetDateSelection}
            onSetParticipants={onSetParticipants}
          />
        )}
        {isPrivate && (
          <PrivateDateCase
            state={state}
            onSetDateSelection={onSetDateSelection}
            onSetEstimatedGuests={onSetEstimatedGuests}
            onSetPreferredPeriod={onSetPreferredPeriod}
          />
        )}
      </motion.div>
    </div>
  );
}
