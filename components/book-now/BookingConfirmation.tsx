"use client";

import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, FileText } from "lucide-react";
import type { BookingState } from "./types";
import { JOURNEY_TYPE_LABELS, TIME_SLOTS } from "./mockData";

interface BookingConfirmationProps {
  state: BookingState;
  onReset: () => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";
const TEXT_DIM = "rgba(248,242,231,0.28)";

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: TEXT_MUTED, flexShrink: 0, minWidth: "110px" }}>
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_PRIMARY, textAlign: "right", lineHeight: 1.4 }}>
        {value}
      </span>
    </div>
  );
}

/* ─── QR Placeholder ────────────────────────────────────── */
function QRPlaceholder({ reference }: { reference: string }) {
  const blocks: boolean[] = [];
  for (let i = 0; i < 49; i++) {
    blocks.push((i + Math.floor(i / 7)) % 3 !== 0);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "140px",
          height: "140px",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "12px",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* corner accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {blocks.map((on, i) => (
          <div
            key={i}
            style={{
              borderRadius: "1.5px",
              background: on ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.06)",
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          color: TEXT_DIM,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        QR ticket after confirmation
      </p>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: "13px",
          color: GOLD,
          letterSpacing: "0.12em",
          fontWeight: 600,
        }}
      >
        {reference}
      </p>
    </div>
  );
}

/* ─── Stay / Evening Confirmation ───────────────────────── */
function StayEveningConfirmation({ state, onReset }: BookingConfirmationProps) {
  const ds = state.dateSelection;
  const timeSlot = TIME_SLOTS.find((s) => s.id === ds.timeSlot);
  const journeyLabel = state.journeyType ? JOURNEY_TYPE_LABELS[state.journeyType] : "—";

  const dateValue =
    state.journeyType === "stay"
      ? ds.checkIn && ds.checkOut
        ? `${ds.checkIn} → ${ds.checkOut}`
        : ds.checkIn ?? "—"
      : ds.date ?? "—";

  const guestsValue =
    state.journeyType === "stay"
      ? `${state.guests} guest${state.guests !== 1 ? "s" : ""}`
      : `${state.participants} participant${state.participants !== 1 ? "s" : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
      style={{ textAlign: "center", maxWidth: "580px", margin: "0 auto" }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(212,175,55,0.08)",
          border: `1px solid ${GOLD_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <CheckCircle2 size={28} color={GOLD} />
      </motion.div>

      {/* Title */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          fontWeight: 500,
          marginBottom: "12px",
        }}
      >
        Reservation Preview
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3.5vw, 40px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          lineHeight: 1.12,
          marginBottom: "14px",
          letterSpacing: "-0.01em",
        }}
      >
        Your Arabian Night Awaits
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: 1.72,
          maxWidth: "420px",
          marginBottom: "36px",
        }}
      >
        Your reservation preview has been prepared. Payment integration will
        complete this flow in the next phase.
      </p>

      {/* QR + ref */}
      <QRPlaceholder reference={state.bookingReference ?? "ZAL-XXXX"} />

      {/* Summary card */}
      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.025)",
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "14px",
          padding: "20px 24px",
          marginTop: "28px",
          textAlign: "left",
        }}
      >
        <ConfirmRow label="Journey" value={journeyLabel} />
        <ConfirmRow label="Selection" value={state.selectedItemTitle ?? "—"} />
        <ConfirmRow label="Date" value={dateValue} />
        {state.journeyType === "evening" && timeSlot && (
          <ConfirmRow label="Time" value={`${timeSlot.label} · ${timeSlot.time}`} />
        )}
        {state.journeyType === "stay" && ds.nights > 0 && (
          <ConfirmRow label="Nights" value={`${ds.nights} night${ds.nights !== 1 ? "s" : ""}`} />
        )}
        <ConfirmRow label={state.journeyType === "stay" ? "Guests" : "Participants"} value={guestsValue} />
        <ConfirmRow label="Guest Name" value={state.guestDetails.fullName || "—"} />
        <div className="flex justify-between items-center pt-3 mt-1">
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: TEXT_MUTED }}>Estimated Total</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: GOLD, fontWeight: 400 }}>
            EGP {state.estimatedTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* QR note */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: TEXT_DIM,
          lineHeight: 1.65,
          marginTop: "16px",
          fontStyle: "italic",
        }}
      >
        QR ticket will be generated after successful payment confirmation.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
        <button
          onClick={() => {}}
          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            height: "50px",
            background: "rgba(212,175,55,0.07)",
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: "10px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: TEXT_PRIMARY,
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          <FileText size={14} color={GOLD_SOFT} />
          View Journey Summary
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            height: "50px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: TEXT_MUTED,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={13} />
          Start New Booking
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Private / Concierge Confirmation ──────────────────── */
function PrivateConfirmation({ state, onReset }: BookingConfirmationProps) {
  const ds = state.dateSelection;
  const selectedCount = state.enhancements.filter((e) => e.selected).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
      style={{ textAlign: "center", maxWidth: "580px", margin: "0 auto" }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(212,175,55,0.08)",
          border: `1px solid ${GOLD_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <CheckCircle2 size={28} color={GOLD} />
      </motion.div>

      {/* Reference badge */}
      <div
        style={{
          background: "rgba(212,175,55,0.06)",
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "8px",
          padding: "6px 18px",
          marginBottom: "20px",
          display: "inline-block",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            color: GOLD,
            letterSpacing: "0.10em",
            fontWeight: 600,
          }}
        >
          {state.bookingReference ?? "ZAL-CON-XXXX"}
        </span>
      </div>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          fontWeight: 500,
          marginBottom: "12px",
        }}
      >
        Concierge Request
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3.2vw, 38px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          lineHeight: 1.12,
          marginBottom: "14px",
          letterSpacing: "-0.01em",
        }}
      >
        Your Concierge Request Has Been Received
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: 1.72,
          maxWidth: "420px",
          marginBottom: "36px",
        }}
      >
        The Zalina team will contact you to refine the occasion details and
        prepare a tailored proposal.
      </p>

      {/* Summary card */}
      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.025)",
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "14px",
          padding: "20px 24px",
          textAlign: "left",
        }}
      >
        <ConfirmRow label="Occasion" value={state.selectedOccasionTitle ?? "—"} />
        <ConfirmRow label="Preferred Date" value={ds.date ?? "—"} />
        <ConfirmRow label="Est. Guests" value={`~${state.estimatedGuests} guests`} />
        <ConfirmRow label="Period" value={ds.preferredPeriod ?? "—"} />
        <ConfirmRow label="Guest Name" value={state.guestDetails.fullName || "—"} />
        <ConfirmRow label="Contact" value={state.guestDetails.phone || state.guestDetails.email || "—"} />
        {selectedCount > 0 && (
          <ConfirmRow
            label="Enhancements"
            value={`${selectedCount} preference${selectedCount !== 1 ? "s" : ""} noted`}
          />
        )}
        <div
          style={{
            marginTop: "12px",
            padding: "12px 14px",
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.12)",
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: TEXT_MUTED,
              lineHeight: 1.65,
            }}
          >
            Pricing — <em style={{ color: GOLD_SOFT }}>Custom proposal</em>
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
        <button
          onClick={() => {}}
          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            height: "50px",
            background: "rgba(212,175,55,0.07)",
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: "10px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: TEXT_PRIMARY,
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          <FileText size={14} color={GOLD_SOFT} />
          View Request Summary
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            height: "50px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: TEXT_MUTED,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={13} />
          Start New Request
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Root Export ─────────────────────────────────────────── */
export function BookingConfirmation({ state, onReset }: BookingConfirmationProps) {
  if (state.isPrivateCustom) {
    return <PrivateConfirmation state={state} onReset={onReset} />;
  }
  return <StayEveningConfirmation state={state} onReset={onReset} />;
}
