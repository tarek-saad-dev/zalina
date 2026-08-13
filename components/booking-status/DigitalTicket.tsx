"use client";

import type { ApiBooking, ApiLocale, BookingTicketLookup } from "@/lib/api";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "@/components/book-now/bookingMedia";
import { BookingQr } from "./BookingQr";
import { formatBookingDateRange } from "./formatBookingDates";
import { productTypeLabel, t } from "./bookingStatusCopy";

const GOLD = "rgba(212,175,55,0.92)";
const TEXT = "#F8F2E7";
const MUTED = "rgba(248,242,231,0.58)";

interface DigitalTicketProps {
  booking: ApiBooking;
  ticket: BookingTicketLookup | null;
  locale: ApiLocale;
}

/**
 * One booking → one digital ticket → one QR (booking_code).
 * Only loaded from the booking status route (not /book-now).
 */
export function DigitalTicket({ booking, ticket, locale }: DigitalTicketProps) {
  const bubbles =
    ticket?.bubbles?.length ? ticket.bubbles : booking.bubbles;
  const guests = ticket?.guests ?? booking.guests;
  const validFrom = ticket?.valid_from ?? booking.valid_from;
  const validTo = ticket?.valid_to ?? booking.valid_to;
  const amount = parseMoney(ticket?.total ?? booking.total);
  const currency = ticket?.currency ?? booking.currency;
  const totalLabel =
    amount == null
      ? ticket?.total ?? booking.total
      : formatMoneyAmount(amount, currency);

  return (
    <article
      aria-label={t(locale, "viewTicket")}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        border: "1px solid rgba(212,175,55,0.28)",
        background:
          "linear-gradient(160deg, rgba(28,22,14,0.96) 0%, rgba(12,9,6,0.98) 55%, rgba(18,14,10,0.96) 100%)",
        boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
        padding: "clamp(22px, 4vw, 32px)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 80% 0%, rgba(212,175,55,0.12), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: GOLD,
            marginBottom: "8px",
          }}
        >
          Zalina Arabian Village
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 400,
            color: TEXT,
            marginBottom: "6px",
          }}
        >
          {productTypeLabel(booking.product_type, locale)}
        </h3>
        <p style={{ fontSize: "14px", color: MUTED, marginBottom: "22px" }}>
          {formatBookingDateRange(validFrom, validTo, locale)}
          {" · "}
          {guests} {t(locale, "guests").toLowerCase()}
        </p>

        <div
          className="flex flex-col md:flex-row gap-8 md:items-start"
        >
          <div className="flex flex-col items-center md:items-start gap-3">
            <BookingQr
              bookingCode={booking.booking_code}
              label={t(locale, "qrLabel")}
              size={220}
            />
            <div style={{ textAlign: "center" }} className="md:text-left w-full">
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {t(locale, "bookingCode")}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(18px, 3vw, 22px)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: TEXT,
                  marginTop: "4px",
                }}
              >
                {booking.booking_code}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "13px", color: MUTED, marginBottom: "10px" }}>
              {t(locale, "total")}:{" "}
              <span style={{ color: TEXT, fontWeight: 600 }}>{totalLabel}</span>
            </p>

            {booking.product_type === "bubble_stay" && (
              <ul className="space-y-4" style={{ listStyle: "none", padding: 0 }}>
                {bubbles.map((bubble) => (
                  <li
                    key={bubble.id}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        color: TEXT,
                        fontWeight: 500,
                      }}
                    >
                      {localizedName(bubble, locale)}
                    </p>
                    {"accommodation_type" in bubble &&
                    bubble.accommodation_type ? (
                      <p style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>
                        {localizedName(bubble.accommodation_type, locale)}
                      </p>
                    ) : null}
                    {"type" in bubble &&
                    typeof bubble.type === "string" &&
                    bubble.type ? (
                      <p style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>
                        {bubble.type}
                      </p>
                    ) : null}
                    <p style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>
                      {bubble.guests} {t(locale, "guests").toLowerCase()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {booking.product_type === "day_use" && (
              <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6 }}>
                {formatBookingDateRange(validFrom, validTo, locale)}
              </p>
            )}

            <p
              style={{
                marginTop: "20px",
                fontSize: "12px",
                color: MUTED,
                lineHeight: 1.6,
              }}
            >
              {t(locale, "emailNotice")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
