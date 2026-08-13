"use client";

import type { ApiLocale } from "@/lib/api";
import { t } from "./bookingStatusCopy";

const MUTED = "rgba(248,242,231,0.55)";
const TEXT = "#F8F2E7";
const GOLD = "rgba(212,175,55,0.9)";

export function BookingStatusLoading({ locale }: { locale: ApiLocale }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden
        className="mx-auto mb-6 animate-spin"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(212,175,55,0.25)",
          borderTopColor: GOLD,
        }}
      />
      <p style={{ color: TEXT, fontSize: "16px" }}>{t(locale, "confirming")}</p>
      <p style={{ color: MUTED, fontSize: "13px", marginTop: "8px" }}>
        {locale === "ar"
          ? "قد يستغرق تأكيد الدفع لحظات."
          : "Payment confirmation can take a moment."}
      </p>
    </div>
  );
}

interface BookingStatusErrorProps {
  locale: ApiLocale;
  title: string;
  body?: string;
  onRetry?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function BookingStatusError({
  locale,
  title,
  body,
  onRetry,
  secondaryHref = "/book-now",
  secondaryLabel,
}: BookingStatusErrorProps) {
  return (
    <div
      role="alert"
      style={{
        padding: "32px 24px",
        borderRadius: "16px",
        border: "1px solid rgba(220,160,100,0.3)",
        background: "rgba(220,160,100,0.08)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          color: TEXT,
          marginBottom: "8px",
        }}
      >
        {title}
      </h2>
      {body ? (
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: 1.7 }}>
          {body}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 mt-5">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "12px 18px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))",
              color: "#0D0B08",
            }}
          >
            {t(locale, "tryAgain")}
          </button>
        ) : null}
        <a
          href={secondaryHref}
          style={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            padding: "12px 18px",
            borderRadius: "9px",
            border: "1px solid rgba(255,255,255,0.12)",
            color: MUTED,
            textDecoration: "none",
          }}
        >
          {secondaryLabel ??
            (locale === "ar" ? "العودة للحجز" : "Back to Book Now")}
        </a>
      </div>
    </div>
  );
}
