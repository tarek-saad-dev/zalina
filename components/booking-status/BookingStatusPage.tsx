"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import {
  consumeMockCheckoutUrl,
  isMockPaymentUrl,
  peekMockCheckoutUrl,
} from "@/components/book-now/paymentUrl";
import { BookingDetails } from "./BookingDetails";
import { BookingStatusHero } from "./BookingStatusHero";
import {
  BookingStatusError,
  BookingStatusLoading,
} from "./BookingStatusStates";
import { DigitalTicket } from "./DigitalTicket";
import {
  canRetryPayment,
  canShowBookingQr,
  classifyBooking,
  isTicketMetadataReady,
} from "./bookingStatusModel";
import { t } from "./bookingStatusCopy";
import { useBookingStatusPoll } from "./useBookingStatusPoll";
import { useBookingTicket } from "./useBookingTicket";
import { usePaymentRetry } from "./usePaymentRetry";
import { sanitizeBookingReference } from "./bookingReference";

interface BookingStatusPageProps {
  /** From route — authoritative when valid. */
  routeReference: string | null;
}

function ActionLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "13px 20px",
        borderRadius: "9px",
        color: primary ? "#0D0B08" : "rgba(248,242,231,0.7)",
        background: primary
          ? "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))"
          : "transparent",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {children}
    </Link>
  );
}

export function BookingStatusPage({ routeReference }: BookingStatusPageProps) {
  const locale = useBookingLocale();
  const reference = useMemo(
    () => sanitizeBookingReference(routeReference),
    [routeReference]
  );

  const {
    booking,
    fetchState,
    errorMessage,
    rateLimitedUntil,
    isPolling,
    refresh,
  } = useBookingStatusPoll({
    reference,
    locale,
    enabled: Boolean(reference),
  });

  const { ticket, loading: ticketLoading } = useBookingTicket(booking, locale);
  const paymentRetry = usePaymentRetry(locale);
  const focusRef = useRef<HTMLDivElement>(null);
  const lastBucket = useRef<string | null>(null);
  const [mockCheckoutUrl, setMockCheckoutUrl] = useState<string | null>(null);

  const bucket = booking ? classifyBooking(booking) : "waiting";
  const showQr = booking ? canShowBookingQr(booking) : false;
  const preparingTicket =
    booking != null &&
    bucket === "confirmed_preparing_ticket" &&
    !isTicketMetadataReady(booking);

  useEffect(() => {
    const url = peekMockCheckoutUrl();
    if (url) setMockCheckoutUrl(url);
  }, []);

  useEffect(() => {
    if (!booking) return;
    if (
      bucket === "confirmed_ready" ||
      bucket === "confirmed_preparing_ticket" ||
      bucket === "active_visit"
    ) {
      consumeMockCheckoutUrl();
      setMockCheckoutUrl(null);
    }
  }, [booking, bucket]);

  useEffect(() => {
    if (!booking) return;
    if (lastBucket.current && lastBucket.current !== bucket) {
      focusRef.current?.focus();
    }
    lastBucket.current = bucket;
  }, [booking, bucket]);

  useEffect(() => {
    if (paymentRetry.alreadyPaid) {
      void refresh();
    }
  }, [paymentRetry.alreadyPaid, refresh]);

  if (!reference) {
    return (
      <StatusShell>
        <BookingStatusError
          locale={locale}
          title={t(locale, "referenceRequired")}
          body={t(locale, "referenceRequiredBody")}
          secondaryHref="/book-now"
        />
      </StatusShell>
    );
  }

  if (fetchState === "loading" && !booking) {
    return (
      <StatusShell>
        <BookingStatusLoading locale={locale} />
      </StatusShell>
    );
  }

  if (fetchState === "not_found") {
    return (
      <StatusShell>
        <BookingStatusError
          locale={locale}
          title={t(locale, "notFound")}
          body={errorMessage || undefined}
          secondaryHref="/book-now"
        />
      </StatusShell>
    );
  }

  if (fetchState === "error" && !booking) {
    return (
      <StatusShell>
        <BookingStatusError
          locale={locale}
          title={t(locale, "networkTrouble")}
          body={errorMessage || undefined}
          onRetry={() => void refresh()}
        />
      </StatusShell>
    );
  }

  if (!booking) {
    return (
      <StatusShell>
        <BookingStatusLoading locale={locale} />
      </StatusShell>
    );
  }

  const liveMessage =
    rateLimitedUntil && Date.now() < rateLimitedUntil
      ? t(locale, "rateLimited")
      : errorMessage && fetchState === "ready"
        ? t(locale, "networkTrouble")
        : preparingTicket
          ? t(locale, "preparingTicket")
          : isPolling
            ? t(locale, "confirming")
            : null;

  const retryAllowed = canRetryPayment(booking);

  return (
    <StatusShell>
      <div ref={focusRef} tabIndex={-1} className="outline-none">
        <BookingStatusHero
          bucket={bucket}
          status={booking.status}
          locale={locale}
          liveMessage={liveMessage}
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <BookingDetails booking={booking} locale={locale} />

          <div className="space-y-4">
            {showQr ? (
              <DigitalTicket
                booking={booking}
                ticket={ticket}
                locale={locale}
              />
            ) : preparingTicket || ticketLoading ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  padding: "28px 22px",
                  borderRadius: "16px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(248,242,231,0.7)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                {t(locale, "preparingTicket")}
              </div>
            ) : null}

            {paymentRetry.error && (
              <p
                role="alert"
                style={{ color: "rgba(240,170,140,0.95)", fontSize: "13px" }}
              >
                {paymentRetry.error}
              </p>
            )}

            {mockCheckoutUrl &&
              isMockPaymentUrl(mockCheckoutUrl) &&
              retryAllowed && (
                <a
                  href={mockCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    consumeMockCheckoutUrl();
                  }}
                  style={{
                    ...primaryBtnStyle,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {locale === "ar" ? "إكمال الدفع" : "Complete payment"}
                </a>
              )}

            <div className="flex flex-wrap gap-3 pt-2">
              {(bucket === "waiting" ||
                bucket === "confirmed_preparing_ticket" ||
                Boolean(errorMessage)) && (
                <button
                  type="button"
                  onClick={() => void refresh()}
                  style={secondaryBtnStyle}
                >
                  {t(locale, "refresh")}
                </button>
              )}

              {retryAllowed && (
                <button
                  type="button"
                  disabled={paymentRetry.busy}
                  onClick={() => void paymentRetry.retry(booking)}
                  style={primaryBtnStyle}
                >
                  {paymentRetry.busy
                    ? t(locale, "preparingPayment")
                    : t(locale, "retryPayment")}
                </button>
              )}

              {(bucket === "expired" ||
                bucket === "cancelled" ||
                (bucket === "failed" && !retryAllowed)) && (
                <ActionLink href="/book-now" primary>
                  {t(locale, "startNew")}
                </ActionLink>
              )}

              {(bucket === "confirmed_ready" || bucket === "active_visit") && (
                <>
                  <ActionLink href="/">{t(locale, "backHome")}</ActionLink>
                  <ActionLink href="/book-now" primary>
                    {t(locale, "bookAnother")}
                  </ActionLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </StatusShell>
  );
}

function StatusShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="page-atmosphere"
      style={{ minHeight: "100vh", paddingBottom: "80px" }}
    >
      <section
        className="mx-auto"
        style={{
          maxWidth: "960px",
          padding: "clamp(32px, 6vw, 64px) 24px 0",
        }}
      >
        {children}
      </section>
    </main>
  );
}

const primaryBtnStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "13px 20px",
  borderRadius: "9px",
  border: "none",
  cursor: "pointer",
  background:
    "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))",
  color: "#0D0B08",
};

const secondaryBtnStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.06em",
  padding: "13px 18px",
  borderRadius: "9px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "rgba(248,242,231,0.7)",
  cursor: "pointer",
};
