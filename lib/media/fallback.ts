/**
 * Single neutral Zalina placeholder.
 * NOT a per-entity / per-slug business photo map.
 */
export const NEUTRAL_MEDIA_FALLBACK = "/assets/zalina-hero-bg.webp";

export const NEUTRAL_MEDIA_ALT = "Zalina Arabian Village in Luxor, Egypt";

/** @deprecated Use NEUTRAL_MEDIA_FALLBACK — type/slug image maps are forbidden. */
export function zoneFallbackImage(_type?: string): string {
  return NEUTRAL_MEDIA_FALLBACK;
}

/** @deprecated Use NEUTRAL_MEDIA_FALLBACK — type/slug image maps are forbidden. */
export function experienceFallbackImage(_type?: string): string {
  return NEUTRAL_MEDIA_FALLBACK;
}

/** @deprecated Use NEUTRAL_MEDIA_FALLBACK — type/slug image maps are forbidden. */
export function stayFallbackImage(_zoneType?: string): string {
  return NEUTRAL_MEDIA_FALLBACK;
}
