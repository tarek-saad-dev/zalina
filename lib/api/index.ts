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
  getPage,
  listMediaForModel,
  assertCmsMediaOwner,
} from "./catalog";

export { clearMediaRequestCache, UnsupportedMediaOwnerError } from "./media";

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
  createWeddingBooking,
  getBooking,
} from "./bookings";

export { getWeddings, getWeddingAvailability } from "./weddings";

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
  NEUTRAL_MEDIA_FALLBACK,
  NEUTRAL_MEDIA_ALT,
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
  buildWeddingBookingPayload,
  normalizeWeddingPackage,
  normalizeWeddingAvailability,
  assertNoLegacyBookingFields,
  LEGACY_BOOKING_PAYLOAD_KEY_LIST,
} from "./adapters";

export { ApiError } from "./types";
export type * from "./types";
export type * from "./booking-types";
