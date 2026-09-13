/** Calendar date helpers — calendar days only, no Date-parse timezone shifts. */

export type Ymd = string; // YYYY-MM-DD

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toYmd(year: number, month: number, day: number): Ymd {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseYmd(ymd: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Validate real calendar day via local noon construction (avoids UTC midnight shift).
  const probe = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function todayYmdLocal(now = new Date()): Ymd {
  return toYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function compareYmd(a: Ymd, b: Ymd): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isYmdBefore(a: Ymd, b: Ymd): boolean {
  return compareYmd(a, b) < 0;
}

/** Local weekday: 0 = Sunday … 6 = Saturday */
export function weekdayLocal(ymd: Ymd): number | null {
  const parts = parseYmd(ymd);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0).getDay();
}

/** Marketing premium days (Fri/Sat) — visual hint only, not pricing. */
export function isLikelyPremiumWeekday(ymd: Ymd): boolean {
  const day = weekdayLocal(ymd);
  return day === 5 || day === 6;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0, 12, 0, 0, 0).getDate();
}

export function formatYmdDisplay(
  ymd: Ymd,
  locale: "en" | "ar"
): string {
  const parts = parseYmd(ymd);
  if (!parts) return ymd;
  const date = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatMonthYear(
  year: number,
  month: number,
  locale: "en" | "ar"
): string {
  const date = new Date(year, month - 1, 1, 12, 0, 0, 0);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}
