import {
  BOOKING_STATE_SCHEMA_VERSION,
  type BookingState,
  type BubbleStayState,
  type DayUseState,
  type GuestDetailsState,
} from "./types";

export const BOOKING_STORAGE_KEY = "zalina.booking.state";

export function createEmptyDayUseState(): DayUseState {
  return {
    visitDate: null,
    guests: 1,
  };
}

export function createEmptyBubbleStayState(): BubbleStayState {
  return {
    checkIn: null,
    checkOut: null,
    totalGuests: 2,
    selections: [],
  };
}

export function createEmptyGuestState(): GuestDetailsState {
  return {
    name: "",
    email: "",
    phone: "",
  };
}

export function createInitialBookingState(): BookingState {
  return {
    schemaVersion: BOOKING_STATE_SCHEMA_VERSION,
    productType: null,
    currentStepIndex: 0,
    dayUse: createEmptyDayUseState(),
    bubbleStay: createEmptyBubbleStayState(),
    guest: createEmptyGuestState(),
    bookingStatus: "idle",
    bookingReference: null,
    submissionError: null,
  };
}

/**
 * Reject legacy V1 / unknown persisted blobs so they cannot corrupt V2 state.
 */
export function parsePersistedBookingState(raw: unknown): BookingState | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<BookingState> & Record<string, unknown>;

  if (candidate.schemaVersion !== BOOKING_STATE_SCHEMA_VERSION) {
    return null;
  }

  // Reject any V1 journey-shaped payload that might share the key.
  if (
    "journeyType" in candidate ||
    "selectedItem" in candidate ||
    "enhancements" in candidate ||
    "selectedExperienceApiId" in candidate
  ) {
    return null;
  }

  if (
    candidate.productType !== null &&
    candidate.productType !== "day_use" &&
    candidate.productType !== "bubble_stay"
  ) {
    return null;
  }

  return {
    ...createInitialBookingState(),
    ...candidate,
    schemaVersion: BOOKING_STATE_SCHEMA_VERSION,
    dayUse: {
      ...createEmptyDayUseState(),
      ...(candidate.dayUse ?? {}),
    },
    bubbleStay: {
      ...createEmptyBubbleStayState(),
      ...(candidate.bubbleStay ?? {}),
      selections: Array.isArray(candidate.bubbleStay?.selections)
        ? candidate.bubbleStay!.selections
        : [],
    },
    guest: {
      ...createEmptyGuestState(),
      ...(candidate.guest ?? {}),
    },
  };
}

/** Clear physical bubble IDs after date changes — date-specific availability is stale. */
export function clearManualBubbleIds(
  bubbleStay: BubbleStayState
): BubbleStayState {
  return {
    ...bubbleStay,
    selections: bubbleStay.selections.map((selection) => {
      if (selection.assignmentMode !== "manual") return selection;
      const { bubbleId: _removed, ...rest } = selection;
      return { ...rest, assignmentMode: "manual" as const };
    }),
  };
}
