import type {
  CreateBubbleStayManualPayload,
  CreateBubbleStayRandomPayload,
  CreateDayUseBookingPayload,
} from "@/lib/api";
import {
  buildBubbleStayManualPayload,
  buildBubbleStayRandomPayload,
  buildDayUseBookingPayload,
} from "@/lib/api";
import type {
  AccommodationTypeMeta,
  BookingState,
  BubbleSelection,
} from "./types";
import {
  getAllocatedGuests,
  getRemainingGuests,
  isGuestAllocationComplete,
  nightsBetween,
  validateFullBookingReadiness,
} from "./bookingValidation";

export function selectAllocatedGuests(state: BookingState): number {
  return getAllocatedGuests(state.bubbleStay.selections);
}

export function selectRemainingGuests(state: BookingState): number {
  return getRemainingGuests(
    state.bubbleStay.totalGuests,
    state.bubbleStay.selections
  );
}

export function selectIsGuestAllocationComplete(state: BookingState): boolean {
  return isGuestAllocationComplete(
    state.bubbleStay.totalGuests,
    state.bubbleStay.selections
  );
}

/**
 * Client-side estimate only — not authoritative.
 * Final total comes from POST /bookings (serverBookingTotal later).
 */
export function selectEstimatedTotal(
  state: BookingState,
  accommodationTypes: AccommodationTypeMeta[],
  dayUsePricePerGuest?: number | null
): number | null {
  if (state.productType === "day_use") {
    if (
      dayUsePricePerGuest == null ||
      !Number.isFinite(dayUsePricePerGuest) ||
      state.dayUse.guests < 1
    ) {
      return null;
    }
    return dayUsePricePerGuest * state.dayUse.guests;
  }

  if (state.productType !== "bubble_stay") return null;

  const { checkIn, checkOut, selections } = state.bubbleStay;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  if (nights < 1 || selections.length === 0) return null;

  const byId = new Map(accommodationTypes.map((t) => [t.id, t]));
  let total = 0;
  for (const selection of selections) {
    const type = byId.get(selection.accommodationTypeId);
    if (!type) return null;
    const price = Number.parseFloat(type.price_per_night);
    if (!Number.isFinite(price)) return null;
    total += price * nights;
  }
  return total;
}

/** Domain input for future createDayUseBooking — does not POST. */
export function getDayUseBookingInput(
  state: BookingState
): CreateDayUseBookingPayload | null {
  if (state.productType !== "day_use") return null;
  if (!state.dayUse.visitDate) return null;
  if (state.dayUse.guests < 1) return null;
  if (!state.guest.name.trim() || !state.guest.email.trim() || !state.guest.phone.trim()) {
    return null;
  }

  return buildDayUseBookingPayload({
    visit_date: state.dayUse.visitDate,
    guests: state.dayUse.guests,
    guest_name: state.guest.name.trim(),
    guest_email: state.guest.email.trim(),
    guest_phone: state.guest.phone.replace(/\s+/g, " ").trim(),
  });
}

function bubbleLinesReady(selections: BubbleSelection[]): boolean {
  if (selections.length === 0) return false;
  return selections.every((s) => {
    if (s.guests < 1) return false;
    if (s.assignmentMode === "manual") return s.bubbleId != null;
    return s.bubbleId == null;
  });
}

/**
 * Domain input for future createBubbleStayBooking — does not POST.
 * Returns null until selections are allocation-complete and mode-consistent.
 */
export function getBubbleStayBookingInput(
  state: BookingState
): CreateBubbleStayManualPayload | CreateBubbleStayRandomPayload | null {
  if (state.productType !== "bubble_stay") return null;
  const { checkIn, checkOut, totalGuests, selections } = state.bubbleStay;
  if (!checkIn || !checkOut || totalGuests < 1) return null;
  if (!isGuestAllocationComplete(totalGuests, selections)) return null;
  if (!bubbleLinesReady(selections)) return null;
  if (!state.guest.name.trim() || !state.guest.email.trim() || !state.guest.phone.trim()) {
    return null;
  }

  const guest = {
    guest_name: state.guest.name.trim(),
    guest_email: state.guest.email.trim(),
    guest_phone: state.guest.phone.replace(/\s+/g, " ").trim(),
  };

  const allRandom = selections.every((s) => s.assignmentMode === "random");
  const allManual = selections.every((s) => s.assignmentMode === "manual");

  // Mixed modes are not a single V2 create shape — defer until UI enforces one mode.
  if (!allRandom && !allManual) return null;

  if (allRandom) {
    return buildBubbleStayRandomPayload({
      check_in: checkIn,
      check_out: checkOut,
      guests: totalGuests,
      ...guest,
      bubbles: selections.map((s) => ({
        accommodation_type_id: s.accommodationTypeId,
        guests: s.guests,
      })),
    });
  }

  return buildBubbleStayManualPayload({
    check_in: checkIn,
    check_out: checkOut,
    guests: totalGuests,
    ...guest,
    bubbles: selections.map((s) => ({
      accommodation_type_id: s.accommodationTypeId,
      bubble_id: s.bubbleId as number,
      guests: s.guests,
    })),
  });
}

export function isBookingInputReady(
  state: BookingState,
  accommodationTypes: AccommodationTypeMeta[]
): boolean {
  return validateFullBookingReadiness(state, accommodationTypes).length === 0;
}
