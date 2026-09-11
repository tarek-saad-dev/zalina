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
  // null (hydration) or true → no fade-from-zero; otherwise cards stay opacity:0 forever
  const enterFrom =
    reduceMotion === false ? { opacity: 0, y: 12 } : false;

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
        Choose an overnight Bubble Stay, or a Day Use visit to experience
        Zalina’s cultural village in Luxor.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {PRODUCT_OPTIONS.map((option, index) => {
          const selected = state.productType === option.id;
          const comingSoon = Boolean(option.comingSoon);

          if (comingSoon) {
            return (
              <motion.div
                key={option.id}
                initial={enterFrom}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion === false ? index * 0.06 : 0,
                }}
                aria-disabled="true"
                className="text-left relative"
                style={{
                  padding: "28px 24px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.015)",
                  minHeight: "180px",
                  opacity: 0.72,
                  cursor: "not-allowed",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "18px",
                    right: "18px",
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#0D0B08",
                    background: "rgba(212,175,55,0.92)",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontWeight: 600,
                  }}
                >
                  Coming Soon
                </span>
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
              </motion.div>
            );
          }

          return (
            <motion.button
              key={option.id}
              type="button"
              initial={enterFrom}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: reduceMotion === false ? index * 0.06 : 0,
              }}
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
