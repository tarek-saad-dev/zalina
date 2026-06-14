"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Loader2, AlertTriangle, ClipboardList } from "lucide-react";
import type { BookingState, EnhancementAddOn } from "./types";
import { JOURNEY_TYPE_LABELS, TIME_SLOTS } from "./mockData";

interface Step6ReviewPaymentProps {
  state: BookingState;
  onSubmit: () => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
const GOLD_BORDER = "rgba(212,175,55,0.20)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";
const TEXT_DIM = "rgba(248,242,231,0.30)";
const SECTION_BG = "rgba(255,255,255,0.025)";
const SECTION_BORDER = "rgba(255,255,255,0.07)";

/* ─── Shared sub-components ─────────────────────────────── */
function ReviewCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: SECTION_BG,
        border: `1px solid ${SECTION_BORDER}`,
        borderRadius: "14px",
        padding: "20px 22px",
      }}
    >
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: `1px solid ${SECTION_BORDER}`, paddingBottom: "12px" }}>
        {icon && <span style={{ color: GOLD_SOFT, flexShrink: 0 }}>{icon}</span>}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: GOLD_SOFT,
            fontWeight: 500,
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: TEXT_MUTED,
          flexShrink: 0,
          minWidth: "110px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "monospace" : "var(--font-body)",
          fontSize: "13px",
          color: TEXT_PRIMARY,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  highlight,
  dim,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className="flex justify-between items-center py-2"
      style={{
        borderTop: highlight ? `1px solid ${GOLD_BORDER}` : undefined,
        marginTop: highlight ? "8px" : undefined,
        paddingTop: highlight ? "12px" : undefined,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: highlight ? "13px" : "12px",
          color: dim ? TEXT_DIM : TEXT_MUTED,
          fontWeight: highlight ? 500 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: highlight ? "18px" : "13px",
          color: highlight ? GOLD : dim ? TEXT_DIM : TEXT_PRIMARY,
          fontWeight: highlight ? 600 : 400,
          letterSpacing: highlight ? "0.02em" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Section: Journey ───────────────────────────────────── */
function JourneySection({ state }: { state: BookingState }) {
  const journeyLabel = state.journeyType ? JOURNEY_TYPE_LABELS[state.journeyType] : "—";
  const selectionLabel = state.isPrivateCustom
    ? state.selectedOccasionTitle
    : state.selectedItemTitle;

  return (
    <ReviewCard title="Journey" icon={<CheckCircle2 size={13} />}>
      <ReviewRow label="Type" value={journeyLabel} />
      {selectionLabel && <ReviewRow label="Selection" value={selectionLabel} />}
    </ReviewCard>
  );
}

/* ─── Section: Date & Guests ─────────────────────────────── */
function DateGuestsSection({ state }: { state: BookingState }) {
  const ds = state.dateSelection;
  const timeSlotLabel = TIME_SLOTS.find((s) => s.id === ds.timeSlot);

  return (
    <ReviewCard title="Date & Guests">
      {state.journeyType === "stay" && (
        <>
          <ReviewRow label="Check-in" value={ds.checkIn ?? "—"} />
          <ReviewRow label="Check-out" value={ds.checkOut ?? "—"} />
          <ReviewRow label="Nights" value={ds.nights > 0 ? `${ds.nights} night${ds.nights !== 1 ? "s" : ""}` : "—"} />
          <ReviewRow label="Guests" value={`${state.guests} guest${state.guests !== 1 ? "s" : ""}`} />
        </>
      )}
      {state.journeyType === "evening" && (
        <>
          <ReviewRow label="Date" value={ds.date ?? "—"} />
          <ReviewRow label="Time Slot" value={timeSlotLabel ? `${timeSlotLabel.label} · ${timeSlotLabel.time}` : ds.timeSlot ?? "—"} />
          <ReviewRow label="Participants" value={`${state.participants} participant${state.participants !== 1 ? "s" : ""}`} />
        </>
      )}
      {state.journeyType === "private" && (
        <>
          <ReviewRow label="Preferred Date" value={ds.date ?? "—"} />
          <ReviewRow label="Period" value={ds.preferredPeriod ?? "—"} />
          <ReviewRow label="Est. Guests" value={`~${state.estimatedGuests} guests`} />
        </>
      )}
    </ReviewCard>
  );
}

/* ─── Section: Enhancements ──────────────────────────────── */
function EnhancementsSection({ state }: { state: BookingState }) {
  const selected = state.enhancements.filter((e) => e.selected);
  const guestCount =
    state.journeyType === "evening"
      ? state.participants
      : state.journeyType === "private"
      ? state.estimatedGuests
      : state.guests;

  function enhancementAmount(e: EnhancementAddOn): string {
    const amount =
      e.pricingType === "per-guest" ? e.price * guestCount : e.price;
    return `EGP ${amount.toLocaleString()}`;
  }

  if (selected.length === 0) {
    return (
      <ReviewCard title="Enhancements">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_DIM, fontStyle: "italic" }}>
          No enhancements selected.
        </p>
      </ReviewCard>
    );
  }

  return (
    <ReviewCard title="Enhancements">
      {selected.map((e) => (
        <div key={e.id} className="flex justify-between items-start py-1.5">
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_PRIMARY, lineHeight: 1.3 }}>
              {e.name}
            </p>
            {e.pricingType === "per-guest" && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: TEXT_DIM, marginTop: "2px" }}>
                EGP {e.price.toLocaleString()} × {guestCount} guests
              </p>
            )}
          </div>
          {state.isPrivateCustom ? (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: TEXT_MUTED, fontStyle: "italic", textAlign: "right" }}>
              Proposal
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: GOLD_SOFT, fontWeight: 600, flexShrink: 0 }}>
              {enhancementAmount(e)}
            </span>
          )}
        </div>
      ))}
      {state.isPrivateCustom && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: TEXT_DIM,
            fontStyle: "italic",
            marginTop: "10px",
            lineHeight: 1.6,
          }}
        >
          Included in concierge proposal preferences — not charged separately.
        </p>
      )}
    </ReviewCard>
  );
}

/* ─── Section: Guest Details ─────────────────────────────── */
function GuestDetailsSection({ state }: { state: BookingState }) {
  const g = state.guestDetails;
  const occasionLabels: Record<string, string> = {
    birthday: "Birthday",
    anniversary: "Anniversary",
    honeymoon: "Honeymoon",
    proposal: "Proposal",
    family: "Family Gathering",
    corporate: "Corporate",
    other: "Other",
  };

  return (
    <ReviewCard title="Guest Details">
      <ReviewRow label="Full Name" value={g.fullName || "—"} />
      <ReviewRow label="Phone" value={g.phone || "—"} mono />
      <ReviewRow label="Email" value={g.email || "—"} mono />
      <ReviewRow label="Country" value={g.country || "—"} />
      {g.occasion !== "none" && g.occasion && (
        <ReviewRow label="Occasion" value={occasionLabels[g.occasion] ?? g.occasion} />
      )}
      {g.specialRequests.trim() && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${SECTION_BORDER}` }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: TEXT_MUTED, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>
            Special Requests
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_PRIMARY, lineHeight: 1.65 }}>
            {g.specialRequests}
          </p>
        </div>
      )}
    </ReviewCard>
  );
}

/* ─── Section: Price Breakdown ───────────────────────────── */
function PriceBreakdown({ state }: { state: BookingState }) {
  if (state.isPrivateCustom) {
    return (
      <ReviewCard title="Pricing">
        <div
          style={{
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.14)",
            borderRadius: "10px",
            padding: "16px 18px",
            marginBottom: "10px",
          }}
        >
          <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: GOLD, fontWeight: 400, marginBottom: "6px" }}>
            Custom proposal
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: TEXT_MUTED, lineHeight: 1.72 }}>
            The Zalina concierge team will prepare a tailored proposal based on
            your occasion, guest estimate, setup, dining, and selected
            enhancements.
          </p>
        </div>
      </ReviewCard>
    );
  }

  return (
    <ReviewCard title="Price Breakdown">
      <PriceRow label="Base total" value={`EGP ${state.baseTotal.toLocaleString()}`} />
      {state.addOnsTotal > 0 && (
        <PriceRow label="Enhancements" value={`EGP ${state.addOnsTotal.toLocaleString()}`} />
      )}
      <PriceRow
        label="Estimated Total"
        value={`EGP ${state.estimatedTotal.toLocaleString()}`}
        highlight
      />
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: TEXT_DIM,
          marginTop: "10px",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        Final pricing will be validated before payment.
      </p>
    </ReviewCard>
  );
}

/* ─── Payment Mock Panel ─────────────────────────────────── */
function PaymentPanel({
  state,
  onSubmit,
}: {
  state: BookingState;
  onSubmit: () => void;
}) {
  const isPrivate = state.isPrivateCustom;
  const isSubmitting = state.bookingStatus === "submitting";
  const hasFailed = state.bookingStatus === "failed";

  const ctaLabel = isSubmitting
    ? isPrivate
      ? "Sending your request…"
      : "Preparing your reservation…"
    : isPrivate
    ? "Send Concierge Request"
    : "Confirm & Continue to Payment";

  return (
    <div className="flex flex-col gap-4">
      {/* Payment method placeholder — only for non-private */}
      {!isPrivate && (
        <div
          style={{
            background: SECTION_BG,
            border: `1px solid ${SECTION_BORDER}`,
            borderRadius: "14px",
            padding: "18px 22px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <CreditCard size={18} color={GOLD_SOFT} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: TEXT_PRIMARY, fontWeight: 500, marginBottom: "4px" }}>
              Secure Online Payment
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: TEXT_DIM, lineHeight: 1.6 }}>
              Payment gateway will be connected in the backend integration phase.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasFailed && state.submissionError && (
        <div
          style={{
            background: "rgba(212,140,55,0.05)",
            border: "1px solid rgba(212,140,55,0.22)",
            borderRadius: "10px",
            padding: "14px 16px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={14} color="rgba(212,140,55,0.85)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(212,140,55,0.85)", lineHeight: 1.6 }}>
            {state.submissionError}
          </p>
        </div>
      )}

      {/* Submit CTA */}
      <button
        onClick={isSubmitting ? undefined : onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 transition-all duration-300"
        style={{
          height: "56px",
          background: isSubmitting
            ? "rgba(212,175,55,0.12)"
            : "linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(232,199,102,0.95) 100%)",
          color: isSubmitting ? "rgba(212,175,55,0.55)" : "#0D0B08",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          borderRadius: "12px",
          border: isSubmitting ? "1px solid rgba(212,175,55,0.18)" : "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          boxShadow: isSubmitting ? "none" : "0 4px 24px rgba(212,175,55,0.22)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.boxShadow = "0 8px 36px rgba(212,175,55,0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isSubmitting ? "none" : "0 4px 24px rgba(212,175,55,0.22)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {ctaLabel}
      </button>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: TEXT_DIM,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {isPrivate
          ? "No payment is required at this stage. The concierge team will contact you."
          : "This is a mock preview. No payment will be charged in this phase."}
      </p>
    </div>
  );
}

/* ─── Root Export ─────────────────────────────────────────── */
export function Step6ReviewPayment({ state, onSubmit }: Step6ReviewPaymentProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <ClipboardList size={14} color={GOLD} />
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
            Step 6 — Review
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
          Review Your Zalina Journey
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
          Confirm the details before your reservation is prepared.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        <JourneySection state={state} />
        <DateGuestsSection state={state} />
        <EnhancementsSection state={state} />
        <GuestDetailsSection state={state} />
        <PriceBreakdown state={state} />

        {/* Separator */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)",
            margin: "4px 0",
          }}
        />

        <PaymentPanel state={state} onSubmit={onSubmit} />
      </motion.div>
    </div>
  );
}
