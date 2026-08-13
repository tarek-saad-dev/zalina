"use client";

import type { ApiBooking, ApiLocale } from "@/lib/api";
import { formatMoneyAmount, parseMoney } from "@/components/book-now/bookingMedia";
import {
  bookingStatusLabel,
  paymentStatusLabel,
  productTypeLabel,
  t,
} from "./bookingStatusCopy";
import { formatBookingDateRange } from "./formatBookingDates";
import { localizedName } from "@/components/book-now/bookingMedia";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT = "#F8F2E7";
const MUTED = "rgba(248,242,231,0.55)";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between gap-4 py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: "12px", color: MUTED }}>{label}</span>
      <span style={{ fontSize: "13px", color: TEXT, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

interface BookingDetailsProps {
  booking: ApiBooking;
  locale: ApiLocale;
}

export function BookingDetails({ booking, locale }: BookingDetailsProps) {
  const amount = parseMoney(booking.total);
  const total =
    amount == null
      ? booking.total
      : formatMoneyAmount(amount, booking.currency);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px 22px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: GOLD,
          marginBottom: "12px",
        }}
      >
        {productTypeLabel(booking.product_type, locale)}
      </p>
      <Row
        label={t(locale, "bookingReference")}
        value={booking.booking_reference}
      />
      <Row label={t(locale, "bookingCode")} value={booking.booking_code} />
      <Row
        label={locale === "ar" ? "الحالة" : "Status"}
        value={bookingStatusLabel(booking.status, locale)}
      />
      {booking.operational_status ? (
        <Row
          label={locale === "ar" ? "التشغيل" : "Operations"}
          value={booking.operational_status}
        />
      ) : null}
      <Row
        label={t(locale, "payment")}
        value={paymentStatusLabel(booking.payment?.status, locale)}
      />
      <Row label={t(locale, "guests")} value={String(booking.guests)} />
      <Row
        label={t(locale, "valid")}
        value={formatBookingDateRange(
          booking.valid_from,
          booking.valid_to,
          locale
        )}
      />
      <Row label={t(locale, "total")} value={total} />

      {booking.product_type === "bubble_stay" && booking.bubbles.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "8px",
            }}
          >
            {locale === "ar" ? "الفقاعات" : "Bubbles"}
          </p>
          {booking.bubbles.map((bubble) => (
            <div key={bubble.id} style={{ marginBottom: "12px" }}>
              <p
                style={{
                  fontSize: "14px",
                  color: TEXT,
                  fontWeight: 500,
                  marginTop: "8px",
                }}
              >
                {localizedName(bubble, locale)}
              </p>
              {bubble.accommodation_type && (
                <Row
                  label={locale === "ar" ? "النوع" : "Type"}
                  value={localizedName(bubble.accommodation_type, locale)}
                />
              )}
              <Row
                label={t(locale, "guests")}
                value={String(bubble.guests)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
