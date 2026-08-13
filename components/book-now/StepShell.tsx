"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BookingProductType, DayUseSettings } from "@/lib/api";
import type {
  AccommodationTypeMeta,
  AssignmentMode,
  BookingState,
  BookingStepDefinition,
  GuestDetailsState,
} from "./types";
import { StepProduct } from "./StepProduct";
import { StepDayUseDateGuests } from "./StepDayUseDateGuests";
import { StepBubbleStayDatesGuests } from "./StepBubbleStayDatesGuests";
import { StepBubbles } from "./StepBubbles";
import { StepGuestDetailsV2 } from "./StepGuestDetailsV2";
import { StepReviewV2 } from "./StepReviewV2";
import type { AvailabilityEntry } from "./useAvailabilityCache";
import type { CheckoutState } from "./checkoutTypes";

interface StepShellProps {
  state: BookingState;
  currentStep: BookingStepDefinition;
  activeSteps: BookingStepDefinition[];
  accommodationTypes: AccommodationTypeMeta[];
  locale: "en" | "ar";
  allocatedGuests: number;
  remainingGuests: number;
  estimatedTotal: number | null;
  dayUseSettings: DayUseSettings | null;
  dayUseSettingsStatus: "idle" | "loading" | "ready" | "error";
  dayUseSettingsError: string | null;
  onReloadDayUseSettings: () => void;
  getAvailability: (slug: string, guests: number) => AvailabilityEntry;
  fetchAvailability: (input: {
    slug: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => Promise<AvailabilityEntry>;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  onSetProductType: (type: BookingProductType) => void;
  onSetVisitDate: (date: string | null) => void;
  onSetDayUseGuests: (n: number) => void;
  onSetBubbleStayDates: (patch: {
    checkIn?: string | null;
    checkOut?: string | null;
  }) => void;
  onSetBubbleStayGuests: (n: number) => void;
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
  onClearBubbleSelections: () => void;
  onSetGuestDetails: (patch: Partial<GuestDetailsState>) => void;
  checkout: CheckoutState;
  onReserveAndPay: () => void;
  onRetryPayment: () => void;
  onStartNewReservation: () => void;
  onReturnToBubbles: () => void;
}

export function StepShell(props: StepShellProps) {
  const {
    state,
    currentStep,
    activeSteps,
    onNext,
    onBack,
    canProceed,
  } = props;
  const reduceMotion = useReducedMotion();
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === activeSteps.length - 1;
  const isReview = currentStep.id === "review";

  return (
    <div>
      <motion.div
        key={`${state.productType ?? "none"}-${currentStep.id}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        {currentStep.id === "product" && (
          <StepProduct
            state={state}
            onSetProductType={props.onSetProductType}
          />
        )}
        {currentStep.id === "date_guests" && (
          <StepDayUseDateGuests
            state={state}
            settings={props.dayUseSettings}
            settingsStatus={props.dayUseSettingsStatus}
            settingsError={props.dayUseSettingsError}
            onReloadSettings={props.onReloadDayUseSettings}
            onSetVisitDate={props.onSetVisitDate}
            onSetDayUseGuests={props.onSetDayUseGuests}
            onSwitchToBubbleStay={() => props.onSetProductType("bubble_stay")}
          />
        )}
        {currentStep.id === "dates_guests" && (
          <StepBubbleStayDatesGuests
            state={state}
            onSetBubbleStayDates={props.onSetBubbleStayDates}
            onSetBubbleStayGuests={props.onSetBubbleStayGuests}
          />
        )}
        {currentStep.id === "bubbles" && (
          <StepBubbles
            state={state}
            accommodationTypes={props.accommodationTypes}
            locale={props.locale}
            allocatedGuests={props.allocatedGuests}
            remainingGuests={props.remainingGuests}
            getAvailability={props.getAvailability}
            fetchAvailability={props.fetchAvailability}
            onAddBubbleSelection={props.onAddBubbleSelection}
            onUpdateBubbleSelection={props.onUpdateBubbleSelection}
            onRemoveBubbleSelection={props.onRemoveBubbleSelection}
          />
        )}
        {currentStep.id === "guest_details" && (
          <StepGuestDetailsV2
            state={state}
            onSetGuestDetails={props.onSetGuestDetails}
          />
        )}
        {currentStep.id === "review" && (
          <StepReviewV2
            state={state}
            accommodationTypes={props.accommodationTypes}
            locale={props.locale}
            estimatedTotal={props.estimatedTotal}
            dayUseSettings={props.dayUseSettings}
            checkout={props.checkout}
            onReserveAndPay={props.onReserveAndPay}
            onRetryPayment={props.onRetryPayment}
            onStartNewReservation={props.onStartNewReservation}
            onReturnToBubbles={props.onReturnToBubbles}
          />
        )}
      </motion.div>

      {!isReview && (
        <div
          className="flex items-center justify-between mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(212,175,55,0.09)" }}
        >
          {!isFirstStep ? (
            <button
              type="button"
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
            >
              <ArrowLeft size={14} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
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
          >
            {isLastStep ? "Review" : "Continue"}
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
