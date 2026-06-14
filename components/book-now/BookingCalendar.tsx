"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMockUnavailableDates } from "./mockData";

interface BookingCalendarProps {
  mode: "single" | "range";
  selectedDate?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  onSelectDate?: (iso: string) => void;
  onSelectRange?: (checkIn: string, checkOut: string | null) => void;
  minDate?: string;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_BG = "rgba(212,175,55,0.14)";
const GOLD_BORDER = "rgba(212,175,55,0.32)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.45)";
const TEXT_DIM = "rgba(248,242,231,0.22)";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  return toLocalISO(date);
}

function isBetween(iso: string, a: string, b: string): boolean {
  return iso > a && iso < b;
}

export function BookingCalendar({
  mode,
  selectedDate,
  checkIn,
  checkOut,
  onSelectDate,
  onSelectRange,
  minDate,
}: BookingCalendarProps) {
  const today = toLocalISO(new Date());
  const effectiveMin = minDate ?? today;

  const unavailable = useMemo(() => getMockUnavailableDates(), []);

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [rangePick, setRangePick] = useState<"in" | "out">(
    checkIn && !checkOut ? "out" : "in"
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const cells: (string | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(toLocalISO(new Date(viewYear, viewMonth, d)));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function handleDay(iso: string) {
    if (iso < effectiveMin || unavailable.has(iso)) return;

    if (mode === "single") {
      onSelectDate?.(iso);
      return;
    }

    // range mode
    if (rangePick === "in" || (checkIn && checkOut)) {
      onSelectRange?.(iso, null);
      setRangePick("out");
    } else {
      // picking checkout
      if (checkIn && iso <= checkIn) {
        // if they clicked before or on checkIn, restart
        onSelectRange?.(iso, null);
        setRangePick("out");
      } else {
        onSelectRange?.(checkIn!, iso);
        setRangePick("in");
      }
    }
  }

  function getDayStyle(iso: string | null): React.CSSProperties {
    if (!iso) return {};
    const isDisabled = iso < effectiveMin || unavailable.has(iso);
    const isToday = iso === today;
    const isCheckIn = iso === checkIn;
    const isCheckOut = iso === checkOut;
    const isSelected = mode === "single" && iso === selectedDate;
    const inRange =
      mode === "range" && checkIn && checkOut
        ? isBetween(iso, checkIn, checkOut)
        : false;

    if (isCheckIn || isCheckOut || isSelected) {
      return {
        background: `linear-gradient(135deg, rgba(212,175,55,0.88) 0%, rgba(232,199,102,0.88) 100%)`,
        color: "#0D0B08",
        fontWeight: 700,
        borderRadius: "8px",
        border: "none",
        boxShadow: "0 2px 12px rgba(212,175,55,0.30)",
      };
    }
    if (inRange) {
      return {
        background: GOLD_BG,
        color: TEXT_PRIMARY,
        borderRadius: "0",
        border: "none",
      };
    }
    if (isDisabled) {
      return {
        color: TEXT_DIM,
        cursor: "not-allowed",
        opacity: 0.4,
        border: "none",
      };
    }
    if (isToday) {
      return {
        border: `1px solid ${GOLD_BORDER}`,
        borderRadius: "8px",
        color: GOLD,
        fontWeight: 600,
      };
    }
    return {
      border: "1px solid transparent",
      color: TEXT_MUTED,
    };
  }

  const rangeStartIso = checkIn ?? undefined;
  const rangeEndIso = checkOut ?? undefined;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
        userSelect: "none",
      }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          style={{
            width: "32px", height: "32px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: TEXT_MUTED,
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            letterSpacing: "0.02em",
          }}
        >
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          aria-label="Next month"
          style={{
            width: "32px", height: "32px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: TEXT_MUTED,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "0.10em",
              color: TEXT_DIM,
              textTransform: "uppercase",
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((iso, idx) => {
          if (!iso) {
            return <div key={`empty-${idx}`} />;
          }
          const isDisabled = iso < effectiveMin || unavailable.has(iso);
          const dayStyle = getDayStyle(iso);
          const isCheckIn = iso === checkIn;
          const isCheckOut = iso === checkOut;
          const inRange =
            mode === "range" && checkIn && checkOut
              ? isBetween(iso, checkIn, checkOut)
              : false;

          // round range ends
          const extraRadius: React.CSSProperties = {};
          if (inRange) {
            if (rangeStartIso && addDays(rangeStartIso, 1) === iso) {
              extraRadius.borderRadius = "0 8px 8px 0";
            }
            if (rangeEndIso && addDays(rangeEndIso, -1) === iso) {
              extraRadius.borderRadius = "8px 0 0 8px";
            }
          }

          return (
            <button
              key={iso}
              onClick={() => handleDay(iso)}
              disabled={isDisabled}
              aria-label={iso}
              aria-pressed={
                mode === "single"
                  ? iso === selectedDate
                  : isCheckIn || isCheckOut
              }
              style={{
                padding: "6px 0",
                minWidth: 0,
                textAlign: "center",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                background: "transparent",
                outline: "none",
                transition: "all 0.15s ease",
                ...dayStyle,
                ...extraRadius,
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isCheckIn && !isCheckOut && !inRange) {
                  e.currentTarget.style.background = "rgba(212,175,55,0.06)";
                  e.currentTarget.style.borderRadius = "8px";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isCheckIn && !isCheckOut && !inRange) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {parseInt(iso.slice(8), 10)}
            </button>
          );
        })}
      </div>

      {/* Range hint */}
      {mode === "range" && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: TEXT_DIM,
            marginTop: "14px",
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          {!checkIn
            ? "Select check-in date"
            : !checkOut
            ? "Now select check-out date"
            : `${checkIn} → ${checkOut}`}
        </p>
      )}
    </div>
  );
}
