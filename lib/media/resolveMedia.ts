import {
  dedupeMedia,
  isLikelyFilenameAlt,
  isMediaAssetLike,
  normalizeMediaAsset,
  normalizeMediaList,
  sortMedia,
} from "./normalize";
import {
  NEUTRAL_MEDIA_ALT,
  NEUTRAL_MEDIA_FALLBACK,
} from "./fallback";
import type {
  CmsMedia,
  MediaAsset,
  MediaBearingEntity,
  RawApiMedia,
  ResolveCoverOptions,
  ResolvedImage,
} from "./types";

/**
 * Normalize cover_image: MediaAsset | null (production contract).
 * Never treats cover_image as a URL string.
 */
export function coverImageAsMedia(
  cover: MediaAsset | RawApiMedia | null | undefined
): CmsMedia | null {
  if (cover == null) return null;
  if (typeof cover === "string") {
    // Defensive: production contract is MediaAsset | null. Do not crash.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[coverImageAsMedia] received string; expected MediaAsset | null"
      );
    }
    return null;
  }
  if (!isMediaAssetLike(cover)) return null;
  return normalizeMediaAsset(cover, -1);
}

/**
 * Collect all image media from nested entity fields (no network).
 */
export function collectEntityMedia(entity?: MediaBearingEntity | null): CmsMedia[] {
  if (!entity) return [];
  try {
    const fromMedia = normalizeMediaList(entity.media);
    const fromGallery = normalizeMediaList(entity.gallery);
    const cover = coverImageAsMedia(entity.cover_image);
    const combined = [
      ...(cover ? [cover] : []),
      ...fromMedia,
      ...fromGallery,
    ];
    return sortMedia(dedupeMedia(combined));
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[collectEntityMedia] failed", err);
    }
    return [];
  }
}

/**
 * Cover resolution priority:
 * 1. explicit cover_image (MediaAsset)
 * 2. media.find(is_cover)
 * 3. first image media by sort_order
 * 4. gallery[0]
 * 5. null → caller applies neutral fallback
 */
export function resolveCoverMedia(
  entity?: MediaBearingEntity | null
): CmsMedia | null {
  if (!entity) return null;

  try {
    const explicit = coverImageAsMedia(entity.cover_image);
    if (explicit) return explicit;

    const media = sortMedia(normalizeMediaList(entity.media));
    const flagged = media.find((m) => m.isCover);
    if (flagged) return flagged;
    if (media[0]) return media[0];

    const gallery = normalizeMediaList(entity.gallery);
    if (gallery[0]) return gallery[0];

    return null;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[resolveCoverMedia] failed", err);
    }
    return null;
  }
}

export function resolveGalleryMedia(
  entity?: MediaBearingEntity | null,
  options?: { coverFirst?: boolean }
): CmsMedia[] {
  const items = collectEntityMedia(entity);
  if (!options?.coverFirst) {
    return sortMedia(items).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return sortMedia(items);
}

export function resolveMediaAlt(
  media: CmsMedia | null | undefined,
  options?: ResolveCoverOptions
): string {
  const cmsAlt = media?.altText?.trim();
  if (cmsAlt && !isLikelyFilenameAlt(cmsAlt)) return cmsAlt;

  const name = options?.entityName?.trim();
  if (name) return name;

  const contextual = options?.contextualAlt?.trim();
  if (contextual) return contextual;

  const title = media?.title?.trim();
  if (title && !isLikelyFilenameAlt(title)) return title;

  return NEUTRAL_MEDIA_ALT;
}

export function selectDisplayUrl(
  media: CmsMedia | null | undefined,
  preferThumbnail = false
): string | null {
  if (!media) return null;
  if (preferThumbnail) {
    const thumb = media.thumbnailUrl?.trim();
    if (thumb) return thumb;
  }
  const url = media.url?.trim();
  return url || null;
}

export function resolveCoverImage(
  entity?: MediaBearingEntity | null,
  options?: ResolveCoverOptions
): ResolvedImage {
  const media = resolveCoverMedia(entity);
  const url = selectDisplayUrl(media, options?.preferThumbnail);
  if (url && media) {
    return {
      url,
      alt: resolveMediaAlt(media, options),
      width: media.width,
      height: media.height,
      media,
      isFallback: false,
    };
  }
  return {
    url: NEUTRAL_MEDIA_FALLBACK,
    alt: resolveMediaAlt(null, options),
    width: null,
    height: null,
    media: null,
    isFallback: true,
  };
}

/**
 * Bubble cover → bubble media → bubble gallery → parent accommodation → neutral.
 * Never borrow another bubble's image.
 */
export function resolveBubbleCoverImage(
  bubble?: MediaBearingEntity | null,
  parentAccommodation?: MediaBearingEntity | null,
  options?: ResolveCoverOptions
): ResolvedImage {
  const fromBubble = resolveCoverMedia(bubble);
  const bubbleUrl = selectDisplayUrl(fromBubble, options?.preferThumbnail);
  if (fromBubble && bubbleUrl) {
    return {
      url: bubbleUrl,
      alt: resolveMediaAlt(fromBubble, options),
      width: fromBubble.width,
      height: fromBubble.height,
      media: fromBubble,
      isFallback: false,
    };
  }
  return resolveCoverImage(parentAccommodation, options);
}

/** Convenience: URL-only cover (booking cards, CSS backgrounds). Always a string. */
export function resolveCoverUrl(
  entity?: MediaBearingEntity | null,
  preferThumbnail = false
): string {
  return resolveCoverImage(entity, { preferThumbnail }).url;
}

export function resolveBubbleCoverUrl(
  bubble?: MediaBearingEntity | null,
  parentAccommodation?: MediaBearingEntity | null,
  preferThumbnail = false
): string {
  return resolveBubbleCoverImage(bubble, parentAccommodation, {
    preferThumbnail,
  }).url;
}

/** Merge multiple entities' galleries (home aggregate surfaces). */
export function aggregateEntityGalleries(
  entities: Array<MediaBearingEntity | null | undefined>
): CmsMedia[] {
  const all: CmsMedia[] = [];
  for (const entity of entities) {
    all.push(...collectEntityMedia(entity));
  }
  return sortMedia(dedupeMedia(all));
}

export function normalizeRawMediaArray(
  raw: Array<RawApiMedia | MediaAsset> | null | undefined
): CmsMedia[] {
  if (!raw?.length) return [];
  const out: CmsMedia[] = [];
  raw.forEach((item, index) => {
    const n = normalizeMediaAsset(item, index);
    if (n) out.push(n);
  });
  return sortMedia(dedupeMedia(out));
}
