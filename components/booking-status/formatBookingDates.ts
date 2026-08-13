import type { ApiLocale } from "@/lib/api";

export function formatBookingDate(
  isoDate: string | null | undefined,
  locale: ApiLocale
): string {
  if (!isoDate) return "—";
  // Prefer date-only YYYY-MM-DD without timezone shift
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]);
    const d = Number(dateOnly[3]);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return isoDate;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed));
}

export function formatBookingDateRange(
  from: string | null | undefined,
  to: string | null | undefined,
  locale: ApiLocale
): string {
  const a = formatBookingDate(from, locale);
  const b = formatBookingDate(to, locale);
  if (a === b) return a;
  return `${a} → ${b}`;
}
