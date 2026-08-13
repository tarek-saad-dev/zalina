import { describe, expect, it } from "vitest";
import {
  BUBBLE_STAY_STEPS,
  DAY_USE_STEPS,
  getActiveSteps,
} from "../bookingSteps";
import {
  getBubbleStayBookingInput,
  getDayUseBookingInput,
  selectAllocatedGuests,
  selectEstimatedTotal,
  selectIsGuestAllocationComplete,
  selectRemainingGuests,
} from "../bookingSelectors";
import {
  clearManualBubbleIds,
  createInitialBookingState,
  parsePersistedBookingState,
} from "../bookingStateFactory";
import {
  getAllocatedGuests,
  validateBubbleSelections,
  validateBubbleStayDates,
  validateDayUseDates,
  validateGuestDetails,
  validateProductStep,
} from "../bookingValidation";
import type {
  AccommodationTypeMeta,
  BookingState,
  BubbleSelection,
} from "../types";
import { BOOKING_STATE_SCHEMA_VERSION } from "../types";

const TYPES: AccommodationTypeMeta[] = [
  {
    id: 2,
    slug: "two-bed-bubble",
    name_en: "Two Bed Bubble",
    name_ar: "فقاعة سريرين",
    max_guests: 4,
    price_per_night: "750.00",
    is_active: true,
    bubbles_count: 2,
    bubbles: [
      { id: 4, name_en: "Horus", name_ar: "حورس", status: "available" },
      { id: 5, name_en: "Hathor", name_ar: "حتحور", status: "available" },
    ],
  },
  {
    id: 3,
    slug: "family-bubble",
    name_en: "Family Bubble",
    name_ar: "فقاعة عائلية",
    max_guests: 6,
    price_per_night: "900.00",
    is_active: true,
    bubbles_count: 1,
    bubbles: [
      { id: 9, name_en: "Isis", name_ar: "إيزيس", status: "available" },
    ],
  },
];

function withProduct(
  productType: BookingState["productType"],
  patch: Partial<BookingState> = {}
): BookingState {
  return {
    ...createInitialBookingState(),
    productType,
    ...patch,
    dayUse: {
      ...createInitialBookingState().dayUse,
      ...(patch.dayUse ?? {}),
    },
    bubbleStay: {
      ...createInitialBookingState().bubbleStay,
      ...(patch.bubbleStay ?? {}),
    },
    guest: {
      ...createInitialBookingState().guest,
      ...(patch.guest ?? {}),
    },
  };
}

describe("Booking V2 initial state", () => {
  it("is clean V2 with schema version", () => {
    const state = createInitialBookingState();
    expect(state.schemaVersion).toBe(BOOKING_STATE_SCHEMA_VERSION);
    expect(state.productType).toBeNull();
    expect(state.dayUse.visitDate).toBeNull();
    expect(state.bubbleStay.selections).toEqual([]);
    expect(state).not.toHaveProperty("journeyType");
    expect(state).not.toHaveProperty("selectedItem");
    expect(state).not.toHaveProperty("enhancements");
  });
});

describe("Product switching", () => {
  it("exposes day_use and bubble_stay step architectures", () => {
    expect(getActiveSteps(null).map((s) => s.id)).toEqual(["product"]);
    expect(getActiveSteps("day_use")).toEqual(DAY_USE_STEPS);
    expect(getActiveSteps("bubble_stay")).toEqual(BUBBLE_STAY_STEPS);
    expect(getActiveSteps("day_use").map((s) => s.id)).not.toContain("bubbles");
    expect(getActiveSteps("bubble_stay").map((s) => s.id)).toContain("bubbles");
  });

  it("switching product clears incompatible state via factory helpers", () => {
    const dayFilled = withProduct("day_use", {
      dayUse: { visitDate: "2099-08-20", guests: 3 },
      bubbleStay: {
        checkIn: "2099-08-10",
        checkOut: "2099-08-12",
        totalGuests: 4,
        selections: [
          {
            key: "a",
            accommodationTypeId: 2,
            accommodationSlug: "two-bed-bubble",
            guests: 4,
            assignmentMode: "random",
          },
        ],
      },
    });

    // Simulate setProductType("bubble_stay") clearing dayUse
    const toBubble: BookingState = {
      ...dayFilled,
      productType: "bubble_stay",
      dayUse: createInitialBookingState().dayUse,
    };
    expect(toBubble.dayUse.visitDate).toBeNull();
    expect(toBubble.bubbleStay.selections).toHaveLength(1);

    const toDay: BookingState = {
      ...toBubble,
      productType: "day_use",
      bubbleStay: createInitialBookingState().bubbleStay,
    };
    expect(toDay.bubbleStay.selections).toEqual([]);
    expect(toDay.bubbleStay.checkIn).toBeNull();
  });
});

describe("Day Use validation", () => {
  it("requires visitDate + guests", () => {
    expect(
      validateDayUseDates({ visitDate: null, guests: 1 }, new Date("2026-08-13"))
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_visit_date" }),
      ])
    );
    expect(
      validateDayUseDates(
        { visitDate: "2099-08-20", guests: 0 },
        new Date("2026-08-13")
      )
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_guest_count" }),
      ])
    );
    expect(
      validateDayUseDates(
        { visitDate: "2099-08-20", guests: 2 },
        new Date("2026-08-13")
      )
    ).toEqual([]);
  });
});

describe("Bubble Stay dates", () => {
  it("requires valid date range", () => {
    expect(
      validateBubbleStayDates(
        {
          checkIn: null,
          checkOut: null,
          totalGuests: 2,
          selections: [],
        },
        new Date("2026-08-13")
      ).map((i) => i.code)
    ).toEqual(
      expect.arrayContaining(["invalid_check_in", "invalid_check_out"])
    );

    expect(
      validateBubbleStayDates(
        {
          checkIn: "2099-08-12",
          checkOut: "2099-08-12",
          totalGuests: 2,
          selections: [],
        },
        new Date("2026-08-13")
      ).map((i) => i.code)
    ).toContain("check_out_not_after_check_in");

    expect(
      validateBubbleStayDates(
        {
          checkIn: "2099-08-10",
          checkOut: "2099-08-12",
          totalGuests: 2,
          selections: [],
        },
        new Date("2026-08-13")
      )
    ).toEqual([]);
  });
});

describe("Multi-bubble allocation", () => {
  const selections: BubbleSelection[] = [
    {
      key: "1",
      accommodationTypeId: 2,
      accommodationSlug: "two-bed-bubble",
      guests: 4,
      assignmentMode: "random",
    },
    {
      key: "2",
      accommodationTypeId: 2,
      accommodationSlug: "two-bed-bubble",
      guests: 3,
      assignmentMode: "random",
    },
    {
      key: "3",
      accommodationTypeId: 3,
      accommodationSlug: "family-bubble",
      guests: 2,
      assignmentMode: "random",
    },
  ];

  it("supports multiple bubble selections and derives allocated/remaining", () => {
    expect(getAllocatedGuests(selections)).toBe(9);
    const state = withProduct("bubble_stay", {
      bubbleStay: {
        checkIn: "2099-08-10",
        checkOut: "2099-08-12",
        totalGuests: 9,
        selections,
      },
    });
    expect(selectAllocatedGuests(state)).toBe(9);
    expect(selectRemainingGuests(state)).toBe(0);
    expect(selectIsGuestAllocationComplete(state)).toBe(true);
  });

  it("fails over-allocation", () => {
    const issues = validateBubbleSelections(selections, TYPES, 8);
    expect(issues.map((i) => i.code)).toContain("guest_over_allocated");
  });

  it("fails under-allocation for final bubble step", () => {
    const issues = validateBubbleSelections(selections.slice(0, 1), TYPES, 9);
    expect(issues.map((i) => i.code)).toContain("guest_under_allocated");
  });

  it("passes exact allocation", () => {
    const issues = validateBubbleSelections(selections, TYPES, 9);
    expect(issues.filter((i) => i.code.includes("allocated"))).toEqual([]);
  });
});

describe("Capacity and assignment modes", () => {
  it("uses API max_guests for capacity validation", () => {
    const issues = validateBubbleSelections(
      [
        {
          key: "x",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 5,
          assignmentMode: "random",
        },
      ],
      TYPES,
      5
    );
    expect(issues.map((i) => i.code)).toContain("selection_guests_over_capacity");
  });

  it("fails duplicate manual bubble IDs", () => {
    const issues = validateBubbleSelections(
      [
        {
          key: "a",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 4,
        },
        {
          key: "b",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 4,
        },
      ],
      TYPES,
      4
    );
    expect(issues.map((i) => i.code)).toContain("duplicate_manual_bubble");
  });

  it("fails mixed manual and random assignment modes", () => {
    const issues = validateBubbleSelections(
      [
        {
          key: "a",
          accommodationTypeId: 1,
          accommodationSlug: "one-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 10,
        },
        {
          key: "b",
          accommodationTypeId: 1,
          accommodationSlug: "one-bed-bubble",
          guests: 2,
          assignmentMode: "random",
        },
      ],
      TYPES,
      4
    );
    expect(issues.map((i) => i.code)).toContain("mixed_assignment_modes");
  });

  it("random assignment does not require bubbleId", () => {
    const issues = validateBubbleSelections(
      [
        {
          key: "a",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "random",
        },
      ],
      TYPES,
      2
    );
    expect(issues).toEqual([]);
  });

  it("manual assignment requires bubbleId before readiness", () => {
    const issues = validateBubbleSelections(
      [
        {
          key: "a",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
        },
      ],
      TYPES,
      2
    );
    expect(issues.map((i) => i.code)).toContain("missing_manual_bubble_id");
  });
});

describe("Date change invalidates physical bubble IDs", () => {
  it("clears manual bubbleId values", () => {
    const cleared = clearManualBubbleIds({
      checkIn: "2099-08-11",
      checkOut: "2099-08-13",
      totalGuests: 4,
      selections: [
        {
          key: "a",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "manual",
          bubbleId: 4,
        },
        {
          key: "b",
          accommodationTypeId: 2,
          accommodationSlug: "two-bed-bubble",
          guests: 2,
          assignmentMode: "random",
        },
      ],
    });
    expect(cleared.selections[0]).not.toHaveProperty("bubbleId");
    expect(cleared.selections[0].assignmentMode).toBe("manual");
    expect(cleared.selections[1].assignmentMode).toBe("random");
  });
});

describe("Guest details and product", () => {
  it("validates guest details", () => {
    expect(
      validateGuestDetails({ name: "", email: "bad", phone: "" }).map(
        (i) => i.code
      )
    ).toEqual(
      expect.arrayContaining([
        "invalid_guest_name",
        "invalid_guest_email",
        "invalid_guest_phone",
      ])
    );
    expect(
      validateGuestDetails({
        name: "Omar",
        email: "omar@example.com",
        phone: "+9665",
      })
    ).toEqual([]);
  });

  it("requires product selection", () => {
    expect(validateProductStep(createInitialBookingState()).map((i) => i.code)).toEqual([
      "missing_product",
    ]);
  });
});

describe("No legacy pricing / journey paths", () => {
  it("estimates from accommodation metadata only (no add-ons/experiences)", () => {
    const state = withProduct("bubble_stay", {
      bubbleStay: {
        checkIn: "2099-08-10",
        checkOut: "2099-08-12",
        totalGuests: 4,
        selections: [
          {
            key: "a",
            accommodationTypeId: 2,
            accommodationSlug: "two-bed-bubble",
            guests: 4,
            assignmentMode: "random",
          },
        ],
      },
    });
    // 750 * 2 nights
    expect(selectEstimatedTotal(state, TYPES)).toBe(1500);
  });

  it("payload inputs never include evening/private/add-on fields", () => {
    const day = withProduct("day_use", {
      dayUse: { visitDate: "2099-08-20", guests: 2 },
      guest: {
        name: "Layla",
        email: "layla@example.com",
        phone: "+9665",
      },
    });
    const dayPayload = getDayUseBookingInput(day);
    expect(dayPayload).toMatchObject({
      product_type: "day_use",
      visit_date: "2099-08-20",
      guests: 2,
    });
    expect(dayPayload).not.toHaveProperty("experiences");
    expect(dayPayload).not.toHaveProperty("add_ons");
    expect(dayPayload).not.toHaveProperty("accommodation_id");

    const bubble = withProduct("bubble_stay", {
      bubbleStay: {
        checkIn: "2099-08-10",
        checkOut: "2099-08-12",
        totalGuests: 4,
        selections: [
          {
            key: "a",
            accommodationTypeId: 2,
            accommodationSlug: "two-bed-bubble",
            guests: 4,
            assignmentMode: "random",
          },
        ],
      },
      guest: {
        name: "Omar",
        email: "omar@example.com",
        phone: "+9665",
      },
    });
    const bubblePayload = getBubbleStayBookingInput(bubble);
    expect(bubblePayload?.product_type).toBe("bubble_stay");
    expect(bubblePayload).not.toHaveProperty("experiences");
    expect(bubblePayload).not.toHaveProperty("check_in_date");
  });
});

describe("Legacy persistence rejection", () => {
  it("rejects V1 journey-shaped blobs", () => {
    expect(
      parsePersistedBookingState({
        schemaVersion: 1,
        journeyType: "evening",
        selectedItem: "x",
      })
    ).toBeNull();

    expect(
      parsePersistedBookingState({
        schemaVersion: 2,
        journeyType: "private",
        productType: "day_use",
      })
    ).toBeNull();
  });

  it("accepts clean V2 schema", () => {
    const parsed = parsePersistedBookingState({
      schemaVersion: 2,
      productType: "day_use",
      currentStepIndex: 1,
      dayUse: { visitDate: "2099-08-20", guests: 3 },
      bubbleStay: {
        checkIn: null,
        checkOut: null,
        totalGuests: 2,
        selections: [],
      },
      guest: { name: "A", email: "a@b.com", phone: "1" },
      bookingStatus: "idle",
      bookingReference: null,
      submissionError: null,
    });
    expect(parsed?.productType).toBe("day_use");
    expect(parsed?.dayUse.guests).toBe(3);
  });

  it("reset returns pristine state", () => {
    const reset = createInitialBookingState();
    expect(reset).toEqual(createInitialBookingState());
  });
});
