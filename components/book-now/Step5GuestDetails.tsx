"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { BookingState, GuestContactDetails, OccasionType } from "./types";

interface Step5GuestDetailsProps {
  state: BookingState;
  onSetGuestDetails: (patch: Partial<GuestContactDetails>) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_BORDER = "rgba(212,175,55,0.35)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.50)";
const TEXT_DIM = "rgba(248,242,231,0.28)";
const ERROR_COLOR = "rgba(212,140,55,0.85)";

const OCCASION_OPTIONS: { value: OccasionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "proposal", label: "Proposal" },
  { value: "family", label: "Family Gathering" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
];

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "10px",
  padding: "14px 16px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: TEXT_PRIMARY,
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      style={{
        display: "block",
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: TEXT_MUTED,
        fontWeight: 500,
        marginBottom: "8px",
      }}
    >
      {children}
      {required && (
        <span style={{ color: GOLD, marginLeft: "4px" }}>*</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        color: ERROR_COLOR,
        marginTop: "5px",
        letterSpacing: "0.02em",
      }}
    >
      {message}
    </p>
  );
}

function LuxuryInput({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          borderColor: error
            ? ERROR_COLOR
            : focused
            ? GOLD_BORDER
            : "rgba(255,255,255,0.10)",
          boxShadow: focused && !error ? `0 0 0 2px rgba(212,175,55,0.08)` : "none",
        }}
      />
      <FieldError message={error} />
    </>
  );
}

function LuxuryTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        resize: "vertical",
        minHeight: "100px",
        borderColor: focused ? GOLD_BORDER : "rgba(255,255,255,0.10)",
        boxShadow: focused ? `0 0 0 2px rgba(212,175,55,0.08)` : "none",
        lineHeight: 1.6,
      }}
    />
  );
}

function LuxurySelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        borderColor: focused ? GOLD_BORDER : "rgba(255,255,255,0.10)",
        boxShadow: focused ? `0 0 0 2px rgba(212,175,55,0.08)` : "none",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#0D0B08", color: TEXT_PRIMARY }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function validateEmail(email: string): string | undefined {
  if (!email) return undefined;
  if (!email.includes("@") || !email.includes(".")) return "Please enter a valid email address.";
  return undefined;
}

export function Step5GuestDetails({ state, onSetGuestDetails }: Step5GuestDetailsProps) {
  const g = state.guestDetails;

  const [touched, setTouched] = useState({
    fullName: false,
    phone: false,
    email: false,
    country: false,
  });

  function touch(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  const errors = {
    fullName: touched.fullName && !g.fullName.trim() ? "Full name is required." : undefined,
    phone: touched.phone && !g.phone.trim() ? "Phone number is required." : undefined,
    email: touched.email ? validateEmail(g.email) || (!g.email.trim() ? "Email is required." : undefined) : undefined,
    country: touched.country && !g.country.trim() ? "Country is required." : undefined,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <User size={14} color={GOLD} />
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
            Step 5 — Contact Details
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
          Your Contact Details
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
          Share a few details so the Zalina concierge team can confirm your
          reservation.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {/* Row 1: Full Name */}
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <LuxuryInput
            value={g.fullName}
            placeholder="Your full name"
            onChange={(v) => onSetGuestDetails({ fullName: v })}
            error={errors.fullName}
          />
          <div onBlur={() => touch("fullName")} style={{ height: 0 }} />
        </div>

        {/* Row 2: Phone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel required>WhatsApp / Phone</FieldLabel>
            <LuxuryInput
              value={g.phone}
              placeholder="+20 10 0000 0000"
              type="tel"
              onChange={(v) => {
                touch("phone");
                onSetGuestDetails({ phone: v });
              }}
              error={errors.phone}
            />
          </div>
          <div>
            <FieldLabel required>Email</FieldLabel>
            <LuxuryInput
              value={g.email}
              placeholder="your@email.com"
              type="email"
              onChange={(v) => {
                touch("email");
                onSetGuestDetails({ email: v });
              }}
              error={errors.email}
            />
          </div>
        </div>

        {/* Row 3: Country + Occasion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel required>Country / Nationality</FieldLabel>
            <LuxuryInput
              value={g.country}
              placeholder="e.g. Egypt, Saudi Arabia"
              onChange={(v) => {
                touch("country");
                onSetGuestDetails({ country: v });
              }}
              error={errors.country}
            />
          </div>
          <div>
            <FieldLabel>Occasion Type</FieldLabel>
            <LuxurySelect
              value={g.occasion}
              onChange={(v) => onSetGuestDetails({ occasion: v as OccasionType })}
              options={OCCASION_OPTIONS}
            />
          </div>
        </div>

        {/* Row 4: Special Requests */}
        <div>
          <FieldLabel>Special Requests</FieldLabel>
          <LuxuryTextarea
            value={g.specialRequests}
            placeholder="Tell us about dietary preferences, arrival notes, celebration details, or anything we should prepare."
            onChange={(v) => onSetGuestDetails({ specialRequests: v })}
          />
        </div>

        {/* Privacy note */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: TEXT_DIM,
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          Your details are used only to confirm your booking. We do not share
          your information with third parties.
        </p>
      </motion.div>
    </div>
  );
}
