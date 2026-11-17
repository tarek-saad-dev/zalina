"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { dayUseProductToSettings } from "@/lib/api";
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
import { useTicketAddOns } from "./useTicketAddOns";
import { productsForTicketChoice } from "./ticketProducts";

interface BookNowPageProps {
  catalog: BookingCatalog;
}

export function BookNowPage({ catalog }: BookNowPageProps) {
  const t = useTranslations("bookNow");
  const locale = useBookingLocale();
  const dayUseQuery = useDayUseSettings({
    enabled: true,
    locale,
  });
  const ticketAddOnQuery = useTicketAddOns(locale);

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
    setTicketChoice,
    setLanternAddOnId,
    setVisitDate,
    setDayUseProductId,
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
    dayUseProducts: dayUseQuery.products,
    dayUseProductsStatus: dayUseQuery.status,
  });

  const eligibleDayUseProducts = useMemo(
    () => productsForTicketChoice(dayUseQuery.products, state.ticketChoice),
    [dayUseQuery.products, state.ticketChoice]
  );

  const selectedDayUseProduct = useMemo(() => {
    if (state.dayUse.productId == null) return null;
    return (
      eligibleDayUseProducts.find((p) => p.id === state.dayUse.productId) ?? null
    );
  }, [eligibleDayUseProducts, state.dayUse.productId]);

  const dayUseSettings = selectedDayUseProduct
    ? dayUseProductToSettings(selectedDayUseProduct)
    : null;
  const dayUsePrice = parseMoney(selectedDayUseProduct?.price_per_guest);
  const currentTicket = state.ticketChoice === "observatory_experience" ? "observatory_experience" :
    state.ticketChoice === "cabin_stay" ? "cabin_stay" : "day_use";
  const lanternOption = ticketAddOnQuery.items.find((item) =>
    item.supported_tickets.includes(currentTicket) &&
    item.currency === selectedDayUseProduct?.currency
  ) ?? null;
  const lanternSelected = Boolean(lanternOption && state.lanternAddOnId === lanternOption.id);
  const lanternPrice = lanternSelected ? parseMoney(lanternOption?.price_per_guest) ?? 0 : 0;
  const productSelectionValid = state.productType !== "day_use" ||
    state.dayUse.productId == null || selectedDayUseProduct != null;

  // Never submit an add-on that has disappeared, changed currency, or is not checkout-ready.
  useEffect(() => {
    if (state.lanternAddOnId != null && ticketAddOnQuery.status !== "loading" && !lanternSelected) {
      setLanternAddOnId(null);
    }
  }, [state.lanternAddOnId, ticketAddOnQuery.status, lanternSelected, setLanternAddOnId]);

  const estimatedWithAddOn = derived.estimatedTotal == null ? null :
    derived.estimatedTotal + (state.productType === "day_use" ? lanternPrice * state.dayUse.guests : 0);

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
    dayUsePricePerGuest: dayUsePrice == null ? null : dayUsePrice + lanternPrice,
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
    if (hasActiveHold || !productSelectionValid) return;
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
    if (!productSelectionValid || (state.lanternAddOnId != null && !lanternSelected)) return;
    if (checkout.booking && checkout.phase === "error") {
      void retryPayment();
      return;
    }
    void reserveAndPay();
  };

  const summaryCTALabel = isBusy
    ? checkout.phase === "creating"
      ? t("cta.securing")
      : checkout.phase === "initiating_payment" ||
          checkout.phase === "redirecting"
        ? t("cta.preparingPayment")
        : t("cta.processing")
    : checkout.booking
      ? t("cta.proceedToPayment")
      : isLastStep
        ? t("cta.reserveContinueToPayment")
        : t("cta.continue");

  const lastStepCanProceed =
    isLastStep &&
    canSubmit &&
    productSelectionValid &&
    (state.lanternAddOnId == null || lanternSelected) &&
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
                    {t("holdBanner")}
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
                  estimatedTotal={estimatedWithAddOn}
                  dayUseProducts={eligibleDayUseProducts}
                  allDayUseProducts={dayUseQuery.products}
                  lanternOption={lanternOption}
                  lanternStatus={ticketAddOnQuery.status}
                  onToggleLantern={() => setLanternAddOnId(lanternSelected ? null : lanternOption?.id ?? null)}
                  dayUseSettings={dayUseSettings}
                  dayUseSettingsStatus={dayUseQuery.status}
                  dayUseSettingsError={dayUseQuery.error}
                  onReloadDayUseSettings={() => void dayUseQuery.reload()}
                  onSelectDayUseProduct={setDayUseProductId}
                  getAvailability={getAvailability}
                  fetchAvailability={(input) => fetchAvailability(input)}
                  onNext={handleNext}
                  onBack={handleBack}
                  canProceed={proceed && productSelectionValid && (state.lanternAddOnId == null || lanternSelected) && !isBusy && !hasActiveHold}
                  onSetTicketChoice={setTicketChoice}
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
                estimatedTotal={estimatedWithAddOn}
                allocatedGuests={derived.allocatedGuests}
                remainingGuests={derived.remainingGuests}
                dayUseSettings={dayUseSettings}
                checkout={checkout}
                onContinue={
                  isLastStep ? handleCheckoutCta : () => handleNext()
                }
                isLastStep={isLastStep}
                canProceed={
                  isLastStep
                    ? lastStepCanProceed
                    : proceed && productSelectionValid && (state.lanternAddOnId == null || lanternSelected) && !isBusy && !hasActiveHold
                }
                ctaLabel={summaryCTALabel}
              />
            </div>
          </div>
        </div>
      </section>

      <MobileBookingBar
        state={state}
        estimatedTotal={estimatedWithAddOn}
        allocatedGuests={derived.allocatedGuests}
        dayUseCurrency={dayUseSettings?.currency}
        checkout={checkout}
        onContinue={isLastStep ? handleCheckoutCta : handleNext}
        canProceed={
          isLastStep
            ? lastStepCanProceed
            : proceed && productSelectionValid && (state.lanternAddOnId == null || lanternSelected) && !isBusy && !hasActiveHold
        }
        ctaLabel={
          isLastStep
            ? checkout.booking
              ? t("cta.payNow")
              : t("cta.reserve")
            : t("cta.continue")
        }
      />
    </main>
  );
}
