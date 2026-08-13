export { apiFetch, apiFetchSafe, getApiBaseUrl, getApiRequestOrigin } from "./client";
export { resolveApiLocale, DEFAULT_API_LOCALE } from "./locale";
export type { ApiLocale } from "./locale";

export {
  getZones,
  getZone,
  getExperiences,
  getExperience,
  getAddOns,
  getMedia,
} from "./catalog";

export { getDayUseSettings } from "./day-use";

export {
  listAccommodationTypes,
  getAccommodationType,
  getAccommodationTypeStrict,
  getAccommodationAvailability,
} from "./accommodations";

export {
  createDayUseBooking,
  createBubbleStayBooking,
  createDayUseBookingFromFields,
  createBubbleStayManualBooking,
  createBubbleStayRandomBooking,
  getBooking,
} from "./bookings";

export { initiatePayment } from "./payments";
export { getTicketByBookingCode } from "./tickets";

export {
  mapZoneToUi,
  mapExperienceToCatalogItem,
  formatEgp,
  addOneDay,
} from "./mappers";

export {
  zoneFallbackImage,
  experienceFallbackImage,
  stayFallbackImage,
  mediaUrl,
} from "./fallbacks";

export {
  normalizeAccommodationType,
  normalizeAccommodationAvailability,
  normalizeDayUseSettings,
  normalizeBooking,
  normalizeTicketLookup,
  normalizePhysicalBubble,
  buildDayUseBookingPayload,
  buildBubbleStayManualPayload,
  buildBubbleStayRandomPayload,
  assertNoLegacyBookingFields,
  LEGACY_BOOKING_PAYLOAD_KEY_LIST,
} from "./adapters";

export { ApiError } from "./types";
export type * from "./types";
export type * from "./booking-types";
