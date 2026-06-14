"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Users, Info } from "lucide-react";
import type { BookingState, StayOption, ExperienceOption, OccasionOption } from "./types";
import { STAY_OPTIONS, EXPERIENCE_OPTIONS, OCCASION_OPTIONS } from "./mockData";

interface Step2SelectionProps {
  state: BookingState;
  onSelectItem: (id: string, title: string, price: number, maxGuests?: number) => void;
  onSelectOccasion: (id: string) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";
const TEXT_DIM = "rgba(248,242,231,0.32)";

function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(212,175,55,0.85)",
        background: "rgba(212,175,55,0.08)",
        border: "1px solid rgba(212,175,55,0.22)",
        borderRadius: "4px",
        padding: "3px 8px",
      }}
    >
      {label}
    </span>
  );
}

function MetaPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} color={TEXT_DIM} />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: TEXT_DIM,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Stay Cards ─────────────────────────────────────────── */
function StayCards({
  state,
  onSelect,
}: {
  state: BookingState;
  onSelect: (id: string, title: string, price: number, maxGuests?: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {STAY_OPTIONS.map((opt: StayOption, index: number) => {
        const isSelected = state.selectedItem === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.46, ease: "easeOut", delay: index * 0.08 }}
            onClick={() => onSelect(opt.id, opt.title, opt.price, opt.maxGuests)}
            className="text-left w-full"
            style={{
              background: isSelected
                ? `linear-gradient(160deg, ${opt.gradientFrom} 0%, ${opt.gradientTo} 100%)`
                : "rgba(255,255,255,0.022)",
              border: isSelected
                ? "1px solid rgba(212,175,55,0.40)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer",
              outline: "none",
              boxShadow: isSelected
                ? "0 4px 30px rgba(212,175,55,0.09), inset 0 1px 0 rgba(212,175,55,0.07)"
                : "none",
              transition: "border-color 0.25s ease, box-shadow 0.25s ease",
            }}
            aria-pressed={isSelected}
          >
            {/* Visual panel */}
            <div
              style={{
                height: "90px",
                background: `linear-gradient(135deg, ${opt.gradientFrom} 0%, rgba(10,7,4,1) 100%)`,
                borderBottom: isSelected
                  ? "1px solid rgba(212,175,55,0.14)"
                  : "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "flex-end",
                padding: "14px 20px",
                position: "relative",
              }}
            >
              {/* Subtle diagonal glow */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isSelected
                    ? "radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.07) 0%, transparent 60%)"
                    : "none",
                  pointerEvents: "none",
                }}
              />
              <Badge label={opt.badge} />
            </div>

            {/* Card body */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: 400,
                      color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.80)",
                      lineHeight: 1.2,
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: isSelected ? "rgba(248,242,231,0.60)" : TEXT_DIM,
                      lineHeight: 1.7,
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.description}
                  </p>
                </div>
                {/* Selection dot */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "1.5px solid rgba(212,175,55,0.8)"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    background: isSelected ? "rgba(212,175,55,0.14)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  {isSelected && (
                    <Check size={11} color={GOLD} strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-4">
                  <MetaPill icon={MapPin} label={opt.zone} />
                  <MetaPill icon={Users} label={`Up to ${opt.maxGuests}`} />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "10px",
                      color: TEXT_DIM,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "block",
                      textAlign: "right",
                      marginBottom: "1px",
                    }}
                  >
                    Starting from
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: isSelected ? GOLD : GOLD_SOFT,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {opt.priceLabel}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Experience Cards ───────────────────────────────────── */
function ExperienceCards({
  state,
  onSelect,
}: {
  state: BookingState;
  onSelect: (id: string, title: string, price: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {EXPERIENCE_OPTIONS.map((opt: ExperienceOption, index: number) => {
        const isSelected = state.selectedItem === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.46, ease: "easeOut", delay: index * 0.08 }}
            onClick={() => onSelect(opt.id, opt.title, opt.price)}
            className="text-left w-full"
            style={{
              background: isSelected
                ? `linear-gradient(160deg, ${opt.gradientFrom} 0%, ${opt.gradientTo} 100%)`
                : "rgba(255,255,255,0.022)",
              border: isSelected
                ? "1px solid rgba(212,175,55,0.40)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer",
              outline: "none",
              boxShadow: isSelected
                ? "0 4px 30px rgba(212,175,55,0.09), inset 0 1px 0 rgba(212,175,55,0.07)"
                : "none",
              transition: "border-color 0.25s ease, box-shadow 0.25s ease",
            }}
            aria-pressed={isSelected}
          >
            {/* Visual panel */}
            <div
              style={{
                height: "80px",
                background: `linear-gradient(135deg, ${opt.gradientFrom} 0%, rgba(8,6,4,1) 100%)`,
                borderBottom: isSelected
                  ? "1px solid rgba(212,175,55,0.12)"
                  : "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "flex-end",
                padding: "12px 20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isSelected
                    ? "radial-gradient(ellipse at 80% 100%, rgba(212,175,55,0.06) 0%, transparent 55%)"
                    : "none",
                  pointerEvents: "none",
                }}
              />
              <Badge label={opt.badge} />
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: 400,
                      color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.80)",
                      lineHeight: 1.2,
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: isSelected ? "rgba(248,242,231,0.60)" : TEXT_DIM,
                      lineHeight: 1.7,
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.description}
                  </p>
                </div>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "1.5px solid rgba(212,175,55,0.8)"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    background: isSelected ? "rgba(212,175,55,0.14)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  {isSelected && (
                    <Check size={11} color={GOLD} strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-4">
                  <MetaPill icon={MapPin} label={opt.zone} />
                  <MetaPill icon={Users} label={`${opt.minGuests}+ guests`} />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "10px",
                      color: TEXT_DIM,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "block",
                      textAlign: "right",
                      marginBottom: "1px",
                    }}
                  >
                    From
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: isSelected ? GOLD : GOLD_SOFT,
                    }}
                  >
                    {opt.priceLabel}
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        color: TEXT_DIM,
                        marginLeft: "4px",
                      }}
                    >
                      / person
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Occasion Cards (Private) ───────────────────────────── */
function OccasionCards({
  state,
  onSelect,
}: {
  state: BookingState;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {OCCASION_OPTIONS.map((opt: OccasionOption, index: number) => {
          const isSelected = state.selectedOccasionId === opt.id;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut", delay: index * 0.07 }}
              onClick={() => onSelect(opt.id)}
              className="text-left"
              style={{
                background: isSelected
                  ? "rgba(212,175,55,0.06)"
                  : "rgba(255,255,255,0.022)",
                border: isSelected
                  ? "1px solid rgba(212,175,55,0.40)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "22px 20px",
                cursor: "pointer",
                outline: "none",
                boxShadow: isSelected
                  ? "0 4px 24px rgba(212,175,55,0.08)"
                  : "none",
                transition: "all 0.25s ease",
              }}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    style={{
                      fontFamily: "serif",
                      fontSize: "20px",
                      color: isSelected ? GOLD : "rgba(248,242,231,0.35)",
                      marginBottom: "10px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "17px",
                      fontWeight: 400,
                      color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.75)",
                      lineHeight: 1.25,
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: isSelected ? "rgba(248,242,231,0.55)" : TEXT_DIM,
                      lineHeight: 1.65,
                      transition: "color 0.25s ease",
                    }}
                  >
                    {opt.description}
                  </p>
                </div>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "1.5px solid rgba(212,175,55,0.8)"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    background: isSelected ? "rgba(212,175,55,0.14)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  {isSelected && (
                    <Check size={10} color={GOLD} strokeWidth={2.5} />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Concierge note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.36 }}
        style={{
          background: "rgba(212,175,55,0.04)",
          border: "1px solid rgba(212,175,55,0.16)",
          borderRadius: "12px",
          padding: "18px 20px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <Info size={15} color="rgba(212,175,55,0.65)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "rgba(248,242,231,0.55)",
            lineHeight: 1.72,
          }}
        >
          Private occasions require a tailored proposal. Our concierge team will
          contact you to refine capacity, setup, entertainment, dining, and
          schedule.
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Root Step 2 Export ─────────────────────────────────── */
export function Step2Selection({ state, onSelectItem, onSelectOccasion }: Step2SelectionProps) {
  const isPrivate = state.journeyType === "private";
  const isStay = state.journeyType === "stay";

  const title = isPrivate
    ? "Tell Us About Your Occasion"
    : isStay
    ? "Choose Your Stay"
    : "Choose Your Experience";

  const subtitle = isPrivate
    ? "Private celebrations are handled by the Zalina concierge team for a more tailored arrangement."
    : isStay
    ? "Select the setting that matches the night you want to create."
    : "Select a curated evening experience. You can enhance it later with add-ons.";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
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
          Step 2 — {isPrivate ? "Occasion" : isStay ? "Stay" : "Experience"}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            lineHeight: 1.15,
            marginBottom: "10px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: TEXT_MUTED,
            lineHeight: 1.72,
            maxWidth: "500px",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Conditional content */}
      {isPrivate ? (
        <OccasionCards state={state} onSelect={onSelectOccasion} />
      ) : isStay ? (
        <StayCards state={state} onSelect={onSelectItem} />
      ) : (
        <ExperienceCards state={state} onSelect={onSelectItem} />
      )}
    </div>
  );
}
