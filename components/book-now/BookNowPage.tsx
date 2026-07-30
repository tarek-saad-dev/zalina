"use client";

import { useBookingState, type BookingCatalog } from "./useBookingState";
import { BookingHero } from "./BookingHero";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";
import { MobileBookingBar } from "./MobileBookingBar";
import { StepPlaceholder } from "./StepPlaceholder";
import { BookingConfirmation } from "./BookingConfirmation";
import type {
  JourneyType,
  DateSelection,
  PreferredPeriod,
  GuestContactDetails,
} from "./types";
import { BOOKING_STEPS } from "./mockData";

interface BookNowPageProps {
  catalog: BookingCatalog;
}

export function BookNowPage({ catalog }: BookNowPageProps) {
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
    submitBooking,
    resetBooking,
    canProceed,
  } = useBookingState(catalog);

  const isConfirmed = state.bookingStatus === "submitted";
  const isLastStep = state.currentStep === BOOKING_STEPS.length;
  const proceed = canProceed(state.currentStep);
  const isSubmitting = state.bookingStatus === "submitting";

  const handleNext = () => {
    if (proceed) nextStep();
  };

  const handleSummaryContinue = () => {
    if (isLastStep) {
      void submitBooking();
    } else if (proceed) {
      nextStep();
    }
  };

  const summaryCTALabel = isSubmitting
    ? "Processing…"
    : isLastStep
      ? state.isPrivateCustom
        ? "Confirm & Pay"
        : "Confirm & Pay"
      : "Continue";

  return (
    <main style={{ background: "#050403", minHeight: "100vh" }}>
      <BookingHero />

      {!isConfirmed && (
        <BookingProgress currentStep={state.currentStep} onStepClick={goToStep} />
      )}

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
          style={{
            maxWidth: isConfirmed ? "760px" : "1280px",
            padding: "48px 24px 0",
          }}
        >
          {isConfirmed ? (
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
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
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
                    stays={catalog.stays}
                    experiences={catalog.experiences}
                    onNext={handleNext}
                    onBack={prevStep}
                    canProceed={proceed && !isSubmitting}
                    onSetJourneyType={(type: JourneyType) => setJourneyType(type)}
                    onSelectItem={setSelectedItem}
                    onSelectOccasion={setSelectedOccasion}
                    onSetDateSelection={(patch: Partial<DateSelection>) =>
                      setDateSelection(patch)
                    }
                    onSetGuests={setGuests}
                    onSetParticipants={setParticipants}
                    onSetEstimatedGuests={setEstimatedGuests}
                    onSetPreferredPeriod={(p: PreferredPeriod) =>
                      setPreferredPeriod(p)
                    }
                    onToggleEnhancement={toggleEnhancement}
                    onSetGuestDetails={(patch: Partial<GuestContactDetails>) =>
                      setGuestDetails(patch)
                    }
                    onSubmit={() => void submitBooking()}
                  />
                  {state.submissionError && (
                    <p
                      style={{
                        marginTop: "16px",
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        color: "rgba(220,160,100,0.95)",
                        lineHeight: 1.6,
                      }}
                      role="alert"
                    >
                      {state.submissionError}
                    </p>
                  )}
                </div>
              </div>

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
                  canProceed={proceed && !isSubmitting}
                  ctaLabel={summaryCTALabel}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {!isConfirmed && (
        <MobileBookingBar
          state={state}
          onContinue={
            isLastStep ? () => void submitBooking() : handleNext
          }
          canProceed={isLastStep ? !isSubmitting : proceed && !isSubmitting}
        />
      )}
    </main>
  );
}
