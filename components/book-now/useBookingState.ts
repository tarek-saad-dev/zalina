"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  BookingState,
  JourneyType,
  DateSelection,
  PreferredPeriod,
  GuestContactDetails,
  EnhancementAddOn,
  BookingStatus,
  StayOption,
  ExperienceOption,
  AvailabilityState,
} from "./types";
import { BOOKING_STEPS, OCCASION_OPTIONS } from "./mockData";
import {
  addOneDay,
  checkAvailability,
  createBooking,
  initiatePayment,
  ApiError,
} from "@/lib/api";

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

const idleAvailability: AvailabilityState = {
  status: "idle",
  message: null,
  totalEstimate: null,
  pricePerNight: null,
};

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

export interface BookingCatalog {
  stays: StayOption[];
  experiences: ExperienceOption[];
  addOns: EnhancementAddOn[];
}

export function useBookingState(catalog: BookingCatalog) {
  const initialState: BookingState = {
    currentStep: 1,
    journeyType: null,
    selectedItem: null,
    selectedItemTitle: null,
    selectedItemPrice: 0,
    selectedItemMaxGuests: null,
    selectedItemSlug: null,
    selectedItemApiId: null,
    selectedExperienceApiId: null,
    selectedExperienceZoneId: null,
    selectedOccasionId: null,
    selectedOccasionTitle: null,
    isPrivateCustom: false,
    dateSelection: emptyDateSelection,
    guests: 2,
    participants: 2,
    estimatedGuests: 10,
    enhancements: catalog.addOns,
    guestDetails: emptyGuestDetails,
    baseTotal: 0,
    addOnsTotal: 0,
    estimatedTotal: 0,
    bookingStatus: "idle" as BookingStatus,
    bookingReference: null,
    paymentMode: "pay-now" as const,
    submissionError: null,
    availability: idleAvailability,
  };

  const [state, setState] = useState<BookingState>(initialState);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  // Sync add-ons if server props arrive after mount (shouldn't normally)
  useEffect(() => {
    setState((prev) => {
      if (prev.enhancements.length > 0 || catalog.addOns.length === 0) {
        return prev;
      }
      return { ...prev, enhancements: catalog.addOns };
    });
  }, [catalog.addOns]);

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
      selectedItemSlug: null,
      selectedItemApiId: null,
      selectedExperienceApiId: null,
      selectedExperienceZoneId: null,
      selectedOccasionId: null,
      selectedOccasionTitle: null,
      isPrivateCustom: type === "private",
      dateSelection: emptyDateSelection,
      baseTotal: 0,
      addOnsTotal: 0,
      estimatedTotal: 0,
      availability: idleAvailability,
      submissionError: null,
    }));
  }, []);

  const setSelectedItem = useCallback(
    (
      id: string,
      title: string,
      price: number,
      maxGuests?: number,
      meta?: {
        slug?: string;
        apiId?: number;
        experienceApiId?: number;
        experienceZoneId?: number;
      }
    ) => {
      setState((prev) => {
        const clampedGuests =
          maxGuests != null ? Math.min(prev.guests, maxGuests) : prev.guests;
        const addOnsTotal = calcAddOnsTotal(prev.enhancements, clampedGuests);
        const isEvening = prev.journeyType === "evening";
        return {
          ...prev,
          selectedItem: id,
          selectedItemTitle: title,
          selectedItemPrice: price,
          selectedItemMaxGuests: maxGuests ?? null,
          selectedItemSlug: meta?.slug ?? null,
          selectedItemApiId: isEvening ? null : meta?.apiId ?? null,
          selectedExperienceApiId: isEvening
            ? meta?.experienceApiId ?? meta?.apiId ?? null
            : null,
          selectedExperienceZoneId: isEvening
            ? meta?.experienceZoneId ?? null
            : null,
          guests: clampedGuests,
          dateSelection: emptyDateSelection,
          baseTotal: price,
          addOnsTotal,
          estimatedTotal: prev.isPrivateCustom ? 0 : price + addOnsTotal,
          availability: idleAvailability,
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
            Math.round(
              (parseLocal(next.checkOut) - parseLocal(next.checkIn)) / 86400000
            )
          );
          next.nights = nights;
          base = prev.selectedItemPrice * nights;
        } else if (prev.journeyType === "evening") {
          base = prev.selectedItemPrice * prev.participants;
        } else if (prev.journeyType === "private" && next.checkIn && next.checkOut) {
          const parseLocal = (iso: string) => {
            const [y, m, d] = iso.split("-").map(Number);
            return new Date(y, m - 1, d).getTime();
          };
          const nights = Math.max(
            1,
            Math.round(
              (parseLocal(next.checkOut) - parseLocal(next.checkIn)) / 86400000
            )
          );
          next.nights = nights;
          base = prev.selectedItemPrice * nights;
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
          estimatedTotal: prev.isPrivateCustom ? 0 : base + addOnsTotal,
        };
      });
    },
    []
  );

  // Live availability for stay (and private stay) date ranges
  useEffect(() => {
    const slug = state.selectedItemSlug;
    const checkIn = state.dateSelection.checkIn;
    const checkOut = state.dateSelection.checkOut;
    const needsAvail =
      (state.journeyType === "stay" || state.journeyType === "private") &&
      !!slug &&
      !!checkIn &&
      !!checkOut;

    if (!needsAvail) {
      return;
    }

    let cancelled = false;
    setState((prev) => ({
      ...prev,
      availability: {
        status: "loading",
        message: "Checking availability…",
        totalEstimate: null,
        pricePerNight: null,
      },
    }));

    checkAvailability(slug!, {
      check_in: checkIn!,
      check_out: checkOut!,
      guests: state.guests,
    })
      .then((data) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          availability: {
            status: data.availability ? "available" : "unavailable",
            message: data.availability
              ? `Available · estimate ${data.total_estimate} EGP`
              : "These dates are unavailable for this stay.",
            totalEstimate: Number.parseFloat(data.total_estimate) || null,
            pricePerNight: Number.parseFloat(data.price_per_night) || null,
          },
          baseTotal: data.availability
            ? Number.parseFloat(data.total_estimate) || prev.baseTotal
            : prev.baseTotal,
          estimatedTotal: prev.isPrivateCustom
            ? 0
            : (data.availability
                ? Number.parseFloat(data.total_estimate) || prev.baseTotal
                : prev.baseTotal) + prev.addOnsTotal,
        }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Could not verify availability.";
        setState((prev) => ({
          ...prev,
          availability: {
            status: "error",
            message,
            totalEstimate: null,
            pricePerNight: null,
          },
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [
    state.journeyType,
    state.selectedItemSlug,
    state.dateSelection.checkIn,
    state.dateSelection.checkOut,
    state.guests,
  ]);

  const setGuests = useCallback((count: number) => {
    setState((prev) => {
      const max = prev.selectedItemMaxGuests;
      const clamped = Math.max(1, max != null ? Math.min(count, max) : count);
      const addOnsTotal = calcAddOnsTotal(prev.enhancements, clamped);
      return {
        ...prev,
        guests: clamped,
        addOnsTotal,
        estimatedTotal: prev.isPrivateCustom
          ? 0
          : prev.baseTotal + addOnsTotal,
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
        estimatedTotal: prev.isPrivateCustom
          ? 0
          : prev.baseTotal + addOnsTotal,
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

  const resolveAccommodation = useCallback(
    (prev: BookingState): StayOption | null => {
      const stays = catalogRef.current.stays;
      if (prev.journeyType === "stay" || prev.journeyType === "private") {
        return (
          stays.find((s) => String(s.apiId) === prev.selectedItem) ??
          stays.find((s) => s.id === prev.selectedItem) ??
          null
        );
      }
      if (prev.journeyType === "evening") {
        const zoneId = prev.selectedExperienceZoneId;
        if (zoneId) {
          const match = stays.find((s) => s.zoneId === zoneId);
          if (match) return match;
        }
        const exp = catalogRef.current.experiences.find(
          (e) => e.apiId === prev.selectedExperienceApiId
        );
        if (exp?.zoneId) {
          const match = stays.find((s) => s.zoneId === exp.zoneId);
          if (match) return match;
        }
        return stays[0] ?? null;
      }
      return null;
    },
    []
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const submitBooking = useCallback(async () => {
    const snapshot = stateRef.current;

    setState((prev) => ({
      ...prev,
      bookingStatus: "submitting",
      submissionError: null,
    }));

    try {
      const stay = resolveAccommodation(snapshot);
      if (!stay) {
        throw new ApiError(
          "Please select a stay. Bookings require an accommodation.",
          422
        );
      }

      let checkIn = snapshot.dateSelection.checkIn;
      let checkOut = snapshot.dateSelection.checkOut;
      let guests = snapshot.guests;

      if (snapshot.journeyType === "evening") {
        const day = snapshot.dateSelection.date;
        if (!day) throw new ApiError("Please select an experience date.", 422);
        checkIn = day;
        checkOut = addOneDay(day);
        guests = snapshot.participants;
      } else if (snapshot.journeyType === "private") {
        if (snapshot.dateSelection.date && !checkIn) {
          checkIn = snapshot.dateSelection.date;
          checkOut = addOneDay(snapshot.dateSelection.date);
        }
        guests = Math.max(snapshot.guests, 1);
      }

      if (!checkIn || !checkOut) {
        throw new ApiError("Please select check-in and check-out dates.", 422);
      }

      const accommodationId =
        snapshot.selectedItemApiId ?? stay.apiId ?? Number(stay.id);
      if (!Number.isFinite(accommodationId) || accommodationId <= 0) {
        throw new ApiError("Could not resolve the selected stay.", 422);
      }

      const add_ons = snapshot.enhancements
        .filter((e) => e.selected)
        .map((e) => {
          const id = e.apiId ?? Number(e.id);
          return {
            id,
            quantity: e.pricingType === "per-guest" ? guests : 1,
          };
        })
        .filter((e) => Number.isFinite(e.id) && e.id > 0);

      const experiences =
        snapshot.journeyType === "evening" && snapshot.selectedExperienceApiId
          ? [
              {
                id: snapshot.selectedExperienceApiId,
                participants: snapshot.participants,
                date: snapshot.dateSelection.date || checkIn,
              },
            ]
          : undefined;

      const booking = await createBooking({
        accommodation_id: accommodationId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests,
        guest_name: snapshot.guestDetails.fullName.trim(),
        guest_email: snapshot.guestDetails.email.trim(),
        guest_phone: snapshot.guestDetails.phone.replace(/\s+/g, " ").trim(),
        add_ons: add_ons.length ? add_ons : undefined,
        experiences,
      });

      const gateway =
        (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY as "paymob" | "mock") ||
        "paymob";

      try {
        const payment = await initiatePayment(
          booking.booking_reference,
          gateway
        );
        if (payment.payment_url) {
          setState((prev) => ({
            ...prev,
            bookingReference: booking.booking_reference,
            bookingStatus: "submitting",
          }));
          window.location.assign(payment.payment_url);
          return;
        }
        setState((prev) => ({
          ...prev,
          bookingStatus: "submitted",
          bookingReference: booking.booking_reference,
          submissionError: `Booking held as ${booking.booking_reference}, but payment failed: Payment session did not include a checkout URL.`,
        }));
        return;
      } catch (payErr: unknown) {
        const payMessage =
          payErr instanceof ApiError
            ? payErr.message
            : "Payment could not be started.";
        setState((prev) => ({
          ...prev,
          bookingStatus: "submitted",
          bookingReference: booking.booking_reference,
          submissionError: `Booking held as ${booking.booking_reference}, but payment failed: ${payMessage}`,
        }));
        return;
      }
    } catch (err: unknown) {
      let message =
        err instanceof ApiError
          ? err.message
          : "Booking failed. Please try again.";
      if (err instanceof ApiError && err.errors) {
        const details = Object.values(err.errors).flat().filter(Boolean);
        if (details.length) message = `${message} ${details.join(" ")}`;
      }
      setState((prev) => ({
        ...prev,
        bookingStatus: "failed",
        submissionError: message,
      }));
    }
  }, [resolveAccommodation]);

  const resetBooking = useCallback(() => {
    setState({
      currentStep: 1,
      journeyType: null,
      selectedItem: null,
      selectedItemTitle: null,
      selectedItemPrice: 0,
      selectedItemMaxGuests: null,
      selectedItemSlug: null,
      selectedItemApiId: null,
      selectedExperienceApiId: null,
      selectedExperienceZoneId: null,
      selectedOccasionId: null,
      selectedOccasionTitle: null,
      isPrivateCustom: false,
      dateSelection: emptyDateSelection,
      guests: 2,
      participants: 2,
      estimatedGuests: 10,
      enhancements: catalogRef.current.addOns,
      guestDetails: emptyGuestDetails,
      baseTotal: 0,
      addOnsTotal: 0,
      estimatedTotal: 0,
      bookingStatus: "idle",
      bookingReference: null,
      paymentMode: "pay-now",
      submissionError: null,
      availability: idleAvailability,
    });
  }, []);

  const canProceed = useCallback(
    (step: number): boolean => {
      if (step === 1) return state.journeyType !== null;
      if (step === 2) {
        if (state.journeyType === "private") {
          return (
            state.selectedOccasionId !== null && state.selectedItem !== null
          );
        }
        return state.selectedItem !== null;
      }
      if (step === 3) {
        const ds = state.dateSelection;
        if (state.journeyType === "stay") {
          const datesOk =
            ds.checkIn !== null &&
            ds.checkOut !== null &&
            ds.nights >= 1 &&
            state.guests >= 1;
          if (!datesOk) return false;
          if (
            state.availability.status === "unavailable" ||
            state.availability.status === "loading"
          ) {
            return false;
          }
          return true;
        }
        if (state.journeyType === "private") {
          const datesOk =
            ds.checkIn !== null &&
            ds.checkOut !== null &&
            ds.nights >= 1 &&
            state.guests >= 1 &&
            ds.preferredPeriod !== null;
          if (!datesOk) return false;
          if (
            state.availability.status === "unavailable" ||
            state.availability.status === "loading"
          ) {
            return false;
          }
          return true;
        }
        if (state.journeyType === "evening") {
          return (
            ds.date !== null &&
            ds.timeSlot !== null &&
            state.participants >= 1
          );
        }
        return false;
      }
      if (step === 4) return true;
      if (step === 5) {
        const g = state.guestDetails;
        const emailValid = g.email.includes("@") && g.email.includes(".");
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
      state.dateSelection,
      state.guests,
      state.participants,
      state.guestDetails,
      state.availability.status,
    ]
  );

  return {
    state,
    catalog,
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
  };
}
