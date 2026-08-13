"use client";

import type { ApiLocale } from "@/lib/api";
import type { BookingLifecycleBucket } from "./bookingStatusModel";
import {
  heroSubtitleForBucket,
  heroTitleForBucket,
} from "./bookingStatusCopy";
import { BookingStatusBadge } from "./BookingStatusBadge";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT = "#F8F2E7";
const MUTED = "rgba(248,242,231,0.55)";

interface BookingStatusHeroProps {
  bucket: BookingLifecycleBucket;
  status: string;
  locale: ApiLocale;
  liveMessage?: string | null;
}

export function BookingStatusHero({
  bucket,
  status,
  locale,
  liveMessage,
}: BookingStatusHeroProps) {
  return (
    <header style={{ marginBottom: "28px" }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          marginBottom: "12px",
        }}
      >
        Zalina
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 400,
          color: TEXT,
          marginBottom: "12px",
          lineHeight: 1.15,
        }}
      >
        {heroTitleForBucket(bucket, locale)}
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: MUTED,
          lineHeight: 1.7,
          maxWidth: "36rem",
          marginBottom: "16px",
        }}
      >
        {heroSubtitleForBucket(bucket, locale)}
      </p>
      <BookingStatusBadge status={status} bucket={bucket} locale={locale} />
      {liveMessage ? (
        <p
          role="status"
          aria-live="polite"
          style={{
            marginTop: "14px",
            fontSize: "13px",
            color: GOLD,
          }}
        >
          {liveMessage}
        </p>
      ) : null}
    </header>
  );
}
