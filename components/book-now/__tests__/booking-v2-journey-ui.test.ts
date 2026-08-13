import { describe, expect, it } from "vitest";
import { DAY_USE_STEPS, BUBBLE_STAY_STEPS, PRODUCT_OPTIONS } from "../bookingSteps";
import {
  formatMoneyAmount,
  parseMoney,
  resolveAccommodationImage,
  resolveBubbleImage,
} from "../bookingMedia";
import { selectEstimatedTotal } from "../bookingSelectors";
import { createInitialBookingState } from "../bookingStateFactory";
import type { AccommodationTypeMeta, BookingState } from "../types";

const TYPES: AccommodationTypeMeta[] = [
  {
    id: 10,
    slug: "api-family-bubble",
    name_en: "Family Bubble",
    name_ar: "فقاعة عائلية",
    description_en: "From API",
    max_guests: 6,
    price_per_night: "900.00",
    is_active: true,
    bubbles_count: 2,
    cover_image: "https://cdn.example/cover.jpg",
    bubbles: [],
  },
];

function state(patch: Partial<BookingState>): BookingState {
  return {
    ...createInitialBookingState(),
    ...patch,
    dayUse: { ...createInitialBookingState().dayUse, ...(patch.dayUse ?? {}) },
    bubbleStay: {
      ...createInitialBookingState().bubbleStay,
      ...(patch.bubbleStay ?? {}),
    },
    guest: { ...createInitialBookingState().guest, ...(patch.guest ?? {}) },
  };
}

describe("Phase 3 journey UI helpers", () => {
  it("Day Use estimate uses API price_per_guest", () => {
    const s = state({
      productType: "day_use",
      dayUse: { visitDate: "2099-08-20", guests: 3 },
    });
    expect(selectEstimatedTotal(s, [], 150)).toBe(450);
    expect(selectEstimatedTotal(s, [], null)).toBeNull();
  });

  it("progress labels match product-specific journeys", () => {
    expect(DAY_USE_STEPS.map((s) => s.label)).toEqual([
      "Experience",
      "Date & Guests",
      "Your Details",
      "Review",
    ]);
    expect(BUBBLE_STAY_STEPS.map((s) => s.label)).toEqual([
      "Experience",
      "Stay Details",
      "Your Bubbles",
      "Your Details",
      "Review",
    ]);
  });

  it("product options are only day_use and bubble_stay", () => {
    expect(PRODUCT_OPTIONS.map((o) => o.id).sort()).toEqual([
      "bubble_stay",
      "day_use",
    ]);
  });

  it("accommodation types render from API metadata without frontend constants", () => {
    const rendered = TYPES.map((t) => t.name_en);
    expect(rendered).toContain("Family Bubble");
    expect(rendered.join(" ")).not.toMatch(/One Bed|Two Bed|Three Bed/);
  });

  it("media fallback prefers cover_image then gallery then neutral", () => {
    expect(
      resolveAccommodationImage({
        cover_image: "https://cdn.example/a.jpg",
        gallery: ["https://cdn.example/b.jpg"],
      })
    ).toBe("https://cdn.example/a.jpg");

    expect(
      resolveAccommodationImage({
        cover_image: null,
        gallery: ["https://cdn.example/b.jpg"],
      })
    ).toBe("https://cdn.example/b.jpg");

    expect(
      resolveBubbleImage(
        { cover_image: null, gallery: [] },
        { cover_image: "https://cdn.example/type.jpg" }
      )
    ).toBe("https://cdn.example/type.jpg");
  });

  it("money helpers parse API strings without inventing currency", () => {
    expect(parseMoney("150.00")).toBe(150);
    expect(formatMoneyAmount(450, "EGP")).toBe("EGP 450");
    expect(formatMoneyAmount(450, null)).toBe("450");
    expect(formatMoneyAmount(450)).toBe("450");
  });

  it("guest step contract fields only", () => {
    const guest = createInitialBookingState().guest;
    expect(Object.keys(guest).sort()).toEqual(["email", "name", "phone"]);
  });

  it("Bubble Stay multi-selection estimate counts each bubble nights", () => {
    const s = state({
      productType: "bubble_stay",
      bubbleStay: {
        checkIn: "2099-08-10",
        checkOut: "2099-08-12",
        totalGuests: 8,
        selections: [
          {
            key: "1",
            accommodationTypeId: 10,
            accommodationSlug: "api-family-bubble",
            guests: 4,
            assignmentMode: "random",
          },
          {
            key: "2",
            accommodationTypeId: 10,
            accommodationSlug: "api-family-bubble",
            guests: 4,
            assignmentMode: "random",
          },
        ],
      },
    });
    // 900 * 2 nights * 2 bubbles
    expect(selectEstimatedTotal(s, TYPES)).toBe(3600);
  });
});
