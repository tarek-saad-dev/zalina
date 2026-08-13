import type {
  CreateBubbleStayManualPayload,
  CreateBubbleStayRandomPayload,
  CreateDayUseBookingPayload,
} from "@/lib/api";
import type { AccommodationTypeMeta, BookingState } from "./types";
import {
  getBubbleStayBookingInput,
  getDayUseBookingInput,
  isBookingInputReady,
} from "./bookingSelectors";

export type PreparedBookingPayload =
  | { product: "day_use"; payload: CreateDayUseBookingPayload }
  | {
      product: "bubble_stay";
      payload: CreateBubbleStayManualPayload | CreateBubbleStayRandomPayload;
    };

/**
 * Single place to build V2 create payloads from wizard state.
 * Components must not construct booking bodies themselves.
 */
export function prepareBookingPayload(
  state: BookingState,
  accommodationTypes: AccommodationTypeMeta[]
): PreparedBookingPayload | null {
  if (!isBookingInputReady(state, accommodationTypes)) return null;

  if (state.productType === "day_use") {
    const payload = getDayUseBookingInput(state);
    if (!payload) return null;
    return { product: "day_use", payload };
  }

  if (state.productType === "bubble_stay") {
    const payload = getBubbleStayBookingInput(state);
    if (!payload) return null;
    return { product: "bubble_stay", payload };
  }

  return null;
}
