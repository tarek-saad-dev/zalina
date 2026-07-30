"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Users, Info } from "lucide-react";
import type {
  BookingState,
  StayOption,
  ExperienceOption,
  OccasionOption,
} from "./types";
import { OCCASION_OPTIONS } from "./mockData";

export type SelectItemMeta = {
  slug?: string;
  apiId?: number;
  experienceApiId?: number;
  experienceZoneId?: number;
};

interface Step2SelectionProps {
  state: BookingState;
  stays: StayOption[];
  experiences: ExperienceOption[];
  onSelectItem: (
    id: string,
    title: string,
    price: number,
    maxGuests?: number,
    meta?: SelectItemMeta
  ) => void;
  onSelectOccasion: (id: string) => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const GOLD_SOFT = "rgba(212,175,55,0.55)";
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

function MetaPill({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
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

function StayCards({
  state,
  stays,
  onSelect,
}: {
  state: BookingState;
  stays: StayOption[];
  onSelect: Step2SelectionProps["onSelectItem"];
}) {
  if (stays.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
        }}
      >
        No stays are available right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {stays.map((opt, index) => {
        const isSelected = state.selectedItem === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0.01, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.46, ease: "easeOut", delay: index * 0.08 }}
            onClick={() =>
              onSelect(opt.id, opt.title, opt.price, opt.maxGuests, {
                slug: opt.slug,
                apiId: opt.apiId,
              })
            }
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
            }}
            aria-pressed={isSelected}
          >
            <div
              style={{
                height: "90px",
                background: `linear-gradient(135deg, ${opt.gradientFrom} 0%, rgba(8,6,4,1) 100%)`,
                borderBottom: isSelected
                  ? "1px solid rgba(212,175,55,0.12)"
                  : "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "flex-end",
                padding: "12px 20px",
              }}
            >
              <Badge label={opt.badge} />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: 400,
                      color: isSelected
                        ? TEXT_PRIMARY
                        : "rgba(248,242,231,0.80)",
                      marginBottom: "6px",
                    }}
                  >
                    {opt.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: isSelected
                        ? "rgba(248,242,231,0.60)"
                        : TEXT_DIM,
                      lineHeight: 1.7,
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
                    background: isSelected
                      ? "rgba(212,175,55,0.14)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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
                  <MetaPill icon={Users} label={`Up to ${opt.maxGuests}`} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                    color: isSelected ? GOLD : GOLD_SOFT,
                  }}
                >
                  {opt.priceLabel}
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function ExperienceCards({
  state,
  experiences,
  onSelect,
}: {
  state: BookingState;
  experiences: ExperienceOption[];
  onSelect: Step2SelectionProps["onSelectItem"];
}) {
  if (experiences.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
        }}
      >
        No experiences are available right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {experiences.map((opt, index) => {
        const isSelected = state.selectedItem === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0.01, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.46, ease: "easeOut", delay: index * 0.08 }}
            onClick={() =>
              onSelect(opt.id, opt.title, opt.price, undefined, {
                apiId: opt.apiId,
                experienceApiId: opt.apiId,
                experienceZoneId: opt.zoneId,
              })
            }
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
            }}
            aria-pressed={isSelected}
          >
            <div
              style={{
                height: "80px",
                background: `linear-gradient(135deg, ${opt.gradientFrom} 0%, rgba(8,6,4,1) 100%)`,
                display: "flex",
                alignItems: "flex-end",
                padding: "12px 20px",
              }}
            >
              <Badge label={opt.badge} />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      color: isSelected
                        ? TEXT_PRIMARY
                        : "rgba(248,242,231,0.80)",
                      marginBottom: "6px",
                    }}
                  >
                    {opt.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: isSelected
                        ? "rgba(248,242,231,0.60)"
                        : TEXT_DIM,
                      lineHeight: 1.7,
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
                    background: isSelected
                      ? "rgba(212,175,55,0.14)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
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
          </motion.button>
        );
      })}
    </div>
  );
}

function OccasionCards({
  state,
  onSelect,
}: {
  state: BookingState;
  onSelect: (id: string) => void;
}) {
  return (
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
                  }}
                >
                  {opt.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "17px",
                    color: isSelected ? TEXT_PRIMARY : "rgba(248,242,231,0.75)",
                    marginBottom: "6px",
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
                  background: isSelected
                    ? "rgba(212,175,55,0.14)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
  );
}

export function Step2Selection({
  state,
  stays,
  experiences,
  onSelectItem,
  onSelectOccasion,
}: Step2SelectionProps) {
  const isPrivate = state.journeyType === "private";
  const isStay = state.journeyType === "stay";

  const title = isPrivate
    ? "Tell Us About Your Occasion"
    : isStay
      ? "Choose Your Stay"
      : "Choose Your Experience";

  const subtitle = isPrivate
    ? "Choose your occasion type, then select a stay so we can create a real booking hold."
    : isStay
      ? "Select the setting that matches the night you want to create."
      : "Select a curated evening experience. A matching stay night is reserved automatically at checkout.";

  return (
    <div>
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
          Step 2 —{" "}
          {isPrivate ? "Occasion & Stay" : isStay ? "Stay" : "Experience"}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 400,
            color: TEXT_PRIMARY,
            lineHeight: 1.15,
            marginBottom: "10px",
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

      {isPrivate ? (
        <div className="flex flex-col gap-8">
          <OccasionCards state={state} onSelect={onSelectOccasion} />
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: GOLD_SOFT,
                marginBottom: "14px",
              }}
            >
              Required stay
            </p>
            <StayCards state={state} stays={stays} onSelect={onSelectItem} />
          </div>
          <div
            style={{
              background: "rgba(212,175,55,0.04)",
              border: "1px solid rgba(212,175,55,0.16)",
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              gap: "14px",
            }}
          >
            <Info
              size={15}
              color="rgba(212,175,55,0.65)"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "rgba(248,242,231,0.55)",
                lineHeight: 1.72,
              }}
            >
              Private occasions still reserve a stay through the booking API.
              Our team will refine capacity and entertainment after payment.
            </p>
          </div>
        </div>
      ) : isStay ? (
        <StayCards state={state} stays={stays} onSelect={onSelectItem} />
      ) : (
        <ExperienceCards
          state={state}
          experiences={experiences}
          onSelect={onSelectItem}
        />
      )}
    </div>
  );
}
