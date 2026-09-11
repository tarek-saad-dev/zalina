/**
 * Typed Wedding media map.
 *
 * Primary production story requires cleaned assets under /public/assets/weddings/.
 * Set `productionReady: true` only after cleaned Image 1 / 3 / 4 are on disk
 * without diagram annotations.
 *
 * `/assets/wedding.png` is a local-dev fallback only — never treat it as
 * production-ready primary imagery for enabling WEDDINGS_ACTIVE.
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
    src: "/assets/weddings/01-hero-evening-wide.jpg",
    alt: {
      en: "Evening wedding celebration at Zalina Arabian Village with illuminated stage and dining",
      ar: "احتفال زفاف مسائي في قرية زالينا العربية مع المسرح المضاء وقاعة العشاء",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  experience: {
    src: "/assets/weddings/03-stage-performance-portrait.jpg",
    alt: {
      en: "Cultural performance on the Zalina wedding stage with guests dining in the foreground",
      ar: "عرض ثقافي على مسرح زفاف زالينا مع الضيوف على الموائد في المقدمة",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  signature: {
    src: "/assets/weddings/04-kosha-musicians-portrait.jpg",
    alt: {
      en: "Floral wedding kosha with live musicians and dining at Zalina",
      ar: "كوشة زفاف مزهرة مع موسيقيين وموائد في زالينا",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  visualStoryPrimary: {
    src: "/assets/weddings/01-hero-evening-wide.jpg",
    alt: {
      en: "Wide view of a Zalina destination wedding evening",
      ar: "منظر واسع لأمسية زفاف في وجهة زالينا",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  visualStorySecondary: {
    src: "/assets/weddings/03-stage-performance-portrait.jpg",
    alt: {
      en: "Portrait of celebration and performance at Zalina",
      ar: "صورة للاحتفال والعرض في زالينا",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  finalCta: {
    src: "/assets/weddings/04-kosha-musicians-portrait.jpg",
    alt: {
      en: "Romantic wedding kosha and celebration atmosphere at Zalina",
      ar: "أجواء رومانسية لكوشة الزفاف والاحتفال في زالينا",
    },
    productionReady: false,
    devFallback: DEV_FALLBACK,
  },
  upgradesHospitality: {
    src: "/assets/weddings/02-hospitality-clean.jpg",
    alt: {
      en: "Hospitality and dining atmosphere for bespoke wedding upgrades",
      ar: "أجواء الضيافة والعشاء لترقيات الزفاف الخاصة",
    },
    /** Diagram images stay false until labels are removed. */
    productionReady: false,
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
