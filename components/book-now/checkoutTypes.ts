import type { ApiBooking, BookingProductType } from "@/lib/api";

/** Explicit checkout phases — avoid conflicting boolean flags. */
export type CheckoutPhase =
  | "idle"
  | "creating"
  | "created"
  | "initiating_payment"
  | "redirecting"
  | "error"
  | "expired"
  | "already_paid";

export interface CheckoutError {
  message: string;
  status: number | null;
  fieldErrors?: Record<string, string[]>;
  /** Upstream X-Request-Id when available (safe to show). */
  requestId?: string;
  /** Bubble inventory conflict — return to bubbles step. */
  kind?: "conflict" | "validation" | "rate_limit" | "network" | "payment" | "generic";
}

export interface CheckoutState {
  phase: CheckoutPhase;
  booking: ApiBooking | null;
  error: CheckoutError | null;
  /** Client estimate captured at create time for comparison UX. */
  estimateAtCreate: number | null;
  statusMessage: string | null;
}

export function createInitialCheckoutState(): CheckoutState {
  return {
    phase: "idle",
    booking: null,
    error: null,
    estimateAtCreate: null,
    statusMessage: null,
  };
}

export const PAYMENT_HANDOFF_STORAGE_KEY = "zalina.booking.payment.v2";
export const PAYMENT_HANDOFF_SCHEMA_VERSION = 2 as const;

/** Minimal recovery payload — no guest PII, no payment_url. */
export interface PendingPaymentHandoff {
  schemaVersion: typeof PAYMENT_HANDOFF_SCHEMA_VERSION;
  booking_reference: string;
  booking_code: string;
  product_type: BookingProductType;
  created_at: string;
  hold_expires_at: string | null;
  payment_expires_at: string | null;
  total: string;
  currency?: string;
}

export function isBusyCheckoutPhase(phase: CheckoutPhase): boolean {
  return (
    phase === "creating" ||
    phase === "initiating_payment" ||
    phase === "redirecting"
  );
}
