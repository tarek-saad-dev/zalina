"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBookingState, type BookingCatalog } from "./useBookingState";
import { BookingHero } from "./BookingHero";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";
import { MobileBookingBar } from "./MobileBookingBar";
import { StepShell } from "./StepShell";
import { useBookingLocale } from "./useBookingLocale";
import { useDayUseSettings } from "./useDayUseSettings";
import { useAvailabilityCache } from "./useAvailabilityCache";
import { useBookingCheckout } from "./useBookingCheckout";
import { parseMoney } from "./bookingMedia";
import { isBusyCheckoutPhase } from "./checkoutTypes";

interface BookNowPageProps {
  catalog: BookingCatalog;
}

export function BookNowPage({ catalog }: BookNowPageProps) {
  const locale = useBookingLocale();
  const dayUseQuery = useDayUseSettings({
    enabled: true,
    locale,
  });
  const dayUsePrice = parseMoney(dayUseQuery.settings?.price_per_guest);
  const dayUseActiveOption =
    dayUseQuery.status === "ready"
      ? (dayUseQuery.settings?.is_active ?? false)
      : dayUseQuery.status === "error"
        ? false
        : null;

  const {
    state,
    activeSteps,
    currentStep,
    derived,
    accommodationTypes,
    nextStep,
    prevStep,
    goToStep,
    jumpToStepId,
    setProductType,
    setVisitDate,
    setDayUseGuests,
    setBubbleStayDates,
    setBubbleStayGuests,
    addBubbleSelection,
    updateBubbleSelection,
    removeBubbleSelection,
    clearBubbleSelections,
    clearStaleBubbleInventory,
    setGuestDetails,
    markBookingCreated,
    canProceed,
  } = useBookingState(catalog, {
    dayUsePricePerGuest: dayUsePrice,
    dayUseActive: dayUseActiveOption,
  });

  const {
    getEntry,
    fetchAvailability,
    invalidateAll,
  } = useAvailabilityCache(locale);

  const handleBubbleConflict = useCallback(
    (_message: string) => {
      clearStaleBubbleInventory();
      invalidateAll();
      jumpToStepId("bubbles");
      // Re-fetch for current selections
      const { checkIn, checkOut, selections } = state.bubbleStay;
      if (checkIn && checkOut) {
        for (const selection of selections) {
          void fetchAvailability({
            slug: selection.accommodationSlug,
            checkIn,
            checkOut,
            guests: selection.guests,
          });
        }
      }
      if (process.env.NODE_ENV !== "production") {
        // Dev-only: conflict recovery (no guest PII / payment URLs)
        console.info("[booking-checkout] bubble conflict recovered");
      }
    },
    [
      clearStaleBubbleInventory,
      fetchAvailability,
      jumpToStepId,
      invalidateAll,
      state.bubbleStay,
    ]
  );

  const {
    checkout,
    reserveAndPay,
    retryPayment,
    startNewReservation,
    canSubmit,
    hasActiveHold,
    isBusy,
  } = useBookingCheckout({
    state,
    accommodationTypes,
    dayUsePricePerGuest: dayUsePrice,
    locale,
    onBubbleConflict: handleBubbleConflict,
  });

  // Sync reference into wizard state for Phase 5 recovery surfaces
  const lastSyncedRef = useRef<string | null>(null);
  useEffect(() => {
    const ref = checkout.booking?.booking_reference ?? null;
    if (ref && ref !== lastSyncedRef.current) {
      lastSyncedRef.current = ref;
      markBookingCreated(ref);
    }
  }, [checkout.booking, markBookingCreated]);

  useEffect(() => {
    invalidateAll();
  }, [state.bubbleStay.checkIn, state.bubbleStay.checkOut, invalidateAll]);

  const isLastStep = state.currentStepIndex === activeSteps.length - 1;
  const proceed = canProceed(state.currentStepIndex);

  const getAvailability = useMemo(
    () => (slug: string, guests: number) => {
      const { checkIn, checkOut } = state.bubbleStay;
      if (!checkIn || !checkOut) {
        return {
          status: "idle" as const,
          data: null,
          error: null,
          bubbles: [],
        };
      }
      return getEntry(slug, checkIn, checkOut, guests);
    },
    [getEntry, state.bubbleStay]
  );

  const handleNext = () => {
    if (hasActiveHold) return;
    if (proceed) nextStep();
  };

  const handleBack = () => {
    if (isBusyCheckoutPhase(checkout.phase)) return;
    if (hasActiveHold) {
      // Editing after hold requires deliberate restart
      return;
    }
    prevStep();
  };

  const handleReturnToBubbles = () => {
    clearStaleBubbleInventory();
    invalidateAll();
    jumpToStepId("bubbles");
  };

  const handleCheckoutCta = () => {
    if (checkout.booking && checkout.phase === "error") {
      void retryPayment();
      return;
    }
    void reserveAndPay();
  };

  const summaryCTALabel = isBusy
    ? checkout.phase === "creating"
      ? "Securing…"
      : checkout.phase === "initiating_payment" ||
          checkout.phase === "redirecting"
        ? "Preparing payment…"
        : "Processing…"
    : checkout.booking
      ? "Proceed to Secure Payment"
      : isLastStep
        ? "Reserve & Continue to Payment"
        : "Continue";

  const lastStepCanProceed =
    isLastStep &&
    canSubmit &&
    checkout.phase !== "expired" &&
    checkout.phase !== "already_paid";

  return (
    <main style={{ minHeight: "100vh" }} className="page-atmosphere">
      <BookingHero />

      <BookingProgress
        steps={activeSteps}
        currentStepIndex={state.currentStepIndex}
        onStepClick={(index) => {
          if (hasActiveHold || isBusy) return;
          goToStep(index);
        }}
      />

      <section
        style={{
          background: "transparent",
          minHeight: "60vh",
          paddingBottom: "140px",
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: "1280px",
            padding: "48px 24px 0",
          }}
        >
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
                {hasActiveHold && currentStep.id !== "review" && (
                  <p
                    style={{
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "rgba(220,160,100,0.95)",
                      lineHeight: 1.6,
                    }}
                    role="status"
                  >
                    A reservation hold is active. Use &quot;Start a new
                    reservation&quot; on Review before changing details.
                  </p>
                )}
                <StepShell
                  state={state}
                  currentStep={currentStep}
                  activeSteps={activeSteps}
                  accommodationTypes={accommodationTypes}
                  locale={locale}
                  allocatedGuests={derived.allocatedGuests}
                  remainingGuests={derived.remainingGuests}
                  estimatedTotal={derived.estimatedTotal}
                  dayUseSettings={dayUseQuery.settings}
                  dayUseSettingsStatus={dayUseQuery.status}
                  dayUseSettingsError={dayUseQuery.error}
                  onReloadDayUseSettings={() => void dayUseQuery.reload()}
                  getAvailability={getAvailability}
                  fetchAvailability={(input) => fetchAvailability(input)}
                  onNext={handleNext}
                  onBack={handleBack}
                  canProceed={proceed && !isBusy && !hasActiveHold}
                  onSetProductType={setProductType}
                  onSetVisitDate={setVisitDate}
                  onSetDayUseGuests={setDayUseGuests}
                  onSetBubbleStayDates={setBubbleStayDates}
                  onSetBubbleStayGuests={setBubbleStayGuests}
                  onAddBubbleSelection={addBubbleSelection}
                  onUpdateBubbleSelection={updateBubbleSelection}
                  onRemoveBubbleSelection={removeBubbleSelection}
                  onClearBubbleSelections={clearBubbleSelections}
                  onSetGuestDetails={setGuestDetails}
                  checkout={checkout}
                  onReserveAndPay={() => void reserveAndPay()}
                  onRetryPayment={() => void retryPayment()}
                  onStartNewReservation={startNewReservation}
                  onReturnToBubbles={handleReturnToBubbles}
                />
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
                accommodationTypes={accommodationTypes}
                locale={locale}
                estimatedTotal={derived.estimatedTotal}
                allocatedGuests={derived.allocatedGuests}
                remainingGuests={derived.remainingGuests}
                dayUseSettings={dayUseQuery.settings}
                checkout={checkout}
                onContinue={
                  isLastStep ? handleCheckoutCta : () => handleNext()
                }
                isLastStep={isLastStep}
                canProceed={
                  isLastStep
                    ? lastStepCanProceed
                    : proceed && !isBusy && !hasActiveHold
                }
                ctaLabel={summaryCTALabel}
              />
            </div>
          </div>
        </div>
      </section>

      <MobileBookingBar
        state={state}
        estimatedTotal={derived.estimatedTotal}
        allocatedGuests={derived.allocatedGuests}
        dayUseCurrency={dayUseQuery.settings?.currency}
        checkout={checkout}
        onContinue={isLastStep ? handleCheckoutCta : handleNext}
        canProceed={
          isLastStep
            ? lastStepCanProceed
            : proceed && !isBusy && !hasActiveHold
        }
        ctaLabel={
          isLastStep
            ? checkout.booking
              ? "Pay now"
              : "Reserve"
            : "Continue"
        }
      />
    </main>
  );
}
