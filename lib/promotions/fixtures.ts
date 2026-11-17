import type { PromotionCampaign } from "./domain";

/**
 * Fictional developer-only campaign layouts for browser QA.
 * The public CMS feed is never replaced by this data in production.
 */
export const demoPromotions: PromotionCampaign[] = [
  {
    id: "preview-top",
    slug: "preview-christmas-top-bar",
    placements: ["top_bar"],
    priority: 90,
    title_ar: "أمسية زالينا الاحتفالية — معاينة تجريبية",
    title_en: "Zalina Festive Evening — Preview Only",
    description_ar: null,
    description_en: null,
    eyebrow_ar: "مناسبة خاصة",
    eyebrow_en: "SPECIAL EVENING",
    cta_label_ar: "استكشف الباقات",
    cta_label_en: "Explore packages",
    cta_href: "/events/christmas-night-preview",
    image_url: null,
    starts_at: null,
    ends_at: null,
    display_delay_seconds: 0,
    dismiss_for_hours: 1,
  },
  {
    id: "preview-floating",
    slug: "preview-christmas-floating-card",
    placements: ["floating_card"],
    priority: 80,
    title_ar: "احتفل بليلة لا تُنسى",
    title_en: "An evening to remember",
    description_ar: "مناسبة تجريبية لا تتضمن حجزًا حقيقيًا",
    description_en: "Fictional celebration for frontend review only",
    eyebrow_ar: "معاينة التصميم",
    eyebrow_en: "DESIGN PREVIEW",
    cta_label_ar: "شاهد المناسبة",
    cta_label_en: "View the event",
    cta_href: "/events/christmas-night-preview",
    image_url: "/assets/zalina-hero-bg.png",
    starts_at: null,
    ends_at: null,
    display_delay_seconds: 0,
    dismiss_for_hours: 1,
  },
];
