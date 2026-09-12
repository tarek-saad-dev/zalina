/**
 * Typed Wedding media map.
 *
 * Primary production story uses cleaned Zalina concept assets under
 * /public/assets/weddings/.
 *
 * Source files 1–5.jpeg remain as originals.
 * Canonical production files (WebP):
 * - 01-hero-evening-wide.webp (Image 1 cropped above SIDE VIEW annotation)
 * - 03-stage-performance-portrait.webp (Image 3, clean)
 * - 04-kosha-musicians-portrait.webp (Image 4, clean)
 * - 02 / 05 hospitality crops (optional; labels removed by top crop)
 * Source JPG/JPEG originals remain beside the WebP files.
 */

export type WeddingMediaSlot =
  | "hero"
  | "experience"
  | "signature"
  | "visualStoryPrimary"
  | "visualStorySecondary"
  | "finalCta"
  | "upgradesHospitality";

export interface WeddingMediaAsset {
  /** Intended production path under /public */
  src: string;
  alt: { en: string; ar: string };
  /** True only when a cleaned Zalina concept asset is present at `src`. */
  productionReady: boolean;
  /** Local-only fallback — not for production hero/signature. */
  devFallback: string;
}

const DEV_FALLBACK = "/assets/wedding.png";

export const WEDDING_MEDIA: Record<WeddingMediaSlot, WeddingMediaAsset> = {
  hero: {
    src: "/assets/weddings/01-hero-evening-wide.webp",
    alt: {
      en: "Evening wedding celebration at Zalina Arabian Village with illuminated stage and dining",
      ar: "احتفال زفاف مسائي في قرية زالينا العربية مع المسرح المضاء وقاعة العشاء",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  experience: {
    src: "/assets/weddings/03-stage-performance-portrait.webp",
    alt: {
      en: "Cultural performance on the Zalina wedding stage with guests dining in the foreground",
      ar: "عرض ثقافي على مسرح زفاف زالينا مع الضيوف على الموائد في المقدمة",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  signature: {
    src: "/assets/weddings/04-kosha-musicians-portrait.webp",
    alt: {
      en: "Floral wedding kosha with live musicians and dining at Zalina",
      ar: "كوشة زفاف مزهرة مع موسيقيين وموائد في زالينا",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  visualStoryPrimary: {
    src: "/assets/weddings/01-hero-evening-wide.webp",
    alt: {
      en: "Wide view of a Zalina destination wedding evening",
      ar: "منظر واسع لأمسية زفاف في وجهة زالينا",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  visualStorySecondary: {
    src: "/assets/weddings/03-stage-performance-portrait.webp",
    alt: {
      en: "Portrait of celebration and performance at Zalina",
      ar: "صورة للاحتفال والعرض في زالينا",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  finalCta: {
    src: "/assets/weddings/04-kosha-musicians-portrait.webp",
    alt: {
      en: "Romantic wedding kosha and celebration atmosphere at Zalina",
      ar: "أجواء رومانسية لكوشة الزفاف والاحتفال في زالينا",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
  upgradesHospitality: {
    src: "/assets/weddings/02-hospitality-clean.webp",
    alt: {
      en: "Hospitality and dining atmosphere for bespoke wedding upgrades",
      ar: "أجواء الضيافة والعشاء لترقيات الزفاف الخاصة",
    },
    productionReady: true,
    devFallback: DEV_FALLBACK,
  },
};

export function resolveWeddingMediaSrc(slot: WeddingMediaSlot): string {
  const asset = WEDDING_MEDIA[slot];
  return asset.productionReady ? asset.src : asset.devFallback;
}

export function isWeddingPrimaryImageryReady(): boolean {
  return (
    WEDDING_MEDIA.hero.productionReady &&
    WEDDING_MEDIA.experience.productionReady &&
    WEDDING_MEDIA.signature.productionReady
  );
}

export const SIGNATURE_PACKAGE_SLUG = "zalina-signature-wedding";
export const WEDDING_PACKAGE_SLUG = "zalina-wedding";
export const ROYAL_PACKAGE_SLUG = "zalina-royal-wedding";

export function isSignaturePackageSlug(slug: string): boolean {
  const s = slug.toLowerCase();
  return s === SIGNATURE_PACKAGE_SLUG || s.includes("signature");
}

export function isRoyalPackageSlug(slug: string): boolean {
  const s = slug.toLowerCase();
  return s === ROYAL_PACKAGE_SLUG || s.includes("royal");
}
