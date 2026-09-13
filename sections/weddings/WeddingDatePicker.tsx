"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { ApiLocale } from "@/lib/api";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import {
  daysInMonth,
  formatMonthYear,
  formatYmdDisplay,
  isLikelyPremiumWeekday,
  isYmdBefore,
  parseYmd,
  todayYmdLocal,
  toYmd,
  type Ymd,
} from "./weddingDate";

interface WeddingDatePickerProps {
  id: string;
  value: Ymd;
  onChange: (next: Ymd) => void;
  locale: ApiLocale;
  required?: boolean;
  fieldStyle: CSSProperties;
}

const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_AR = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

export function WeddingDatePicker({
  id,
  value,
  onChange,
  locale,
  required,
  fieldStyle,
}: WeddingDatePickerProps) {
  const labelId = useId();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const today = todayYmdLocal();
  const selected = parseYmd(value);
  const initial = selected ?? parseYmd(today)!;
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  const weekdayLabels = locale === "ar" ? WEEKDAYS_AR : WEEKDAYS_EN;
  const firstWeekday = new Date(viewYear, viewMonth - 1, 1, 12, 0, 0, 0).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (Ymd | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) {
    cells.push(toYmd(viewYear, viewMonth, day));
  }

  function shiftMonth(delta: number) {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1, 12, 0, 0, 0);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
  }

  function selectDay(ymd: Ymd) {
    if (isYmdBefore(ymd, today)) return;
    onChange(ymd);
    setOpen(false);
  }

  const display = value
    ? formatYmdDisplay(value, locale)
    : pickLocale(locale, WEDDING_COPY.planDatePlaceholder);

  const panelStyle: CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
        padding: "20px 16px calc(20px + env(safe-area-inset-bottom))",
        borderTop: "1px solid rgba(212,175,55,0.28)",
        borderRadius: "16px 16px 0 0",
        background:
          "linear-gradient(180deg, rgba(28,22,14,0.98), rgba(10,8,6,0.99))",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.45)",
      }
    : {
        position: "absolute",
        top: "calc(100% + 8px)",
        insetInlineStart: 0,
        zIndex: 40,
        width: "min(100%, 320px)",
        padding: "16px",
        border: "1px solid rgba(212,175,55,0.28)",
        borderRadius: "4px",
        background:
          "linear-gradient(180deg, rgba(28,22,14,0.98), rgba(10,8,6,0.99))",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
      };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        className="wedding-plan-field text-start"
        style={{
          ...fieldStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          style={{
            color: value ? "#F8F2E7" : "rgba(248,242,231,0.45)",
            fontSize: value ? "15px" : "14px",
          }}
        >
          {display}
        </span>
        <span aria-hidden style={{ color: "rgba(212,175,55,0.85)" }}>
          ▾
        </span>
      </button>

      {/* Keep a hidden required input for form semantics / autofill parity */}
      <input
        type="text"
        name="wedding_date"
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 1,
          height: 1,
        }}
      />

      {open ? (
        <>
          {isMobile ? (
            <button
              type="button"
              aria-label={pickLocale(locale, WEDDING_COPY.planDateClose)}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 70,
                background: "rgba(0,0,0,0.55)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ) : null}

          <div
            id={panelId}
            role="dialog"
            aria-modal={isMobile ? true : undefined}
            aria-labelledby={labelId}
            style={panelStyle}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                type="button"
                aria-label={pickLocale(locale, WEDDING_COPY.planDatePrevMonth)}
                onClick={() => shiftMonth(-1)}
                className="h-9 w-9 inline-flex items-center justify-center"
                style={{
                  color: "#F8F2E7",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {locale === "ar" ? "›" : "‹"}
              </button>
              <p
                id={labelId}
                className="m-0 text-[14px]"
                style={{
                  color: "#F8F2E7",
                  fontFamily: "var(--font-display)",
                }}
              >
                {formatMonthYear(viewYear, viewMonth, locale)}
              </p>
              <button
                type="button"
                aria-label={pickLocale(locale, WEDDING_COPY.planDateNextMonth)}
                onClick={() => shiftMonth(1)}
                className="h-9 w-9 inline-flex items-center justify-center"
                style={{
                  color: "#F8F2E7",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {locale === "ar" ? "‹" : "›"}
              </button>
            </div>

            <div
              className="grid grid-cols-7 gap-1 mb-2"
              style={{ color: "rgba(248,242,231,0.45)", fontSize: "11px" }}
            >
              {weekdayLabels.map((label) => (
                <span key={label} className="text-center py-1">
                  {label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((ymd, index) => {
                if (!ymd) {
                  return <span key={`e-${index}`} />;
                }
                const disabled = isYmdBefore(ymd, today);
                const selectedDay = ymd === value;
                const premiumHint = isLikelyPremiumWeekday(ymd);
                const parts = parseYmd(ymd)!;

                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(ymd)}
                    aria-label={formatYmdDisplay(ymd, locale)}
                    aria-pressed={selectedDay}
                    className="relative h-10 text-[13px]"
                    style={{
                      borderRadius: "2px",
                      border: selectedDay
                        ? "1px solid rgba(212,175,55,0.75)"
                        : "1px solid transparent",
                      background: selectedDay
                        ? "rgba(212,175,55,0.16)"
                        : "transparent",
                      color: disabled
                        ? "rgba(248,242,231,0.28)"
                        : "#F8F2E7",
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {parts.day}
                    {premiumHint && !disabled ? (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "rgba(212,175,55,0.85)",
                        }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <p
              className="m-0 mt-4 text-[11px] leading-relaxed"
              style={{ color: "rgba(212,175,55,0.8)" }}
            >
              {pickLocale(locale, WEDDING_COPY.planDatePremiumHint)}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
