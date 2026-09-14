"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { BookingState, GuestDetailsState } from "./types";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepGuestDetailsV2Props {
  state: BookingState;
  onSetGuestDetails: (patch: Partial<GuestDetailsState>) => void;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEXT_MUTED,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" style={{ fontSize: "12px", color: "rgba(220,160,100,0.95)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "9px",
  padding: "12px 14px",
  color: TEXT_PRIMARY,
  fontFamily: "var(--font-body)",
  fontSize: "14px",
};

export function StepGuestDetailsV2({
  state,
  onSetGuestDetails,
}: StepGuestDetailsV2Props) {
  const t = useTranslations("bookNow");
  const g = state.guest;
  const emailError =
    g.email.trim().length > 0 &&
    (!g.email.includes("@") || !g.email.includes("."))
      ? t("guest.emailError")
      : undefined;

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
        {t("guest.eyebrow")}
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
        {t("guest.title")}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          marginBottom: "28px",
          lineHeight: 1.7,
        }}
      >
        {t("guest.subtitle")}
      </p>

      <div className="grid gap-4">
        <Field id="guest-name" label={t("guest.fullName")}>
          <input
            id="guest-name"
            value={g.name}
            onChange={(e) => onSetGuestDetails({ name: e.target.value })}
            style={inputStyle}
            autoComplete="name"
            required
          />
        </Field>
        <Field id="guest-email" label={t("guest.email")} error={emailError}>
          <input
            id="guest-email"
            type="email"
            value={g.email}
            onChange={(e) => onSetGuestDetails({ email: e.target.value })}
            style={inputStyle}
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "guest-email-error" : undefined}
            required
          />
        </Field>
        <Field id="guest-phone" label={t("guest.phone")}>
          <input
            id="guest-phone"
            type="tel"
            value={g.phone}
            onChange={(e) => onSetGuestDetails({ phone: e.target.value })}
            style={inputStyle}
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </Field>
      </div>
    </div>
  );
}
