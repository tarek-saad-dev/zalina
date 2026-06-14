"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { BookingState, JourneyType } from "./types";
import { JOURNEY_OPTIONS } from "./mockData";

interface Step1JourneyProps {
  state: BookingState;
  onSetJourneyType: (type: JourneyType) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

export function Step1Journey({ state, onSetJourneyType }: Step1JourneyProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-9">
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
          Step 1 — Journey
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 3.2vw, 38px)",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            lineHeight: 1.15,
            marginBottom: "12px",
            letterSpacing: "-0.01em",
          }}
        >
          How would you like to<br className="hidden sm:block" /> experience Zalina?
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: TEXT_MUTED,
            lineHeight: 1.75,
            maxWidth: "500px",
          }}
        >
          Choose the beginning of your Arabian night. You can refine every
          detail in the next steps.
        </p>
      </div>

      {/* Journey cards */}
      <div className="flex flex-col gap-4">
        {JOURNEY_OPTIONS.map((option, index) => {
          const isSelected = state.journeyType === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: "easeOut", delay: index * 0.09 }}
              onClick={() => onSetJourneyType(option.id as JourneyType)}
              className="text-left w-full"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${option.gradientFrom} 0%, ${option.gradientTo} 100%)`
                  : "rgba(255,255,255,0.022)",
                border: isSelected
                  ? "1px solid rgba(212,175,55,0.42)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "0",
                cursor: "pointer",
                outline: "none",
                overflow: "hidden",
                boxShadow: isSelected
                  ? "0 4px 32px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.08)"
                  : "none",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
              }}
              aria-pressed={isSelected}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: "3px",
                  background: isSelected
                    ? `linear-gradient(90deg, transparent, ${option.accentColor}, transparent)`
                    : "transparent",
                  transition: "background 0.3s ease",
                }}
              />

              <div className="flex items-start gap-5 p-6">
                {/* Left: icon block */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: isSelected
                      ? "rgba(212,175,55,0.10)"
                      : "rgba(255,255,255,0.04)",
                    border: isSelected
                      ? "1px solid rgba(212,175,55,0.28)"
                      : "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                      color: isSelected ? option.accentColor : "rgba(248,242,231,0.45)",
                      transition: "color 0.25s ease",
                      fontFamily: "serif",
                    }}
                  >
                    {option.id === "stay" ? "🏕" : option.id === "evening" ? "🌙" : "✦"}
                  </span>
                </div>

                {/* Middle: text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: isSelected ? GOLD : "rgba(248,242,231,0.32)",
                        fontWeight: 500,
                        transition: "color 0.25s ease",
                      }}
                    >
                      {option.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: 400,
                      color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.78)",
                      lineHeight: 1.25,
                      marginBottom: "8px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {option.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: isSelected
                        ? "rgba(248,242,231,0.62)"
                        : "rgba(248,242,231,0.36)",
                      lineHeight: 1.68,
                      marginBottom: "12px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {option.description}
                  </p>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5">
                    {option.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "10px",
                          letterSpacing: "0.08em",
                          color: isSelected
                            ? "rgba(212,175,55,0.72)"
                            : "rgba(248,242,231,0.28)",
                          border: isSelected
                            ? "1px solid rgba(212,175,55,0.18)"
                            : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "4px",
                          padding: "3px 8px",
                          background: isSelected
                            ? "rgba(212,175,55,0.04)"
                            : "rgba(255,255,255,0.02)",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: selection indicator */}
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "1.5px solid rgba(212,175,55,0.8)"
                      : "1.5px solid rgba(248,242,231,0.14)",
                    background: isSelected
                      ? "rgba(212,175,55,0.14)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                    transition: "all 0.25s ease",
                  }}
                >
                  {isSelected && (
                    <Check size={12} color="rgba(212,175,55,0.95)" strokeWidth={2.5} />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
