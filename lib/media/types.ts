/**
 * Normalized CMS media shapes for the public site.
 * Snake_case API fields are normalized once here — UI never reads them raw.
 */

export const CMS_MEDIA_OWNERS = [
  "accommodation",
  "bubble",
  "zone",
  "experience",
] as const;

export type CmsMediaOwner = (typeof CMS_MEDIA_OWNERS)[number];

/** Plural aliases accepted by GET /media/{model_type}/{model_id}. */
export const CMS_MEDIA_OWNER_ALIASES: Record<string, CmsMediaOwner> = {
  accommodation: "accommodation",
  accommodations: "accommodation",
  bubble: "bubble",
  bubbles: "bubble",
  zone: "zone",
  zones: "zone",
  experience: "experience",
  experiences: "experience",
};

export interface CmsMedia {
  id: number;
  url: string;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  collectionName?: string | null;
  isCover: boolean;
  sortOrder: number;
  fileName?: string | null;
  size?: number | null;
}

/** Raw media object as returned by the API (partial / drifting fields allowed). */
export interface RawApiMedia {
  id?: number;
  url?: string | null;
  original_url?: string | null;
  thumbnail_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  collection_name?: string | null;
  is_cover?: boolean | null;
  sort_order?: number | null;
}

export type GalleryItemRaw = string | RawApiMedia;

/**
 * Any catalog entity that may carry nested media fields.
 * Prefer these over GET /media when sufficient.
 */
export interface MediaBearingEntity {
  cover_image?: string | null;
  gallery?: GalleryItemRaw[] | null;
  media?: RawApiMedia[] | null;
}

export interface ResolveCoverOptions {
  /** Localized entity name for alt fallback (not used for URL selection). */
  entityName?: string | null;
  /** Contextual alt when media has no alt_text and no entity name. */
  contextualAlt?: string | null;
  /** When true, prefer thumbnail_url for compact cards. */
  preferThumbnail?: boolean;
}

export interface ResolvedImage {
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  media: CmsMedia | null;
  isFallback: boolean;
}
