"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BookingState, JourneyType, DateSelection, PreferredPeriod, GuestContactDetails } from "./types";
import { BOOKING_STEPS } from "./mockData";
import { Step1Journey } from "./Step1Journey";
import { Step2Selection } from "./Step2Selection";
import { Step3DateGuests } from "./Step3DateGuests";
import { Step4Enhancements } from "./Step4Enhancements";
import { Step5GuestDetails } from "./Step5GuestDetails";
import { Step6ReviewPayment } from "./Step6ReviewPayment";

interface StepPlaceholderProps {
  state: BookingState;
  stays: import("./types").StayOption[];
  experiences: import("./types").ExperienceOption[];
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  onSetJourneyType: (type: JourneyType) => void;
  onSelectItem: (
    id: string,
    title: string,
    price: number,
    maxGuests?: number,
    meta?: import("./Step2Selection").SelectItemMeta
  ) => void;
  onSelectOccasion: (id: string) => void;
  onSetDateSelection: (patch: Partial<DateSelection>) => void;
  onSetGuests: (n: number) => void;
  onSetParticipants: (n: number) => void;
  onSetEstimatedGuests: (n: number) => void;
  onSetPreferredPeriod: (p: PreferredPeriod) => void;
  onToggleEnhancement: (id: string) => void;
  onSetGuestDetails: (patch: Partial<GuestContactDetails>) => void;
  onSubmit: () => void;
}

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

function GenericStepPlaceholder({ step }: { step: (typeof BOOKING_STEPS)[number] }) {
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
        Step {step.id} — {step.label}
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          lineHeight: 1.2,
          marginBottom: "12px",
        }}
      >
        {step.label}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: 1.7,
          maxWidth: "480px",
          marginBottom: "40px",
        }}
      >
        This step will be available in the next phase. Continue to explore the
        booking flow.
      </p>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(212,175,55,0.14)",
          borderRadius: "14px",
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            border: "1px solid rgba(212,175,55,0.18)",
            background: "rgba(212,175,55,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <span style={{ fontSize: "20px", fontFamily: "serif" }}>✦</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            color: "rgba(248,242,231,0.45)",
            fontWeight: 400,
          }}
        >
          Coming in Phase 3
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "rgba(248,242,231,0.25)",
            marginTop: "6px",
            letterSpacing: "0.06em",
          }}
        >
          {step.label} selection will be available shortly
        </p>
      </div>
    </div>
  );
}

export function StepPlaceholder({
  state,
  stays,
  experiences,
  onNext,
  onBack,
  canProceed,
  onSetJourneyType,
  onSelectItem,
  onSelectOccasion,
  onSetDateSelection,
  onSetGuests,
  onSetParticipants,
  onSetEstimatedGuests,
  onSetPreferredPeriod,
  onToggleEnhancement,
  onSetGuestDetails,
  onSubmit,
}: StepPlaceholderProps) {
  const currentStepData = BOOKING_STEPS[state.currentStep - 1];
  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === BOOKING_STEPS.length;

  return (
    <div>
      {/* Step content */}
      <div key={state.currentStep}>
          {state.currentStep === 1 && (
            <Step1Journey state={state} onSetJourneyType={onSetJourneyType} />
          )}
          {state.currentStep === 2 && (
            <Step2Selection
              state={state}
              stays={stays}
              experiences={experiences}
              onSelectItem={onSelectItem}
              onSelectOccasion={onSelectOccasion}
            />
          )}
          {state.currentStep === 3 && (
            <Step3DateGuests
              state={state}
              onSetDateSelection={onSetDateSelection}
              onSetGuests={onSetGuests}
              onSetParticipants={onSetParticipants}
              onSetEstimatedGuests={onSetEstimatedGuests}
              onSetPreferredPeriod={onSetPreferredPeriod}
            />
          )}
          {state.currentStep === 4 && (
            <Step4Enhancements
              state={state}
              onToggleEnhancement={onToggleEnhancement}
            />
          )}
          {state.currentStep === 5 && (
            <Step5GuestDetails
              state={state}
              onSetGuestDetails={onSetGuestDetails}
            />
          )}
          {state.currentStep === 6 && (
            <Step6ReviewPayment
              state={state}
              onSubmit={onSubmit}
            />
          )}
          {state.currentStep > 6 && (
            <GenericStepPlaceholder step={currentStepData} />
          )}
      </div>

      {/* Navigation row — hidden on step 6 (submit CTA is inside Step6ReviewPayment) */}
      {state.currentStep !== 6 && <div
        className="flex items-center justify-between mt-10 pt-6"
        style={{ borderTop: "1px solid rgba(212,175,55,0.09)" }}
      >
        {/* Back */}
        {!isFirstStep ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-all duration-300"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(248,242,231,0.52)",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "9px",
              padding: "12px 20px",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = TEXT_PRIMARY;
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(248,242,231,0.52)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Continue — hidden on mobile (sticky bar handles it) */}
        <button
          onClick={canProceed ? onNext : undefined}
          disabled={!canProceed}
          className="hidden md:flex items-center gap-2 transition-all duration-300"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: canProceed ? "#0D0B08" : "rgba(248,242,231,0.25)",
            background: canProceed
              ? "linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(232,199,102,0.95) 100%)"
              : "rgba(255,255,255,0.05)",
            borderRadius: "9px",
            padding: "12px 28px",
            border: canProceed ? "none" : "1px solid rgba(255,255,255,0.06)",
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.55,
          }}
          onMouseEnter={(e) => {
            if (canProceed) {
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,175,55,0.30)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isLastStep ? "Confirm Booking" : "Continue"}
          <ArrowRight size={14} />
        </button>
      </div>}
    </div>
  );
}
