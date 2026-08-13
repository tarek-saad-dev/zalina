"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { PhysicalBubble } from "@/lib/api";
import type {
  AccommodationTypeMeta,
  AssignmentMode,
  BookingState,
} from "./types";
import { GuestSelector } from "./GuestSelector";
import {
  localizedDescription,
  localizedName,
  parseMoney,
  resolveAccommodationImage,
  resolveBubbleImage,
} from "./bookingMedia";
import type { AvailabilityEntry } from "./useAvailabilityCache";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepBubblesProps {
  state: BookingState;
  accommodationTypes: AccommodationTypeMeta[];
  locale: "en" | "ar";
  allocatedGuests: number;
  remainingGuests: number;
  getAvailability: (
    slug: string,
    guests: number
  ) => AvailabilityEntry;
  fetchAvailability: (input: {
    slug: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => Promise<AvailabilityEntry>;
  onAddBubbleSelection: (input: {
    accommodationTypeId: number;
    accommodationSlug: string;
    guests?: number;
    assignmentMode?: AssignmentMode;
    bubbleId?: number;
  }) => void;
  onUpdateBubbleSelection: (
    key: string,
    patch: Partial<{
      guests: number;
      assignmentMode: AssignmentMode;
      bubbleId: number | null;
      accommodationTypeId: number;
      accommodationSlug: string;
    }>
  ) => void;
  onRemoveBubbleSelection: (key: string) => void;
}

export function StepBubbles({
  state,
  accommodationTypes,
  locale,
  allocatedGuests,
  remainingGuests,
  getAvailability,
  fetchAvailability,
  onAddBubbleSelection,
  onUpdateBubbleSelection,
  onRemoveBubbleSelection,
}: StepBubblesProps) {
  const { checkIn, checkOut, totalGuests, selections } = state.bubbleStay;
  const activeTypes = accommodationTypes.filter((t) => t.is_active);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [draftGuests, setDraftGuests] = useState(1);
  const [draftMode, setDraftMode] = useState<AssignmentMode>("random");
  const [draftBubbleId, setDraftBubbleId] = useState<number | null>(null);

  const takenBubbleIds = useMemo(() => {
    const ids = new Set<number>();
    for (const selection of selections) {
      if (selection.assignmentMode === "manual" && selection.bubbleId != null) {
        ids.add(selection.bubbleId);
      }
    }
    return ids;
  }, [selections]);

  const datesReady = Boolean(checkIn && checkOut);

  useEffect(() => {
    setExpandedSlug(null);
    setDraftBubbleId(null);
  }, [checkIn, checkOut]);

  const openType = (type: AccommodationTypeMeta) => {
    if (!datesReady || !checkIn || !checkOut) return;
    const guestsForCheck = Math.max(
      1,
      Math.min(
        remainingGuests > 0 ? remainingGuests : 1,
        type.max_guests
      )
    );
    setExpandedSlug(type.slug);
    setDraftGuests(guestsForCheck);
    setDraftMode("random");
    setDraftBubbleId(null);
    void fetchAvailability({
      slug: type.slug,
      checkIn,
      checkOut,
      guests: guestsForCheck,
    });
  };

  const refreshExpanded = (guests: number) => {
    if (!expandedSlug || !checkIn || !checkOut) return;
    void fetchAvailability({
      slug: expandedSlug,
      checkIn,
      checkOut,
      guests,
    });
  };

  const expandedType = activeTypes.find((t) => t.slug === expandedSlug) ?? null;
  const availability =
    expandedType && checkIn && checkOut
      ? getAvailability(expandedType.slug, draftGuests)
      : null;

  const confirmAdd = () => {
    if (!expandedType) return;
    if (remainingGuests < 1) return;
    if (draftGuests < 1 || draftGuests > remainingGuests) return;
    if (draftGuests > expandedType.max_guests) return;
    if (draftMode === "manual" && draftBubbleId == null) return;
    if (
      draftMode === "manual" &&
      draftBubbleId != null &&
      takenBubbleIds.has(draftBubbleId)
    ) {
      return;
    }

    onAddBubbleSelection({
      accommodationTypeId: expandedType.id,
      accommodationSlug: expandedType.slug,
      guests: draftGuests,
      assignmentMode: draftMode,
      ...(draftMode === "manual" && draftBubbleId != null
        ? { bubbleId: draftBubbleId }
        : {}),
    });

    setExpandedSlug(null);
    setDraftBubbleId(null);
  };

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
        Your Bubbles
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          marginBottom: "12px",
        }}
      >
        Compose your stay
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          marginBottom: "22px",
          lineHeight: 1.7,
          maxWidth: "540px",
        }}
      >
        Add one or more bubbles, allocate every guest, and choose a specific
        bubble — or let Zalina select the best available one.
      </p>

      <AllocationBar
        totalGuests={totalGuests}
        allocatedGuests={allocatedGuests}
        remainingGuests={remainingGuests}
      />

      {!datesReady && (
        <p style={{ color: TEXT_MUTED, fontSize: "13px", marginBottom: "20px" }}>
          Return to Stay Details and choose valid dates before selecting bubbles.
        </p>
      )}

      {activeTypes.length === 0 && (
        <EmptyPanel message="No accommodation types are available right now." />
      )}

      {/* Current selections */}
      <div className="grid gap-3 mb-8">
        {selections.map((selection, index) => {
          const type = activeTypes.find(
            (t) => t.id === selection.accommodationTypeId
          );
          return (
            <SelectionCard
              key={selection.key}
              index={index}
              title={
                type
                  ? localizedName(type, locale)
                  : selection.accommodationSlug
              }
              guests={selection.guests}
              maxGuests={type?.max_guests ?? selection.guests}
              mode={selection.assignmentMode}
              onGuestsChange={(n) =>
                onUpdateBubbleSelection(selection.key, { guests: n })
              }
              onModeChange={(mode) =>
                onUpdateBubbleSelection(selection.key, {
                  assignmentMode: mode,
                })
              }
              onRemove={() => onRemoveBubbleSelection(selection.key)}
              availableBubbles={
                type && checkIn && checkOut
                  ? getAvailability(
                      type.slug,
                      selection.guests
                    ).bubbles.filter(
                      (b) =>
                        !takenBubbleIds.has(b.id) ||
                        b.id === selection.bubbleId
                    )
                  : []
              }
              availabilityStatus={
                type && checkIn && checkOut
                  ? getAvailability(type.slug, selection.guests).status
                  : "idle"
              }
              selectedBubbleId={selection.bubbleId ?? null}
              onSelectBubble={(id) =>
                onUpdateBubbleSelection(selection.key, {
                  assignmentMode: "manual",
                  bubbleId: id,
                })
              }
              onEnsureAvailability={() => {
                if (!type || !checkIn || !checkOut) return;
                void fetchAvailability({
                  slug: type.slug,
                  checkIn,
                  checkOut,
                  guests: selection.guests,
                });
              }}
              locale={locale}
              typeMeta={type}
            />
          );
        })}
      </div>

      {/* Add another */}
      {datesReady && remainingGuests > 0 && (
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "14px",
            }}
          >
            + Add another bubble
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeTypes.map((type) => {
              const image = resolveAccommodationImage(type);
              const price = parseMoney(type.price_per_night);
              const selected = expandedSlug === type.slug;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => openType(type)}
                  aria-expanded={selected}
                  className="text-left overflow-hidden transition-all duration-300"
                  style={{
                    borderRadius: "16px",
                    border: selected
                      ? "1px solid rgba(212,175,55,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      height: "140px",
                      backgroundImage: `linear-gradient(180deg, transparent, rgba(8,6,4,0.75)), url("${image.replace(/"/g, '\\"')}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: "16px 18px 18px" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "20px",
                        color: TEXT_PRIMARY,
                        marginBottom: "6px",
                      }}
                    >
                      {localizedName(type, locale)}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        color: TEXT_MUTED,
                        lineHeight: 1.55,
                        marginBottom: "12px",
                        minHeight: "38px",
                      }}
                    >
                      {localizedDescription(type, locale) ||
                        `Up to ${type.max_guests} guests`}
                    </p>
                    <div
                      className="flex flex-wrap gap-x-4 gap-y-1"
                      style={{ fontSize: "11px", color: TEXT_MUTED }}
                    >
                      <span>Up to {type.max_guests} guests</span>
                      {price != null && (
                        <span>
                          From {Math.round(price).toLocaleString("en-US")} / night
                        </span>
                      )}
                      {type.bubbles_count > 0 && (
                        <span>{type.bubbles_count} bubbles</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {expandedType && (
            <AddPanel
              type={expandedType}
              locale={locale}
              availability={availability}
              draftGuests={draftGuests}
              draftMode={draftMode}
              draftBubbleId={draftBubbleId}
              remainingGuests={remainingGuests}
              takenBubbleIds={takenBubbleIds}
              onGuestsChange={(n) => {
                setDraftGuests(n);
                setDraftBubbleId(null);
                refreshExpanded(n);
              }}
              onModeChange={(mode) => {
                setDraftMode(mode);
                if (mode === "random") setDraftBubbleId(null);
              }}
              onSelectBubble={setDraftBubbleId}
              onRetry={() => refreshExpanded(draftGuests)}
              onConfirm={confirmAdd}
              onClose={() => {
                setExpandedSlug(null);
                setDraftBubbleId(null);
              }}
            />
          )}
        </div>
      )}

      {remainingGuests < 0 && (
        <p role="alert" style={{ color: "rgba(220,160,100,0.95)", marginTop: "16px" }}>
          Too many guests allocated. Reduce guests in one or more bubbles.
        </p>
      )}
      {remainingGuests > 0 && selections.length > 0 && (
        <p style={{ color: TEXT_MUTED, marginTop: "16px", fontSize: "13px" }}>
          {remainingGuests} guest{remainingGuests === 1 ? "" : "s"} still need
          accommodation.
        </p>
      )}
    </div>
  );
}

function AllocationBar({
  totalGuests,
  allocatedGuests,
  remainingGuests,
}: {
  totalGuests: number;
  allocatedGuests: number;
  remainingGuests: number;
}) {
  const pct =
    totalGuests > 0
      ? Math.min(100, Math.round((allocatedGuests / totalGuests) * 100))
      : 0;
  return (
    <div
      style={{
        marginBottom: "24px",
        padding: "16px 18px",
        borderRadius: "14px",
        border: "1px solid rgba(212,175,55,0.18)",
        background: "rgba(212,175,55,0.04)",
      }}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3" style={{ fontSize: "13px" }}>
        <span style={{ color: TEXT_MUTED }}>
          Total guests:{" "}
          <strong style={{ color: TEXT_PRIMARY }}>{totalGuests}</strong>
        </span>
        <span style={{ color: TEXT_MUTED }}>
          Allocated:{" "}
          <strong style={{ color: TEXT_PRIMARY }}>{allocatedGuests}</strong>
        </span>
        <span style={{ color: TEXT_MUTED }}>
          Remaining:{" "}
          <strong style={{ color: remainingGuests === 0 ? GOLD : TEXT_PRIMARY }}>
            {remainingGuests}
          </strong>
        </span>
      </div>
      <div
        style={{
          height: "3px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: GOLD,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div
      style={{
        border: "1px dashed rgba(212,175,55,0.18)",
        borderRadius: "14px",
        padding: "28px",
        color: TEXT_MUTED,
        fontSize: "13px",
        marginBottom: "20px",
      }}
    >
      {message}
    </div>
  );
}

function SelectionCard({
  index,
  title,
  guests,
  maxGuests,
  mode,
  onGuestsChange,
  onModeChange,
  onRemove,
  availableBubbles,
  availabilityStatus,
  selectedBubbleId,
  onSelectBubble,
  onEnsureAvailability,
  locale,
  typeMeta,
}: {
  index: number;
  title: string;
  guests: number;
  maxGuests: number;
  mode: AssignmentMode;
  onGuestsChange: (n: number) => void;
  onModeChange: (mode: AssignmentMode) => void;
  onRemove: () => void;
  availableBubbles: PhysicalBubble[];
  availabilityStatus: AvailabilityEntry["status"];
  selectedBubbleId: number | null;
  onSelectBubble: (id: number | null) => void;
  onEnsureAvailability: () => void;
  locale: "en" | "ar";
  typeMeta?: AccommodationTypeMeta;
}) {
  const ensureRef = useRef(onEnsureAvailability);
  ensureRef.current = onEnsureAvailability;

  useEffect(() => {
    if (mode === "manual") {
      ensureRef.current();
    }
  }, [mode, guests]);

  const selectedBubble = availableBubbles.find((b) => b.id === selectedBubbleId);
  const bubbleLabel =
    mode === "random"
      ? "Zalina will assign"
      : selectedBubble
        ? localizedName(selectedBubble, locale)
        : "Choose a bubble";

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "18px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            Bubble #{index + 1}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color: TEXT_PRIMARY,
              marginTop: "4px",
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: "12px", color: TEXT_MUTED, marginTop: "4px" }}>
            {bubbleLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove bubble ${index + 1}`}
          style={{
            background: "transparent",
            border: "none",
            color: TEXT_MUTED,
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-4">
        <GuestSelector
          label="Guests in this bubble"
          value={guests}
          min={1}
          max={maxGuests}
          onChange={onGuestsChange}
        />

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: TEXT_MUTED,
              marginBottom: "10px",
            }}
          >
            Assignment
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <ModeButton
              selected={mode === "manual"}
              label="Choose your bubble"
              onClick={() => onModeChange("manual")}
            />
            <ModeButton
              selected={mode === "random"}
              label="Let Zalina select"
              onClick={() => onModeChange("random")}
            />
          </div>
        </fieldset>

        {mode === "manual" && (
          <BubblePicker
            status={availabilityStatus}
            bubbles={availableBubbles}
            selectedId={selectedBubbleId}
            onSelect={onSelectBubble}
            onRetry={onEnsureAvailability}
            locale={locale}
            typeMeta={typeMeta}
          />
        )}
      </div>
    </div>
  );
}

function ModeButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: "10px",
        border: selected
          ? "1px solid rgba(212,175,55,0.45)"
          : "1px solid rgba(255,255,255,0.08)",
        background: selected ? "rgba(212,175,55,0.08)" : "transparent",
        color: TEXT_PRIMARY,
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function BubblePicker({
  status,
  bubbles,
  selectedId,
  onSelect,
  onRetry,
  locale,
  typeMeta,
}: {
  status: AvailabilityEntry["status"];
  bubbles: PhysicalBubble[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onRetry: () => void;
  locale: "en" | "ar";
  typeMeta?: AccommodationTypeMeta;
}) {
  if (status === "loading" || status === "idle") {
    return (
      <div
        aria-busy="true"
        style={{
          padding: "16px",
          borderRadius: "10px",
          border: "1px dashed rgba(212,175,55,0.2)",
          color: TEXT_MUTED,
          fontSize: "13px",
        }}
      >
        Checking availability…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" style={{ fontSize: "13px", color: "rgba(220,160,100,0.95)" }}>
        <p style={{ marginBottom: "8px" }}>Availability could not be verified.</p>
        <button type="button" onClick={onRetry} style={{ color: GOLD, background: "none", border: "none", cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  if (status === "unavailable" || bubbles.length === 0) {
    return (
      <div
        style={{
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
          color: TEXT_MUTED,
          fontSize: "13px",
        }}
      >
        No bubbles available for these dates. Choose another type or change dates.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2" role="listbox" aria-label="Available bubbles">
      {bubbles.map((bubble) => {
        const selected = selectedId === bubble.id;
        const image = resolveBubbleImage(bubble, typeMeta);
        return (
          <button
            key={bubble.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(bubble.id)}
            className="text-left overflow-hidden"
            style={{
              borderRadius: "12px",
              border: selected
                ? "1px solid rgba(212,175,55,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: "72px",
                backgroundImage: `url("${image.replace(/"/g, '\\"')}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ padding: "10px 12px" }}>
              <p style={{ color: TEXT_PRIMARY, fontSize: "13px" }}>
                {localizedName(bubble, locale)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AddPanel({
  type,
  locale,
  availability,
  draftGuests,
  draftMode,
  draftBubbleId,
  remainingGuests,
  takenBubbleIds,
  onGuestsChange,
  onModeChange,
  onSelectBubble,
  onRetry,
  onConfirm,
  onClose,
}: {
  type: AccommodationTypeMeta;
  locale: "en" | "ar";
  availability: AvailabilityEntry | null;
  draftGuests: number;
  draftMode: AssignmentMode;
  draftBubbleId: number | null;
  remainingGuests: number;
  takenBubbleIds: Set<number>;
  onGuestsChange: (n: number) => void;
  onModeChange: (mode: AssignmentMode) => void;
  onSelectBubble: (id: number | null) => void;
  onRetry: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const bubbles = (availability?.bubbles ?? []).filter(
    (b) => !takenBubbleIds.has(b.id)
  );
  const canConfirm =
    draftGuests >= 1 &&
    draftGuests <= remainingGuests &&
    draftGuests <= type.max_guests &&
    (draftMode === "random" || draftBubbleId != null) &&
    availability?.status === "ready";

  return (
    <div
      style={{
        marginTop: "18px",
        borderRadius: "16px",
        border: "1px solid rgba(212,175,55,0.28)",
        background: "rgba(212,175,55,0.04)",
        padding: "20px",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.14em", color: GOLD, textTransform: "uppercase" }}>
            Adding
          </p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: TEXT_PRIMARY }}>
            {localizedName(type, locale)}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer" }}>
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-4">
        <GuestSelector
          label="Guests in this bubble"
          value={draftGuests}
          min={1}
          max={Math.min(type.max_guests, remainingGuests)}
          onChange={onGuestsChange}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <ModeButton
            selected={draftMode === "manual"}
            label="Choose your bubble"
            onClick={() => onModeChange("manual")}
          />
          <ModeButton
            selected={draftMode === "random"}
            label="Let Zalina select"
            onClick={() => onModeChange("random")}
          />
        </div>

        {draftMode === "manual" && (
          <BubblePicker
            status={availability?.status ?? "idle"}
            bubbles={bubbles}
            selectedId={draftBubbleId}
            onSelect={onSelectBubble}
            onRetry={onRetry}
            locale={locale}
            typeMeta={type}
          />
        )}

        {draftMode === "random" && availability?.status === "unavailable" && (
          <p style={{ color: TEXT_MUTED, fontSize: "13px" }}>
            No bubbles available for these dates.
          </p>
        )}
        {availability?.status === "error" && (
          <p role="alert" style={{ color: "rgba(220,160,100,0.95)", fontSize: "13px" }}>
            {availability.error}{" "}
            <button type="button" onClick={onRetry} style={{ color: GOLD, background: "none", border: "none", cursor: "pointer" }}>
              Retry
            </button>
          </p>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="inline-flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: canConfirm ? "#0D0B08" : "rgba(248,242,231,0.25)",
            background: canConfirm
              ? "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))"
              : "rgba(255,255,255,0.05)",
            border: canConfirm ? "none" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "9px",
            padding: "12px 18px",
            cursor: canConfirm ? "pointer" : "not-allowed",
          }}
        >
          <Plus size={14} />
          Add bubble
        </button>
      </div>
    </div>
  );
}
