"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BookingProductType } from "@/lib/api";
import type { BookingState } from "./types";
import { PRODUCT_OPTIONS } from "./bookingSteps";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepProductProps {
  state: BookingState;
  onSetProductType: (type: BookingProductType) => void;
}

export function StepProduct({ state, onSetProductType }: StepProductProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          fontWeight: 500,
          marginBottom: "10px",
        }}
      >
        Experience
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3.2vw, 38px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          lineHeight: 1.15,
          marginBottom: "12px",
        }}
      >
        How would you like to arrive?
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: 1.7,
          maxWidth: "540px",
          marginBottom: "36px",
        }}
      >
        Choose an overnight Bubble Stay, or a Day Use visit to experience Zalina
        without sleeping under the desert sky.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {PRODUCT_OPTIONS.map((option, index) => {
          const selected = state.productType === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
              onClick={() => onSetProductType(option.id)}
              aria-pressed={selected}
              className="text-left transition-all duration-300"
              style={{
                padding: "28px 24px",
                borderRadius: "16px",
                border: selected
                  ? "1px solid rgba(212,175,55,0.55)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: selected
                  ? "linear-gradient(160deg, rgba(212,175,55,0.12), rgba(255,255,255,0.02))"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                minHeight: "180px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: GOLD,
                }}
              >
                {option.tag}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "26px",
                  color: TEXT_PRIMARY,
                  marginTop: "14px",
                  marginBottom: "10px",
                }}
              >
                {option.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: TEXT_MUTED,
                  lineHeight: 1.65,
                }}
              >
                {option.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
