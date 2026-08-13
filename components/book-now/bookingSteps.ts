import type {
  BookingProductType,
} from "@/lib/api";
import type { BookingStepDefinition, BookingStepId } from "./types";

export const PRODUCT_STEP: BookingStepDefinition = {
  id: "product",
  label: "Experience",
  shortLabel: "Experience",
};

export const DAY_USE_STEPS: BookingStepDefinition[] = [
  PRODUCT_STEP,
  { id: "date_guests", label: "Date & Guests", shortLabel: "Date" },
  { id: "guest_details", label: "Your Details", shortLabel: "Details" },
  { id: "review", label: "Review", shortLabel: "Review" },
];

export const BUBBLE_STAY_STEPS: BookingStepDefinition[] = [
  PRODUCT_STEP,
  { id: "dates_guests", label: "Stay Details", shortLabel: "Stay" },
  { id: "bubbles", label: "Your Bubbles", shortLabel: "Bubbles" },
  { id: "guest_details", label: "Your Details", shortLabel: "Details" },
  { id: "review", label: "Review", shortLabel: "Review" },
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

export const PRODUCT_OPTIONS: Array<{
  id: BookingProductType;
  title: string;
  description: string;
  tag: string;
}> = [
  {
    id: "bubble_stay",
    title: "Bubble Stay",
    description:
      "An overnight escape in Zalina's private bubbles — choose one or more, allocate your guests, and settle into the desert night.",
    tag: "OVERNIGHT",
  },
  {
    id: "day_use",
    title: "Day Use",
    description:
      "A single-day visit to experience Zalina without an overnight stay. Pricing follows live Day Use settings.",
    tag: "DAY VISIT",
  },
];
