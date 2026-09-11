import type { LocaleCopy } from "./locale";

export type ComparisonCategoryId =
  | "venue"
  | "dining"
  | "entertainment"
  | "service";

export interface ComparisonRow {
  id: string;
  label: LocaleCopy;
  /** Values keyed by package role, not live price. */
  wedding: LocaleCopy;
  signature: LocaleCopy;
  royal: LocaleCopy;
}

export interface ComparisonCategory {
  id: ComparisonCategoryId;
  title: LocaleCopy;
  rows: ComparisonRow[];
}

/**
 * Latest approved package matrix (marketing).
 * Bespoke upgrades (photo/video, major florals, fireworks, hookah, etc.)
 * are intentionally NOT listed as package inclusions.
 *
 * Entertainment lock:
 * - Signature: DJ / Egyptian Zaffa / short cultural show
 * - Royal: expanded entertainment / live band / fuller show
 */
export const PACKAGE_COMPARISON: ComparisonCategory[] = [
  {
    id: "venue",
    title: { en: "Venue & Styling", ar: "المكان والتنسيق" },
    rows: [
      {
        id: "duration",
        label: { en: "Wedding duration", ar: "مدة الزفاف" },
        wedding: { en: "5 hours", ar: "٥ ساعات" },
        signature: { en: "6 hours", ar: "٦ ساعات" },
        royal: { en: "7 hours", ar: "٧ ساعات" },
      },
      {
        id: "tables",
        label: { en: "Tables & chairs", ar: "الطاولات والكراسي" },
        wedding: { en: "Elegant standard", ar: "أنيقة قياسية" },
        signature: { en: "Upgraded", ar: "مطورّة" },
        royal: { en: "Premium", ar: "فاخرة" },
      },
      {
        id: "linens",
        label: { en: "Linens / tablescape", ar: "المفارش وتنسيق المائدة" },
        wedding: { en: "Standard linens", ar: "مفارش قياسية" },
        signature: { en: "Upgraded linens", ar: "مفارش مطورة" },
        royal: { en: "Premium / custom linens", ar: "مفارش فاخرة / مخصصة" },
      },
      {
        id: "centerpieces",
        label: { en: "Centerpieces", ar: "تنسيقات الوسط" },
        wedding: { en: "Basic centerpieces", ar: "تنسيقات أساسية" },
        signature: { en: "Enhanced floral styling", ar: "تنسيق زهري محسّن" },
        royal: { en: "Premium floral styling", ar: "تنسيق زهري فاخر" },
      },
      {
        id: "kosha",
        label: { en: "Wedding kosha / stage", ar: "الكوشة / المسرح" },
        wedding: { en: "Basic kosha", ar: "كوشة أساسية" },
        signature: { en: "Signature kosha", ar: "كوشة سيجنتشر" },
        royal: { en: "Luxury stage treatment", ar: "معالجة مسرح فاخرة" },
      },
      {
        id: "dance",
        label: { en: "Dance floor", ar: "أرضية الرقص" },
        wedding: { en: "Included", ar: "مشمولة" },
        signature: { en: "Included", ar: "مشمولة" },
        royal: { en: "Included", ar: "مشمولة" },
      },
      {
        id: "lighting",
        label: { en: "Ambient & stage lighting", ar: "إضاءة الأجواء والمسرح" },
        wedding: { en: "Basic lighting", ar: "إضاءة أساسية" },
        signature: { en: "Enhanced lighting", ar: "إضاءة محسّنة" },
        royal: { en: "Premium lighting", ar: "إضاءة فاخرة" },
      },
      {
        id: "sound",
        label: { en: "House sound", ar: "نظام الصوت" },
        wedding: { en: "Included", ar: "مشمول" },
        signature: { en: "Included", ar: "مشمول" },
        royal: { en: "Included", ar: "مشمول" },
      },
    ],
  },
  {
    id: "dining",
    title: { en: "Dining & Hospitality", ar: "المأكولات والضيافة" },
    rows: [
      {
        id: "buffet",
        label: { en: "Buffet level", ar: "مستوى البوفيه" },
        wedding: { en: "Elegant buffet", ar: "بوفيه أنيق" },
        signature: { en: "Premium Egyptian / Arabian dining", ar: "مأكولات مصرية / عربية راقية" },
        royal: { en: "Elevated premium dining", ar: "مأكولات فاخرة راقية" },
      },
      {
        id: "grill",
        label: { en: "Live grill & bread station", ar: "شواء حي ومحطة خبز" },
        wedding: { en: "Included", ar: "مشمول" },
        signature: { en: "Live charcoal grill & bread", ar: "شواء فحم حي وخبز" },
        royal: { en: "Premium live stations", ar: "محطات حية فاخرة" },
      },
      {
        id: "drinks",
        label: { en: "Soft drinks / water", ar: "المشروبات الغازية / الماء" },
        wedding: { en: "Included", ar: "مشمولة" },
        signature: { en: "Water, soft drinks, tea & coffee", ar: "ماء ومشروبات غازية وشاي وقهوة" },
        royal: { en: "Elevated beverage service", ar: "خدمة مشروبات راقية" },
      },
      {
        id: "dessert",
        label: { en: "Dessert presentation", ar: "تقديم الحلويات" },
        wedding: { en: "Standard desserts", ar: "حلويات قياسية" },
        signature: { en: "Enhanced desserts", ar: "حلويات محسّنة" },
        royal: { en: "Premium dessert presentation", ar: "تقديم حلويات فاخر" },
      },
    ],
  },
  {
    id: "entertainment",
    title: { en: "Entertainment", ar: "الترفيه" },
    rows: [
      {
        id: "dj",
        label: { en: "DJ / entertainment level", ar: "مستوى الدي جي / الترفيه" },
        wedding: { en: "DJ", ar: "دي جي" },
        signature: { en: "DJ", ar: "دي جي" },
        royal: { en: "Expanded entertainment", ar: "ترفيه موسّع" },
      },
      {
        id: "zaffa",
        label: { en: "Egyptian Zaffa", ar: "الزفة المصرية" },
        wedding: { en: "Included", ar: "مشمولة" },
        signature: { en: "Egyptian Zaffa", ar: "زفة مصرية" },
        royal: { en: "Upgraded Zaffa", ar: "زفة مطورة" },
      },
      {
        id: "show",
        label: { en: "Cultural performance", ar: "العرض الثقافي" },
        wedding: { en: "Selected moments", ar: "لحظات مختارة" },
        signature: { en: "Short cultural / Zalina performance", ar: "عرض ثقافي / زالينا قصير" },
        royal: {
          en: "Full Egyptian / Arabian entertainment show",
          ar: "عرض ترفيهي مصري / عربي كامل",
        },
      },
      {
        id: "liveband",
        label: { en: "Live band", ar: "فرقة حية" },
        wedding: { en: "—", ar: "—" },
        signature: { en: "—", ar: "—" },
        royal: { en: "Live band included", ar: "فرقة حية مشمولة" },
      },
    ],
  },
  {
    id: "service",
    title: { en: "Service", ar: "الخدمة" },
    rows: [
      {
        id: "coordinator",
        label: { en: "Wedding coordinator", ar: "منسق الزفاف" },
        wedding: { en: "Included", ar: "مشمول" },
        signature: { en: "Included", ar: "مشمول" },
        royal: { en: "Dedicated premium coordination", ar: "تنسيق فاخر مخصص" },
      },
      {
        id: "bride-room",
        label: { en: "Bride preparation room", ar: "غرفة تجهيز العروس" },
        wedding: { en: "Included", ar: "مشمولة" },
        signature: { en: "Included", ar: "مشمولة" },
        royal: { en: "Included", ar: "مشمولة" },
      },
      {
        id: "staff",
        label: { en: "Service level", ar: "مستوى الخدمة" },
        wedding: { en: "Full service team", ar: "فريق خدمة كامل" },
        signature: {
          en: "Coordination, service, security, setup & cleanup",
          ar: "تنسيق وخدمة وأمن وتجهيز وتنظيف",
        },
        royal: {
          en: "Elevated service & security presence",
          ar: "خدمة وحضور أمني راقٍ",
        },
      },
    ],
  },
];

export const SIGNATURE_SPOTLIGHT_GROUPS: {
  id: string;
  title: LocaleCopy;
  items: LocaleCopy[];
}[] = [
  {
    id: "venue",
    title: { en: "Venue", ar: "المكان" },
    items: [
      { en: "6-hour celebration", ar: "احتفال لمدة ٦ ساعات" },
      { en: "Upgraded tables & chairs", ar: "طاولات وكراسي مطورة" },
      { en: "Complete table setting", ar: "تجهيز مائدة كامل" },
      { en: "Enhanced floral styling", ar: "تنسيق زهري محسّن" },
      { en: "Signature stage / kosha", ar: "مسرح / كوشة سيجنتشر" },
    ],
  },
  {
    id: "atmosphere",
    title: { en: "Atmosphere", ar: "الأجواء" },
    items: [
      { en: "Stage & architectural lighting", ar: "إضاءة المسرح والعمارة" },
      { en: "House sound", ar: "نظام الصوت" },
      { en: "Dance floor", ar: "أرضية الرقص" },
      { en: "Entrance experience", ar: "تجربة الدخول" },
    ],
  },
  {
    id: "dining",
    title: { en: "Dining", ar: "المأكولات" },
    items: [
      { en: "Premium Egyptian / Arabian dining", ar: "مأكولات مصرية / عربية راقية" },
      { en: "Live charcoal grill", ar: "شواء فحم حي" },
      { en: "Bread station", ar: "محطة خبز" },
      { en: "Desserts", ar: "حلويات" },
      { en: "Water, soft drinks, tea & coffee", ar: "ماء ومشروبات غازية وشاي وقهوة" },
    ],
  },
  {
    id: "service",
    title: { en: "Service", ar: "الخدمة" },
    items: [
      { en: "Wedding coordination", ar: "تنسيق الزفاف" },
      { en: "Service team", ar: "فريق الخدمة" },
      { en: "Security", ar: "الأمن" },
      { en: "Setup / cleanup", ar: "التجهيز / التنظيف" },
      { en: "Bride preparation area", ar: "منطقة تجهيز العروس" },
      {
        en: "Access to Zalina for wedding photography",
        ar: "إمكانية التصوير في زالينا",
      },
    ],
  },
  {
    id: "entertainment",
    title: { en: "Entertainment", ar: "الترفيه" },
    items: [
      { en: "DJ", ar: "دي جي" },
      { en: "Egyptian Zaffa", ar: "زفة مصرية" },
      {
        en: "Short cultural / Zalina performance",
        ar: "عرض ثقافي / زالينا قصير",
      },
    ],
  },
];
