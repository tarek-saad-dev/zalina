"use client";

import type { ApiLocale } from "@/lib/api";
import type { BookingLifecycleBucket } from "./bookingStatusModel";
import { bookingStatusLabel } from "./bookingStatusCopy";

const STYLES: Record<
  BookingLifecycleBucket,
  { bg: string; border: string; color: string }
> = {
  waiting: {
    bg: "rgba(212,175,55,0.12)",
    border: "rgba(212,175,55,0.35)",
    color: "rgba(232,199,102,0.95)",
  },
  confirmed_preparing_ticket: {
    bg: "rgba(80,160,120,0.12)",
    border: "rgba(80,160,120,0.35)",
    color: "rgba(160,220,180,0.95)",
  },
  confirmed_ready: {
    bg: "rgba(80,160,120,0.12)",
    border: "rgba(80,160,120,0.35)",
    color: "rgba(160,220,180,0.95)",
  },
  active_visit: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
    color: "rgba(248,242,231,0.85)",
  },
  failed: {
    bg: "rgba(180,80,60,0.12)",
    border: "rgba(180,80,60,0.35)",
    color: "rgba(240,170,140,0.95)",
  },
  cancelled: {
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.12)",
    color: "rgba(248,242,231,0.7)",
  },
  expired: {
    bg: "rgba(220,160,100,0.1)",
    border: "rgba(220,160,100,0.3)",
    color: "rgba(240,190,140,0.95)",
  },
  unknown: {
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.12)",
    color: "rgba(248,242,231,0.7)",
  },
};

interface BookingStatusBadgeProps {
  status: string;
  bucket: BookingLifecycleBucket;
  locale: ApiLocale;
}

export function BookingStatusBadge({
  status,
  bucket,
  locale,
}: BookingStatusBadgeProps) {
  const style = STYLES[bucket] ?? STYLES.unknown;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: "8px 14px",
        borderRadius: "999px",
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: style.color,
          flexShrink: 0,
        }}
      />
      {bookingStatusLabel(status, locale)}
    </span>
  );
}
