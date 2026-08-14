/**
 * Legacy fallback helpers — now a single neutral placeholder.
 * Per-type / per-slug business photography maps are removed.
 */
export {
  NEUTRAL_MEDIA_FALLBACK,
  NEUTRAL_MEDIA_ALT,
  zoneFallbackImage,
  experienceFallbackImage,
  stayFallbackImage,
} from "@/lib/media";

import { resolveCoverUrl, type MediaBearingEntity } from "@/lib/media";

/** @deprecated Prefer resolveCoverUrl / resolveCoverImage from @/lib/media */
export function mediaUrl(
  media?: Array<{ url?: string; original_url?: string }> | null
): string | null {
  if (!media?.length) return null;
  const entity: MediaBearingEntity = { media };
  const resolved = resolveCoverUrl(entity);
  // resolveCoverUrl always returns fallback — detect empty media
  const first = media[0];
  const url = first.url || first.original_url;
  return url || null;
}
