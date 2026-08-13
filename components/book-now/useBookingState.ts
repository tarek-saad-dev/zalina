"use client";

import { useCallback, useMemo, useState } from "react";
import type { BookingProductType } from "@/lib/api";
import { getActiveSteps, getStepDefinition } from "./bookingSteps";
import {
  selectAllocatedGuests,
  selectEstimatedTotal,
  selectIsGuestAllocationComplete,
  selectRemainingGuests,
  getBubbleStayBookingInput,
  getDayUseBookingInput,
} from "./bookingSelectors";
import {
  createInitialBookingState,
  clearManualBubbleIds,
  createEmptyBubbleStayState,
  createEmptyDayUseState,
} from "./bookingStateFactory";
import {
  validateBubbleSelections,
  validateBubbleStayDates,
  validateDayUseDates,
  validateFullBookingReadiness,
  validateGuestDetails,
  validateProductStep,
} from "./bookingValidation";
import type {
  AccommodationTypeMeta,
  AssignmentMode,
  BookingCatalog,
  BookingState,
  BookingStepId,
  BubbleSelection,
  GuestDetailsState,
} from "./types";

export type { BookingCatalog };

function newSelectionKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useBookingState(
  catalog: BookingCatalog,
  options: {
    dayUsePricePerGuest?: number | null;
    dayUseActive?: boolean | null;
  } = {}
) {
  const { dayUsePricePerGuest = null, dayUseActive = null } = options;
  const [state, setState] = useState<BookingState>(() =>
    createInitialBookingState()
  );

  const accommodationTypes = catalog.accommodationTypes;
  const activeSteps = useMemo(
    () => getActiveSteps(state.productType),
    [state.productType]
  );
  const currentStep = useMemo(
    () => getStepDefinition(state.productType, state.currentStepIndex),
    [state.productType, state.currentStepIndex]
  );

  const setProductType = useCallback((type: BookingProductType) => {
    setState((prev) => {
      if (prev.productType === type) {
        return { ...prev, productType: type, submissionError: null };
      }
      return {
        ...prev,
        productType: type,
        currentStepIndex: 0,
        dayUse:
          type === "day_use" ? prev.dayUse : createEmptyDayUseState(),
        bubbleStay:
          type === "bubble_stay"
            ? prev.bubbleStay
            : createEmptyBubbleStayState(),
        bookingStatus: "idle",
        bookingReference: null,
        submissionError: null,
      };
    });
  }, []);

  const setVisitDate = useCallback((visitDate: string | null) => {
    setState((prev) => ({
      ...prev,
      dayUse: { ...prev.dayUse, visitDate },
      submissionError: null,
    }));
  }, []);

  const setDayUseGuests = useCallback((guests: number) => {
    setState((prev) => ({
      ...prev,
      dayUse: {
        ...prev.dayUse,
        guests: Math.max(1, Math.floor(guests) || 1),
      },
      submissionError: null,
    }));
  }, []);

  const setCheckIn = useCallback((checkIn: string | null) => {
    setState((prev) => ({
      ...prev,
      bubbleStay: clearManualBubbleIds({
        ...prev.bubbleStay,
        checkIn,
      }),
      submissionError: null,
    }));
  }, []);

  const setCheckOut = useCallback((checkOut: string | null) => {
    setState((prev) => ({
      ...prev,
      bubbleStay: clearManualBubbleIds({
        ...prev.bubbleStay,
        checkOut,
      }),
      submissionError: null,
    }));
  }, []);

  const setBubbleStayDates = useCallback(
    (patch: { checkIn?: string | null; checkOut?: string | null }) => {
      setState((prev) => {
        const next = {
          ...prev.bubbleStay,
          ...(patch.checkIn !== undefined ? { checkIn: patch.checkIn } : {}),
          ...(patch.checkOut !== undefined ? { checkOut: patch.checkOut } : {}),
        };
        const datesChanged =
          (patch.checkIn !== undefined && patch.checkIn !== prev.bubbleStay.checkIn) ||
          (patch.checkOut !== undefined &&
            patch.checkOut !== prev.bubbleStay.checkOut);
        return {
          ...prev,
          bubbleStay: datesChanged ? clearManualBubbleIds(next) : next,
          submissionError: null,
        };
      });
    },
    []
  );

  const setBubbleStayGuests = useCallback((totalGuests: number) => {
    setState((prev) => ({
      ...prev,
      bubbleStay: {
        ...prev.bubbleStay,
        totalGuests: Math.max(1, Math.floor(totalGuests) || 1),
      },
      submissionError: null,
    }));
  }, []);

  const addBubbleSelection = useCallback(
    (input: {
      accommodationTypeId: number;
      accommodationSlug: string;
      guests?: number;
      assignmentMode?: AssignmentMode;
      bubbleId?: number;
    }) => {
      setState((prev) => {
        const mode = input.assignmentMode ?? "random";
        const selection: BubbleSelection = {
          key: newSelectionKey(),
          accommodationTypeId: input.accommodationTypeId,
          accommodationSlug: input.accommodationSlug,
          guests: Math.max(1, input.guests ?? 1),
          assignmentMode: mode,
          ...(mode === "manual" && input.bubbleId != null
            ? { bubbleId: input.bubbleId }
            : {}),
        };
        return {
          ...prev,
          bubbleStay: {
            ...prev.bubbleStay,
            selections: [...prev.bubbleStay.selections, selection],
          },
          submissionError: null,
        };
      });
    },
    []
  );

  const updateBubbleSelection = useCallback(
    (
      key: string,
      patch: Partial<{
        accommodationTypeId: number;
        accommodationSlug: string;
        guests: number;
        assignmentMode: AssignmentMode;
        bubbleId: number | null;
      }>
    ) => {
      setState((prev) => ({
        ...prev,
        bubbleStay: {
          ...prev.bubbleStay,
          selections: prev.bubbleStay.selections.map((selection) => {
            if (selection.key !== key) return selection;
            const nextMode = patch.assignmentMode ?? selection.assignmentMode;
            const next: BubbleSelection = {
              key: selection.key,
              accommodationTypeId:
                patch.accommodationTypeId ?? selection.accommodationTypeId,
              accommodationSlug:
                patch.accommodationSlug ?? selection.accommodationSlug,
              guests:
                patch.guests != null
                  ? Math.max(1, Math.floor(patch.guests) || 1)
                  : selection.guests,
              assignmentMode: nextMode,
            };

            if (nextMode === "random") {
              return next;
            }

            // manual
            if (patch.assignmentMode === "manual" && !("bubbleId" in patch)) {
              // Switching random → manual: do not auto-select a physical bubble.
              return next;
            }
            if ("bubbleId" in patch) {
              if (patch.bubbleId != null) {
                next.bubbleId = patch.bubbleId;
              }
              return next;
            }
            if (selection.bubbleId != null) {
              next.bubbleId = selection.bubbleId;
            }
            return next;
          }),
        },
        submissionError: null,
      }));
    },
    []
  );

  const removeBubbleSelection = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      bubbleStay: {
        ...prev.bubbleStay,
        selections: prev.bubbleStay.selections.filter((s) => s.key !== key),
      },
      submissionError: null,
    }));
  }, []);

  const clearBubbleSelections = useCallback(() => {
    setState((prev) => ({
      ...prev,
      bubbleStay: { ...prev.bubbleStay, selections: [] },
      submissionError: null,
    }));
  }, []);

  const setGuestField = useCallback(
    <K extends keyof GuestDetailsState>(field: K, value: GuestDetailsState[K]) => {
      setState((prev) => ({
        ...prev,
        guest: { ...prev.guest, [field]: value },
        submissionError: null,
      }));
    },
    []
  );

  const setGuestDetails = useCallback((patch: Partial<GuestDetailsState>) => {
    setState((prev) => ({
      ...prev,
      guest: { ...prev.guest, ...patch },
      submissionError: null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const steps = getActiveSteps(prev.productType);
      const max = steps.length - 1;
      return {
        ...prev,
        currentStepIndex: Math.min(prev.currentStepIndex + 1, max),
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setState((prev) => {
      if (stepIndex < 0 || stepIndex > prev.currentStepIndex) return prev;
      return { ...prev, currentStepIndex: stepIndex };
    });
  }, []);

  const goToStepId = useCallback((stepId: BookingStepId) => {
    setState((prev) => {
      const steps = getActiveSteps(prev.productType);
      const index = steps.findIndex((s) => s.id === stepId);
      // Allow navigating to any prior/current step (e.g. 409 → bubbles from review).
      if (index < 0 || index > prev.currentStepIndex) return prev;
      return { ...prev, currentStepIndex: index };
    });
  }, []);

  /** Force jump used for conflict recovery / restart paths. */
  const jumpToStepId = useCallback((stepId: BookingStepId) => {
    setState((prev) => {
      const steps = getActiveSteps(prev.productType);
      const index = steps.findIndex((s) => s.id === stepId);
      if (index < 0) return prev;
      return { ...prev, currentStepIndex: index };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setState(createInitialBookingState());
  }, []);

  /** After 409 conflict — clear physical bubble picks; keep dates/guests. */
  const clearStaleBubbleInventory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      bubbleStay: clearManualBubbleIds(prev.bubbleStay),
      submissionError: null,
    }));
  }, []);

  const setSubmissionError = useCallback((message: string | null) => {
    setState((prev) => ({
      ...prev,
      submissionError: message,
      bookingStatus: message ? "failed" : prev.bookingStatus,
    }));
  }, []);

  const markBookingCreated = useCallback((reference: string) => {
    setState((prev) => ({
      ...prev,
      bookingStatus: "submitted",
      bookingReference: reference,
      submissionError: null,
    }));
  }, []);

  const canProceed = useCallback(
    (stepIndex = state.currentStepIndex): boolean => {
      const step = getStepDefinition(state.productType, stepIndex);

      switch (step.id) {
        case "product":
          return validateProductStep(state).length === 0;
        case "date_guests":
          if (dayUseActive === false) return false;
          return validateDayUseDates(state.dayUse).length === 0;
        case "dates_guests":
          return validateBubbleStayDates(state.bubbleStay).length === 0;
        case "bubbles":
          return (
            validateBubbleSelections(
              state.bubbleStay.selections,
              accommodationTypes,
              state.bubbleStay.totalGuests
            ).length === 0
          );
        case "guest_details":
          return validateGuestDetails(state.guest).length === 0;
        case "review":
          if (state.productType === "day_use" && dayUseActive === false) {
            return false;
          }
          return (
            validateFullBookingReadiness(state, accommodationTypes).length === 0
          );
        default:
          return false;
      }
    },
    [state, accommodationTypes, dayUseActive]
  );

  const derived = useMemo(
    () => ({
      allocatedGuests: selectAllocatedGuests(state),
      remainingGuests: selectRemainingGuests(state),
      isGuestAllocationComplete: selectIsGuestAllocationComplete(state),
      estimatedTotal: selectEstimatedTotal(
        state,
        accommodationTypes,
        dayUsePricePerGuest
      ),
      dayUseBookingInput: getDayUseBookingInput(state),
      bubbleStayBookingInput: getBubbleStayBookingInput(state),
      readinessIssues: validateFullBookingReadiness(state, accommodationTypes),
    }),
    [state, accommodationTypes, dayUsePricePerGuest]
  );

  return {
    state,
    catalog,
    accommodationTypes,
    activeSteps,
    currentStep,
    currentStepIndex: state.currentStepIndex,
    derived,
    setProductType,
    setVisitDate,
    setDayUseGuests,
    setCheckIn,
    setCheckOut,
    setBubbleStayDates,
    setBubbleStayGuests,
    addBubbleSelection,
    updateBubbleSelection,
    removeBubbleSelection,
    clearBubbleSelections,
    setGuestField,
    setGuestDetails,
    nextStep,
    previousStep,
    prevStep: previousStep,
    goToStep,
    goToStepId,
    jumpToStepId,
    resetBooking,
    clearStaleBubbleInventory,
    setSubmissionError,
    markBookingCreated,
    canProceed,
  };
}

export function findAccommodationMeta(
  types: AccommodationTypeMeta[],
  id: number
): AccommodationTypeMeta | undefined {
  return types.find((t) => t.id === id);
}
