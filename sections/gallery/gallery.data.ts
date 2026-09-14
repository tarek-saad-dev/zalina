/**
 * Gallery page presentation constants — no photography catalogs.
 * Media comes from CMS via lib/media/galleryCatalog.
 */

import {
  GALLERY_FILTER_IDS,
  type GalleryFilterId,
} from "@/lib/media";

export { GALLERY_FILTER_IDS, type GalleryFilterId };

/** Relative keys under `useTranslations('gallery')`. */
export const GALLERY_FILTER_MESSAGE_KEYS: Record<GalleryFilterId, string> = {
  all: "filters.all",
  experiences: "filters.experiences",
  zones: "filters.zones",
  bubbles: "filters.bubbles",
};

export interface GalleryFilterOption {
  id: GalleryFilterId;
  /** Relative message key under gallery namespace. */
  labelKey: string;
}

export const GALLERY_FILTER_OPTIONS: GalleryFilterOption[] = [
  { id: "all", labelKey: GALLERY_FILTER_MESSAGE_KEYS.all },
  { id: "experiences", labelKey: GALLERY_FILTER_MESSAGE_KEYS.experiences },
  { id: "zones", labelKey: GALLERY_FILTER_MESSAGE_KEYS.zones },
  { id: "bubbles", labelKey: GALLERY_FILTER_MESSAGE_KEYS.bubbles },
];

/** Message keys under `gallery.reasons.items.*`. */
export const GALLERY_REASON_KEYS = [
  "storytelling",
  "atmosphere",
  "hospitality",
] as const;
