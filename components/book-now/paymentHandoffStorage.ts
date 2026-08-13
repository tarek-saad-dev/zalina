import {
  PAYMENT_HANDOFF_SCHEMA_VERSION,
  PAYMENT_HANDOFF_STORAGE_KEY,
  type PendingPaymentHandoff,
} from "./checkoutTypes";
import type { ApiBooking } from "@/lib/api";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingPaymentBooking(
  booking: ApiBooking
): PendingPaymentHandoff {
  const handoff: PendingPaymentHandoff = {
    schemaVersion: PAYMENT_HANDOFF_SCHEMA_VERSION,
    booking_reference: booking.booking_reference,
    booking_code: booking.booking_code,
    product_type: booking.product_type,
    created_at: booking.created_at || new Date().toISOString(),
    hold_expires_at: booking.hold_expires_at,
    payment_expires_at: booking.payment_expires_at,
    total: booking.total,
    currency: booking.currency,
  };

  const store = storage();
  if (store) {
    store.setItem(PAYMENT_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
  }
  return handoff;
}

export function loadPendingPaymentBooking(): PendingPaymentHandoff | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PAYMENT_HANDOFF_STORAGE_KEY);
    if (!raw) return null;
    return parsePendingPaymentHandoff(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearPendingPaymentBooking(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(PAYMENT_HANDOFF_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function parsePendingPaymentHandoff(
  raw: unknown
): PendingPaymentHandoff | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;

  if (c.schemaVersion !== PAYMENT_HANDOFF_SCHEMA_VERSION) return null;
  if (typeof c.booking_reference !== "string" || !c.booking_reference) {
    return null;
  }
  if (typeof c.booking_code !== "string" || !c.booking_code) return null;
  if (c.product_type !== "day_use" && c.product_type !== "bubble_stay") {
    return null;
  }

  // Reject accidental PII / payment_url persistence
  if ("guest_email" in c || "guest_phone" in c || "payment_url" in c) {
    return null;
  }

  return {
    schemaVersion: PAYMENT_HANDOFF_SCHEMA_VERSION,
    booking_reference: c.booking_reference,
    booking_code: c.booking_code,
    product_type: c.product_type,
    created_at:
      typeof c.created_at === "string"
        ? c.created_at
        : new Date().toISOString(),
    hold_expires_at:
      typeof c.hold_expires_at === "string" || c.hold_expires_at === null
        ? (c.hold_expires_at as string | null)
        : null,
    payment_expires_at:
      typeof c.payment_expires_at === "string" || c.payment_expires_at === null
        ? (c.payment_expires_at as string | null)
        : null,
    total: typeof c.total === "string" ? c.total : "",
    currency: typeof c.currency === "string" ? c.currency : undefined,
  };
}
