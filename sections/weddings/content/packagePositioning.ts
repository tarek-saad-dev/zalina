import type { LocaleCopy } from "./locale";
import {
  ROYAL_PACKAGE_SLUG,
  SIGNATURE_PACKAGE_SLUG,
  WEDDING_PACKAGE_SLUG,
} from "./weddingMedia";

/** Marketing positioning only — never includes live prices. */
export const PACKAGE_POSITIONING: Record<
  string,
  { badge?: LocaleCopy; short: LocaleCopy; emphasis: "standard" | "signature" | "royal" }
> = {
  [WEDDING_PACKAGE_SLUG]: {
    short: {
      en: "Everything needed for an elegant Zalina celebration, beautifully prepared and effortlessly hosted.",
      ar: "كل ما يلزم لاحتفال أنيق في زالينا، مُعدّ بجمال ويُدار بسلاسة.",
    },
    emphasis: "standard",
  },
  [SIGNATURE_PACKAGE_SLUG]: {
    badge: { en: "Most Popular", ar: "الأكثر طلباً" },
    short: {
      en: "The complete Zalina wedding experience — elevated dining, presentation, entertainment and service in one unforgettable celebration.",
      ar: "تجربة زفاف زالينا المتكاملة — مأكولات وتقديم وترفيه وخدمة راقية في احتفال لا يُنسى.",
    },
    emphasis: "signature",
  },
  [ROYAL_PACKAGE_SLUG]: {
    short: {
      en: "Zalina at its most extraordinary — premium presentation, elevated entertainment and a destination-wedding experience designed to impress.",
      ar: "زالينا في أقصى فخامتها — تقديم فاخر، وترفيه راقٍ، وتجربة زفاف وجهة مصممة لتبهر.",
    },
    emphasis: "royal",
  },
};

export function getPackagePositioning(slug: string) {
  const exact = PACKAGE_POSITIONING[slug];
  if (exact) return exact;
  const lower = slug.toLowerCase();
  if (lower.includes("signature")) return PACKAGE_POSITIONING[SIGNATURE_PACKAGE_SLUG];
  if (lower.includes("royal")) return PACKAGE_POSITIONING[ROYAL_PACKAGE_SLUG];
  if (lower.includes("wedding")) return PACKAGE_POSITIONING[WEDDING_PACKAGE_SLUG];
  return {
    short: {
      en: "An elegant Zalina wedding celebration.",
      ar: "احتفال زفاف أنيق في زالينا.",
    },
    emphasis: "standard" as const,
  };
}
