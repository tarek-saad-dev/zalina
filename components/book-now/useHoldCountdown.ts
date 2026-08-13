"use client";

import { useEffect, useState } from "react";

function parseExpiryMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export function pickExpiryTimestamp(input: {
  payment_expires_at?: string | null;
  hold_expires_at?: string | null;
}): number | null {
  // Prefer payment expiry for CTA urgency; fall back to hold.
  return (
    parseExpiryMs(input.payment_expires_at) ??
    parseExpiryMs(input.hold_expires_at)
  );
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Countdown from absolute server timestamps — refresh-safe.
 */
export function useHoldCountdown(input: {
  payment_expires_at?: string | null;
  hold_expires_at?: string | null;
}) {
  const expiryMs = pickExpiryTimestamp(input);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (expiryMs == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiryMs]);

  if (expiryMs == null) {
    return {
      remainingMs: null as number | null,
      isExpired: false,
      label: null as string | null,
      expiryIso:
        input.payment_expires_at ?? input.hold_expires_at ?? null,
    };
  }

  const remainingMs = expiryMs - now;
  return {
    remainingMs,
    isExpired: remainingMs <= 0,
    label: formatRemaining(remainingMs),
    expiryIso: input.payment_expires_at ?? input.hold_expires_at ?? null,
  };
}
