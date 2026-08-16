/**
 * Gallery page presentation constants — no photography catalogs.
 * Media comes from CMS via lib/media/galleryCatalog.
 */

import {
  GALLERY_FILTER_IDS,
  GALLERY_FILTER_LABELS_EN,
  GALLERY_I18N_KEYS,
  type GalleryFilterId,
} from "@/lib/media";

export {
  GALLERY_FILTER_IDS,
  GALLERY_FILTER_LABELS_EN,
  GALLERY_I18N_KEYS,
  type GalleryFilterId,
};

export interface GalleryFilterOption {
  id: GalleryFilterId;
  /** i18n key — wire to AR dictionary in the localization phase. */
  labelKey: string;
  /** English default until locale dictionaries ship. */
  label: string;
}

export const GALLERY_FILTER_OPTIONS: GalleryFilterOption[] = [
  {
    id: "all",
    labelKey: GALLERY_I18N_KEYS.all,
    label: GALLERY_FILTER_LABELS_EN.all,
  },
  {
    id: "experiences",
    labelKey: GALLERY_I18N_KEYS.experiences,
    label: GALLERY_FILTER_LABELS_EN.experiences,
  },
  {
    id: "zones",
    labelKey: GALLERY_I18N_KEYS.zones,
    label: GALLERY_FILTER_LABELS_EN.zones,
  },
  {
    id: "bubbles",
    labelKey: GALLERY_I18N_KEYS.bubbleStays,
    label: GALLERY_FILTER_LABELS_EN.bubbles,
  },
];

/** Text-only reasons — no images. */
export const GALLERY_REASONS = [
  {
    title: "Premium Storytelling",
    description:
      "Each frame reflects the atmosphere, detail, and emotion of Zalina.",
  },
  {
    title: "Emotional Atmosphere",
    description:
      "A visual journey through warmth, celebration, and memory.",
  },
  {
    title: "Curated Hospitality",
    description:
      "Moments shaped by service, culture, and refined design.",
  },
] as const;
