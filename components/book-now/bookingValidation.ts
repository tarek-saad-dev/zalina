import type {
  AccommodationTypeMeta,
  BookingState,
  BookingValidationIssue,
  BubbleSelection,
  BubbleStayState,
  DayUseState,
  GuestDetailsState,
} from "./types";

/** Local calendar YYYY-MM-DD for "today" (no timezone shift via toISOString). */
export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Reservations are intentionally opened starting from this date.
 * Keep it hardcoded until product requirements change.
 */
export const HARDCODED_BOOKING_START_DATE = "2026-12-01";

export function isIsoDateString(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function compareIsoDates(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function getBookingMinDate(now = new Date()): string {
  const today = todayIsoDate(now);
  return compareIsoDates(today, HARDCODED_BOOKING_START_DATE) > 0
    ? today
    : HARDCODED_BOOKING_START_DATE;
}

export function isDateOnOrAfterToday(
  date: string,
  now = new Date()
): boolean {
  return isIsoDateString(date) && compareIsoDates(date, getBookingMinDate(now)) >= 0;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!isIsoDateString(checkIn) || !isIsoDateString(checkOut)) return 0;
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  const start = Date.UTC(y1, m1 - 1, d1);
  const end = Date.UTC(y2, m2 - 1, d2);
  const nights = Math.round((end - start) / 86_400_000);
  return nights > 0 ? nights : 0;
}

export function getAllocatedGuests(selections: BubbleSelection[]): number {
  return selections.reduce((sum, s) => sum + (Number.isFinite(s.guests) ? s.guests : 0), 0);
}

export function getRemainingGuests(
  totalGuests: number,
  selections: BubbleSelection[]
): number {
  return totalGuests - getAllocatedGuests(selections);
}

export function isGuestAllocationComplete(
  totalGuests: number,
  selections: BubbleSelection[]
): boolean {
  return (
    selections.length > 0 &&
    getAllocatedGuests(selections) === totalGuests
  );
}

export function validateDayUseDates(
  dayUse: DayUseState,
  now = new Date()
): BookingValidationIssue[] {
  const issues: BookingValidationIssue[] = [];
  if (!isIsoDateString(dayUse.visitDate) || !isDateOnOrAfterToday(dayUse.visitDate, now)) {
    issues.push({
      code: "invalid_visit_date",
      message: `Choose a visit date on or after ${getBookingMinDate(now)}.`,
      field: "visitDate",
    });
  }
  if (!Number.isInteger(dayUse.guests) || dayUse.guests < 1) {
    issues.push({
      code: "invalid_guest_count",
      message: "Guests must be at least 1.",
      field: "guests",
    });
  }
  return issues;
}

export function validateBubbleStayDates(
  bubbleStay: BubbleStayState,
  now = new Date()
): BookingValidationIssue[] {
  const issues: BookingValidationIssue[] = [];
  const { checkIn, checkOut, totalGuests } = bubbleStay;

  if (!isIsoDateString(checkIn) || !isDateOnOrAfterToday(checkIn, now)) {
    issues.push({
      code: "invalid_check_in",
      message: `Check-in must be on or after ${getBookingMinDate(now)}.`,
      field: "checkIn",
    });
  }
  if (!isIsoDateString(checkOut)) {
    issues.push({
      code: "invalid_check_out",
      message: "Choose a check-out date.",
      field: "checkOut",
    });
  } else if (isIsoDateString(checkIn) && compareIsoDates(checkOut, checkIn) <= 0) {
    issues.push({
      code: "check_out_not_after_check_in",
      message: "Check-out must be after check-in.",
      field: "checkOut",
    });
  }
  if (!Number.isInteger(totalGuests) || totalGuests < 1) {
    issues.push({
      code: "invalid_guest_count",
      message: "Total guests must be at least 1.",
      field: "totalGuests",
    });
  }
  return issues;
}

export function validateBubbleSelections(
  selections: BubbleSelection[],
  accommodationTypes: AccommodationTypeMeta[],
  totalGuests: number
): BookingValidationIssue[] {
  const issues: BookingValidationIssue[] = [];
  const byId = new Map(accommodationTypes.map((t) => [t.id, t]));

  if (selections.length === 0) {
    issues.push({
      code: "no_bubble_selections",
      message: "Add at least one bubble selection.",
    });
    return issues;
  }

  const allocated = getAllocatedGuests(selections);
  if (allocated > totalGuests) {
    issues.push({
      code: "guest_over_allocated",
      message: `Allocated guests (${allocated}) exceed total guests (${totalGuests}).`,
    });
  } else if (allocated < totalGuests) {
    issues.push({
      code: "guest_under_allocated",
      message: `Allocate all guests (${allocated} of ${totalGuests}).`,
    });
  }

  const hasManual = selections.some((s) => s.assignmentMode === "manual");
  const hasRandom = selections.some((s) => s.assignmentMode === "random");
  if (hasManual && hasRandom) {
    issues.push({
      code: "mixed_assignment_modes",
      message:
        "Use Choose your bubble or Let Zalina select for every bubble — not both in one booking.",
    });
  }

  const seenBubbleIds = new Set<number>();

  for (const selection of selections) {
    const type = byId.get(selection.accommodationTypeId);
    if (!type) {
      issues.push({
        code: "missing_accommodation_type",
        message: "Unknown accommodation type selection.",
        selectionKey: selection.key,
      });
      continue;
    }

    if (!Number.isInteger(selection.guests) || selection.guests < 1) {
      issues.push({
        code: "selection_guests_min",
        message: "Each bubble must have at least 1 guest.",
        selectionKey: selection.key,
      });
    } else if (selection.guests > type.max_guests) {
      issues.push({
        code: "selection_guests_over_capacity",
        message: `Guests exceed max capacity (${type.max_guests}) for this type.`,
        selectionKey: selection.key,
      });
    }

    if (selection.assignmentMode === "manual") {
      if (selection.bubbleId == null) {
        issues.push({
          code: "missing_manual_bubble_id",
          message: "Manual assignment requires a physical bubble.",
          selectionKey: selection.key,
        });
      } else if (seenBubbleIds.has(selection.bubbleId)) {
        issues.push({
          code: "duplicate_manual_bubble",
          message: "The same physical bubble cannot be selected twice.",
          selectionKey: selection.key,
        });
      } else {
        seenBubbleIds.add(selection.bubbleId);
      }
    } else if (selection.bubbleId != null) {
      issues.push({
        code: "random_has_bubble_id",
        message: "Random assignment must not include a bubble id.",
        selectionKey: selection.key,
      });
    }
  }

  return issues;
}

export function validateGuestDetails(
  guest: GuestDetailsState
): BookingValidationIssue[] {
  const issues: BookingValidationIssue[] = [];
  if (!guest.name.trim()) {
    issues.push({
      code: "invalid_guest_name",
      message: "Name is required.",
      field: "name",
    });
  }
  const email = guest.email.trim();
  if (!email.includes("@") || !email.includes(".")) {
    issues.push({
      code: "invalid_guest_email",
      message: "Enter a valid email address.",
      field: "email",
    });
  }
  if (!guest.phone.trim()) {
    issues.push({
      code: "invalid_guest_phone",
      message: "Phone is required.",
      field: "phone",
    });
  }
  return issues;
}

export function validateProductStep(
  state: BookingState
): BookingValidationIssue[] {
  if (!state.productType) {
    return [
      {
        code: "missing_product",
        message: "Choose Day Use or Bubble Stay.",
        field: "productType",
      },
    ];
  }
  return [];
}

export function validateFullBookingReadiness(
  state: BookingState,
  accommodationTypes: AccommodationTypeMeta[],
  now = new Date()
): BookingValidationIssue[] {
  const issues = [...validateProductStep(state)];
  if (!state.productType) return issues;

  if (state.productType === "day_use") {
    issues.push(...validateDayUseDates(state.dayUse, now));
  } else {
    issues.push(...validateBubbleStayDates(state.bubbleStay, now));
    issues.push(
      ...validateBubbleSelections(
        state.bubbleStay.selections,
        accommodationTypes,
        state.bubbleStay.totalGuests
      )
    );
  }

  issues.push(...validateGuestDetails(state.guest));
  return issues;
}
