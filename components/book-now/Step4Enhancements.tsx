"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { BookingState, EnhancementAddOn, EnhancementCategory } from "./types";
import { ENHANCEMENT_ADDONS } from "./mockData";

interface Step4EnhancementsProps {
  state: BookingState;
  onToggleEnhancement: (id: string) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.52)";
const TEXT_DIM = "rgba(248,242,231,0.28)";

const CATEGORY_ORDER: EnhancementCategory[] = [
  "Arrival",
  "Dining",
  "Atmosphere",
  "Memories",
];

const CATEGORY_ICONS: Record<EnhancementCategory, string> = {
  Arrival: "✦",
  Dining: "◈",
  Atmosphere: "◉",
  Memories: "◎",
};

function getGuestCount(state: BookingState): number {
  if (state.journeyType === "evening") return state.participants;
  if (state.journeyType === "private") return state.estimatedGuests;
  return state.guests;
}

function formatPrice(addon: EnhancementAddOn, guestCount: number): string {
  if (addon.pricingType === "per-guest") {
    return `EGP ${(addon.price * guestCount).toLocaleString()} (EGP ${addon.price.toLocaleString()} / guest)`;
  }
  return `EGP ${addon.price.toLocaleString()}`;
}

function EnhancementCard({
  addon,
  guestCount,
  onToggle,
}: {
  addon: EnhancementAddOn;
  guestCount: number;
  onToggle: () => void;
}) {
  const isSelected = addon.selected;
  const priceStr =
    addon.pricingType === "per-guest"
      ? `EGP ${addon.price.toLocaleString()} / guest`
      : `EGP ${addon.price.toLocaleString()}`;

  return (
    <button
      onClick={onToggle}
      aria-pressed={isSelected}
      className="text-left w-full transition-all duration-200"
      style={{
        background: isSelected ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
        border: isSelected
          ? "1px solid rgba(212,175,55,0.38)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "16px 18px",
        cursor: "pointer",
        outline: "none",
        boxShadow: isSelected ? "0 0 20px rgba(212,175,55,0.07)" : "none",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.78)",
                lineHeight: 1.3,
              }}
            >
              {addon.name}
            </p>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: TEXT_DIM,
              lineHeight: 1.6,
              marginBottom: "8px",
            }}
          >
            {addon.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: isSelected ? GOLD : GOLD_SOFT,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {priceStr}
            </span>
            {addon.pricingType === "per-guest" && (
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: isSelected ? TEXT_MUTED : TEXT_DIM,
                  fontStyle: "italic",
                }}
              >
                × {guestCount} = EGP {(addon.price * guestCount).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Checkbox */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            border: isSelected
              ? "1.5px solid rgba(212,175,55,0.7)"
              : "1.5px solid rgba(248,242,231,0.15)",
            background: isSelected ? "rgba(212,175,55,0.14)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
            transition: "all 0.18s ease",
          }}
        >
          {isSelected && <Check size={12} color={GOLD} strokeWidth={2.5} />}
        </div>
      </div>
    </button>
  );
}

export function Step4Enhancements({
  state,
  onToggleEnhancement,
}: Step4EnhancementsProps) {
  const isPrivate = state.isPrivateCustom;
  const guestCount = getGuestCount(state);
  const selectedCount = state.enhancements.filter((e) => e.selected).length;

  const title = isPrivate ? "Personalize the Occasion" : "Personalize the Night";
  const subtitle = isPrivate
    ? "Select optional details to help the concierge team understand the atmosphere you want."
    : "Enhance your Zalina journey with curated details, private touches, and atmosphere.";

  const groupedByCategory = CATEGORY_ORDER.reduce<
    Record<EnhancementCategory, EnhancementAddOn[]>
  >(
    (acc, cat) => {
      acc[cat] = state.enhancements.filter((e) => e.category === cat);
      return acc;
    },
    { Arrival: [], Dining: [], Atmosphere: [], Memories: [] }
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={14} color={GOLD} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 500,
            }}
          >
            Step 4 — Enhancements
          </p>
        </div>
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

      {/* Selected count bar */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: "10px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: TEXT_PRIMARY,
              fontWeight: 500,
            }}
          >
            {selectedCount} enhancement{selectedCount !== 1 ? "s" : ""} selected
          </span>
          {!isPrivate && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: GOLD,
                fontWeight: 600,
              }}
            >
              +EGP {state.addOnsTotal.toLocaleString()}
            </span>
          )}
          {isPrivate && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: TEXT_MUTED,
                fontStyle: "italic",
              }}
            >
              Added to proposal
            </span>
          )}
        </motion.div>
      )}

      {/* Category sections */}
      <div className="flex flex-col gap-8">
        {CATEGORY_ORDER.map((category, catIdx) => {
          const items = groupedByCategory[category];
          if (items.length === 0) return null;
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: catIdx * 0.06 }}
            >
              {/* Category heading */}
              <div
                className="flex items-center gap-3 mb-4"
                style={{
                  borderBottom: "1px solid rgba(212,175,55,0.08)",
                  paddingBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "serif",
                    fontSize: "14px",
                    color: GOLD_SOFT,
                  }}
                >
                  {CATEGORY_ICONS[category]}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: GOLD_SOFT,
                    fontWeight: 500,
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((addon) => (
                  <EnhancementCard
                    key={addon.id}
                    addon={addon}
                    guestCount={guestCount}
                    onToggle={() => onToggleEnhancement(addon.id)}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Private concierge note */}
      {isPrivate && (
        <div
          className="mt-8"
          style={{
            background: "rgba(212,175,55,0.03)",
            border: "1px solid rgba(212,175,55,0.12)",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "rgba(248,242,231,0.45)",
              lineHeight: 1.72,
            }}
          >
            Selected enhancements are treated as preferences and will be included
            in your tailored Zalina concierge proposal. Pricing will be confirmed
            separately.
          </p>
        </div>
      )}

      {/* Skip note */}
      <p
        className="mt-6 text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: TEXT_DIM,
          letterSpacing: "0.04em",
        }}
      >
        Enhancements are optional — you can continue without selecting any.
      </p>
    </div>
  );
}
