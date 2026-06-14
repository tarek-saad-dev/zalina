"use client";

import { Minus, Plus } from "lucide-react";

interface GuestSelectorProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
  onChange: (n: number) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.45)";

export function GuestSelector({
  value,
  min = 1,
  max,
  label = "Guests",
  sublabel,
  onChange,
}: GuestSelectorProps) {
  const atMin = value <= min;
  const atMax = max != null ? value >= max : false;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      {/* Label */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 500,
            color: TEXT_PRIMARY,
            marginBottom: sublabel ? "3px" : "0",
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: TEXT_MUTED,
              letterSpacing: "0.03em",
            }}
          >
            {sublabel}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(value - 1)}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: atMin
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(212,175,55,0.30)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: atMin ? "not-allowed" : "pointer",
            color: atMin ? "rgba(248,242,231,0.18)" : GOLD,
            transition: "all 0.18s ease",
          }}
        >
          <Minus size={14} strokeWidth={2} />
        </button>

        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            minWidth: "32px",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          {value}
        </span>

        <button
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          aria-label={`Increase ${label}`}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: atMax
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(212,175,55,0.30)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: atMax ? "not-allowed" : "pointer",
            color: atMax ? "rgba(248,242,231,0.18)" : GOLD,
            transition: "all 0.18s ease",
          }}
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
