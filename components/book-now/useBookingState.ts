"use client";

import { useState, useCallback } from "react";
import type {
  BookingState,
  JourneyType,
  DateSelection,
  PreferredPeriod,
  GuestContactDetails,
  EnhancementAddOn,
  BookingStatus,
} from "./types";
import { ENHANCEMENT_ADDONS, BOOKING_STEPS, OCCASION_OPTIONS } from "./mockData";

const TOTAL_STEPS = BOOKING_STEPS.length;

const emptyDateSelection: DateSelection = {
  checkIn: null,
  checkOut: null,
  date: null,
  timeSlot: null,
  preferredPeriod: null,
  nights: 0,
};

const emptyGuestDetails: GuestContactDetails = {
  fullName: "",
  phone: "",
  email: "",
  country: "",
  occasion: "none",
  specialRequests: "",
};

const initialState: BookingState = {
  currentStep: 1,
  journeyType: null,
  selectedItem: null,
  selectedItemTitle: null,
  selectedItemPrice: 0,
  selectedItemMaxGuests: null,
  selectedOccasionId: null,
  selectedOccasionTitle: null,
  isPrivateCustom: false,
  dateSelection: emptyDateSelection,
  guests: 2,
  participants: 2,
  estimatedGuests: 10,
  enhancements: ENHANCEMENT_ADDONS,
  guestDetails: emptyGuestDetails,
  baseTotal: 0,
  addOnsTotal: 0,
  estimatedTotal: 0,
  bookingStatus: "idle" as BookingStatus,
  bookingReference: null,
  paymentMode: "pay-now" as const,
  submissionError: null,
};

export function useBookingState() {
  const [state, setState] = useState<BookingState>(initialState);

  const nextStep = useCallback(() => {
    setState((prev) =>
      prev.currentStep < TOTAL_STEPS
        ? { ...prev, currentStep: prev.currentStep + 1 }
        : prev
    );
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) =>
      prev.currentStep > 1
        ? { ...prev, currentStep: prev.currentStep - 1 }
        : prev
    );
  }, []);

  const setJourneyType = useCallback((type: JourneyType) => {
    setState((prev) => ({
      ...prev,
      journeyType: type,
      selectedItem: null,
      selectedItemTitle: null,
      selectedItemPrice: 0,
      selectedItemMaxGuests: null,
      selectedOccasionId: null,
      selectedOccasionTitle: null,
      isPrivateCustom: type === "private",
      dateSelection: emptyDateSelection,
      baseTotal: 0,
      addOnsTotal: 0,
      estimatedTotal: 0,
    }));
  }, []);

  /* ── helper: recalculate addOnsTotal from current enhancements + guest count ── */
  function calcAddOnsTotal(
    enhancements: EnhancementAddOn[],
    guestCount: number
  ): number {
    return enhancements
      .filter((e) => e.selected)
      .reduce(
        (sum, e) =>
          sum + (e.pricingType === "per-guest" ? e.price * guestCount : e.price),
        0
      );
  }

  const setSelectedItem = useCallback(
    (id: string, title: string, price: number, maxGuests?: number) => {
      setState((prev) => {
        const clampedGuests =
          maxGuests != null ? Math.min(prev.guests, maxGuests) : prev.guests;
        const addOnsTotal = calcAddOnsTotal(prev.enhancements, clampedGuests);
        return {
          ...prev,
          selectedItem: id,
          selectedItemTitle: title,
          selectedItemPrice: price,
          selectedItemMaxGuests: maxGuests ?? null,
          guests: clampedGuests,
          dateSelection: emptyDateSelection,
          baseTotal: price,
          addOnsTotal,
          estimatedTotal: price + addOnsTotal,
        };
      });
    },
    []
  );

  const setSelectedOccasion = useCallback((id: string) => {
    const found = OCCASION_OPTIONS.find((o) => o.id === id);
    setState((prev) => ({
      ...prev,
      selectedOccasionId: id,
      selectedOccasionTitle: found?.title ?? id,
      selectedItem: id,
      selectedItemTitle: found?.title ?? id,
      baseTotal: 0,
      addOnsTotal: 0,
      estimatedTotal: 0,
    }));
  }, []);

  const setDateSelection = useCallback(
    (patch: Partial<DateSelection>) => {
      setState((prev) => {
        const next = { ...prev.dateSelection, ...patch };
        let base = prev.baseTotal;
        if (prev.journeyType === "stay" && next.checkIn && next.checkOut) {
          const parseLocal = (iso: string) => {
            const [y, m, d] = iso.split("-").map(Number);
            return new Date(y, m - 1, d).getTime();
          };
          const nights = Math.max(
            1,
            Math.round((parseLocal(next.checkOut) - parseLocal(next.checkIn)) / 86400000)
          );
          next.nights = nights;
          base = prev.selectedItemPrice * nights;
        } else if (prev.journeyType === "evening") {
          base = prev.selectedItemPrice * prev.participants;
        }
        const guestCount =
          prev.journeyType === "evening"
            ? prev.participants
            : prev.journeyType === "private"
            ? prev.estimatedGuests
            : prev.guests;
        const addOnsTotal = calcAddOnsTotal(prev.enhancements, guestCount);
        return {
          ...prev,
          dateSelection: next,
          baseTotal: base,
          addOnsTotal,
          estimatedTotal: base + addOnsTotal,
        };
      });
    },
    []
  );

  const setGuests = useCallback((count: number) => {
    setState((prev) => {
      const max = prev.selectedItemMaxGuests;
      const clamped = Math.max(1, max != null ? Math.min(count, max) : count);
      const addOnsTotal = calcAddOnsTotal(prev.enhancements, clamped);
      return {
        ...prev,
        guests: clamped,
        addOnsTotal,
        estimatedTotal: prev.baseTotal + addOnsTotal,
      };
    });
  }, []);

  const setParticipants = useCallback((count: number) => {
    setState((prev) => {
      const n = Math.max(1, count);
      const base = prev.selectedItemPrice * n;
      const addOnsTotal = calcAddOnsTotal(prev.enhancements, n);
      return {
        ...prev,
        participants: n,
        baseTotal: base,
        addOnsTotal,
        estimatedTotal: base + addOnsTotal,
      };
    });
  }, []);

  const setEstimatedGuests = useCallback((count: number) => {
    setState((prev) => {
      const n = Math.max(1, count);
      const addOnsTotal = calcAddOnsTotal(prev.enhancements, n);
      return {
        ...prev,
        estimatedGuests: n,
        addOnsTotal,
        estimatedTotal: prev.baseTotal + addOnsTotal,
      };
    });
  }, []);

  const setPreferredPeriod = useCallback((period: PreferredPeriod) => {
    setState((prev) => ({
      ...prev,
      dateSelection: { ...prev.dateSelection, preferredPeriod: period },
    }));
  }, []);

  const toggleEnhancement = useCallback((id: string) => {
    setState((prev) => {
      const enhancements = prev.enhancements.map((e) =>
        e.id === id ? { ...e, selected: !e.selected } : e
      );
      const guestCount =
        prev.journeyType === "evening"
          ? prev.participants
          : prev.journeyType === "private"
          ? prev.estimatedGuests
          : prev.guests;
      const addOnsTotal = calcAddOnsTotal(enhancements, guestCount);
      return {
        ...prev,
        enhancements,
        addOnsTotal,
        estimatedTotal: prev.isPrivateCustom ? 0 : prev.baseTotal + addOnsTotal,
      };
    });
  }, []);

  const setGuestDetails = useCallback(
    (patch: Partial<GuestContactDetails>) => {
      setState((prev) => ({
        ...prev,
        guestDetails: { ...prev.guestDetails, ...patch },
      }));
    },
    []
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) =>
      step >= 1 && step <= TOTAL_STEPS && step <= prev.currentStep
        ? { ...prev, currentStep: step }
        : prev
    );
  }, []);

  const submitMockBooking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      bookingStatus: "submitting",
      submissionError: null,
    }));
    setTimeout(() => {
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      setState((prev) => ({
        ...prev,
        bookingStatus: "submitted",
        bookingReference: prev.isPrivateCustom
          ? `ZAL-CON-${digits}`
          : `ZAL-${digits}`,
      }));
    }, 850);
  }, []);

  const resetBooking = useCallback(() => {
    setState(initialState);
  }, []);

  const canProceed = useCallback(
    (step: number): boolean => {
      if (step === 1) return state.journeyType !== null;
      if (step === 2) {
        if (state.isPrivateCustom) return state.selectedOccasionId !== null;
        return state.selectedItem !== null;
      }
      if (step === 3) {
        const ds = state.dateSelection;
        if (state.journeyType === "stay") {
          return (
            ds.checkIn !== null &&
            ds.checkOut !== null &&
            ds.nights >= 1 &&
            state.guests >= 1
          );
        }
        if (state.journeyType === "evening") {
          return ds.date !== null && ds.timeSlot !== null && state.participants >= 1;
        }
        if (state.journeyType === "private") {
          return (
            ds.date !== null &&
            state.estimatedGuests >= 1 &&
            ds.preferredPeriod !== null
          );
        }
        return false;
      }
      if (step === 4) return true;
      if (step === 5) {
        const g = state.guestDetails;
        const emailValid =
          g.email.includes("@") && g.email.includes(".");
        return (
          g.fullName.trim().length > 0 &&
          g.phone.trim().length > 0 &&
          emailValid &&
          g.country.trim().length > 0
        );
      }
      return true;
    },
    [
      state.journeyType,
      state.selectedItem,
      state.selectedOccasionId,
      state.isPrivateCustom,
      state.dateSelection,
      state.guests,
      state.participants,
      state.estimatedGuests,
      state.guestDetails,
    ]
  );

  return {
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
  };
}
