import type { BookingProductType } from "@/lib/api";
import type { BookingStepDefinition, BookingStepId } from "./types";

/** Message path under `bookNow.steps.*` for each wizard step id. */
export const STEP_MESSAGE_KEYS: Record<
  BookingStepId,
  { label: string; shortLabel: string }
> = {
  product: {
    label: "steps.product.label",
    shortLabel: "steps.product.shortLabel",
  },
  day_use_product: {
    label: "steps.dayUseProduct.label",
    shortLabel: "steps.dayUseProduct.shortLabel",
  },
  date_guests: {
    label: "steps.dayUseDateGuests.label",
    shortLabel: "steps.dayUseDateGuests.shortLabel",
  },
  dates_guests: {
    label: "steps.bubbleDatesGuests.label",
    shortLabel: "steps.bubbleDatesGuests.shortLabel",
  },
  bubbles: {
    label: "steps.bubbles.label",
    shortLabel: "steps.bubbles.shortLabel",
  },
  guest_details: {
    label: "steps.guestDetails.label",
    shortLabel: "steps.guestDetails.shortLabel",
  },
  review: {
    label: "steps.review.label",
    shortLabel: "steps.review.shortLabel",
  },
};

function stepDef(id: BookingStepId): BookingStepDefinition {
  const keys = STEP_MESSAGE_KEYS[id];
  return { id, label: keys.label, shortLabel: keys.shortLabel };
}

export const PRODUCT_STEP: BookingStepDefinition = stepDef("product");

export const DAY_USE_STEPS: BookingStepDefinition[] = [
  PRODUCT_STEP,
  stepDef("day_use_product"),
  stepDef("date_guests"),
  stepDef("guest_details"),
  stepDef("review"),
];

export const BUBBLE_STAY_STEPS: BookingStepDefinition[] = [
  PRODUCT_STEP,
  stepDef("dates_guests"),
  stepDef("bubbles"),
  stepDef("guest_details"),
  stepDef("review"),
];

/** Before a product is chosen, only the product step is navigable. */
export function getActiveSteps(
  productType: BookingProductType | null
): BookingStepDefinition[] {
  if (productType === "day_use") return DAY_USE_STEPS;
  if (productType === "bubble_stay") return BUBBLE_STAY_STEPS;
  return [PRODUCT_STEP];
}

export function getStepDefinition(
  productType: BookingProductType | null,
  stepIndex: number
): BookingStepDefinition {
  const steps = getActiveSteps(productType);
  return steps[Math.min(Math.max(stepIndex, 0), steps.length - 1)]!;
}

export function getStepIndexById(
  productType: BookingProductType | null,
  stepId: BookingStepId
): number {
  return getActiveSteps(productType).findIndex((s) => s.id === stepId);
}

/** Structural product cards — copy comes from `bookNow.products.*`. */
export const PRODUCT_OPTIONS: Array<{
  id: BookingProductType;
  /** Key under `bookNow.products` (`dayUse` | `bubbleStay`). */
  messageKey: "dayUse" | "bubbleStay";
  comingSoon?: boolean;
}> = [
  {
    id: "bubble_stay",
    messageKey: "bubbleStay",
    comingSoon: true,
  },
  {
    id: "day_use",
    messageKey: "dayUse",
  },
];
