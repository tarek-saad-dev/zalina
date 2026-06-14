"use client";

import { useBookingState } from "./useBookingState";
import { BookingHero } from "./BookingHero";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";
import { MobileBookingBar } from "./MobileBookingBar";
import { StepPlaceholder } from "./StepPlaceholder";
import { BookingConfirmation } from "./BookingConfirmation";
import type { JourneyType, DateSelection, PreferredPeriod, GuestContactDetails } from "./types";
import { BOOKING_STEPS } from "./mockData";

export function BookNowPage() {
  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    setJourneyType,
    setSelectedItem,
    setSelectedOccasion,
    setDateSelection,
    setGuests,
    setParticipants,
    setEstimatedGuests,
    setPreferredPeriod,
    toggleEnhancement,
    setGuestDetails,
    submitMockBooking,
    resetBooking,
    canProceed,
  } = useBookingState();

  const isConfirmed = state.bookingStatus === "submitted";
  const isLastStep = state.currentStep === BOOKING_STEPS.length;
  const proceed = canProceed(state.currentStep);

  const handleNext = () => {
    if (proceed) nextStep();
  };

  const handleSummaryContinue = () => {
    if (isLastStep) {
      submitMockBooking();
    } else if (proceed) {
      nextStep();
    }
  };

  const summaryCTALabel = isLastStep
    ? state.isPrivateCustom
      ? "Send Request"
      : "Confirm"
    : "Continue";

  return (
    <main style={{ background: "#050403", minHeight: "100vh" }}>
      {/* Hero */}
      <BookingHero />

      {/* Progress stepper — dimmed after confirmation */}
      {!isConfirmed && (
        <BookingProgress currentStep={state.currentStep} onStepClick={goToStep} />
      )}

      {/* Main body */}
      <section
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.05) 0%, transparent 60%), #050403",
          minHeight: "60vh",
          paddingBottom: "140px",
        }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: isConfirmed ? "760px" : "1280px", padding: "48px 24px 0" }}
        >
          {isConfirmed ? (
            /* ── Confirmation screen ── */
            <div
              style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "18px",
                padding: "clamp(32px, 5vw, 56px)",
              }}
            >
              <BookingConfirmation state={state} onReset={resetBooking} />
            </div>
          ) : (
            /* ── Wizard ── */
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* LEFT: Wizard content */}
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "18px",
                    padding: "clamp(24px, 4vw, 40px)",
                  }}
                >
                  <StepPlaceholder
                    state={state}
                    onNext={handleNext}
                    onBack={prevStep}
                    canProceed={proceed}
                    onSetJourneyType={(type: JourneyType) => setJourneyType(type)}
                    onSelectItem={setSelectedItem}
                    onSelectOccasion={setSelectedOccasion}
                    onSetDateSelection={(patch: Partial<DateSelection>) => setDateSelection(patch)}
                    onSetGuests={setGuests}
                    onSetParticipants={setParticipants}
                    onSetEstimatedGuests={setEstimatedGuests}
                    onSetPreferredPeriod={(p: PreferredPeriod) => setPreferredPeriod(p)}
                    onToggleEnhancement={toggleEnhancement}
                    onSetGuestDetails={(patch: Partial<GuestContactDetails>) => setGuestDetails(patch)}
                    onSubmit={submitMockBooking}
                  />
                </div>
              </div>

              {/* RIGHT: Sticky summary (desktop only) */}
              <div
                className="hidden lg:block"
                style={{
                  width: "340px",
                  flexShrink: 0,
                  position: "sticky",
                  top: "104px",
                  alignSelf: "flex-start",
                }}
              >
                <BookingSummary
                  state={state}
                  onContinue={handleSummaryContinue}
                  isLastStep={isLastStep}
                  canProceed={proceed}
                  ctaLabel={summaryCTALabel}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile sticky bar — hidden after confirmation */}
      {!isConfirmed && (
        <MobileBookingBar
          state={state}
          onContinue={isLastStep ? submitMockBooking : handleNext}
          canProceed={isLastStep ? true : proceed}
        />
      )}
    </main>
  );
}
