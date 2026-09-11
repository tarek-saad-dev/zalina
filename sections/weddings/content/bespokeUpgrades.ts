import type { LocaleCopy } from "./locale";

/**
 * Bespoke upgrades — NOT base package inclusions.
 * Actionable only after wedding booking is confirmed.
 */
export const BESPOKE_UPGRADES: {
  id: string;
  title: LocaleCopy;
  body: LocaleCopy;
}[] = [
  {
    id: "photo-film",
    title: { en: "Photography & Film", ar: "التصوير والفيديو" },
    body: {
      en: "Professional photography and videography crafted for your night.",
      ar: "تصوير فوتوغرافي وفيديو احترافي مصمم لليلتكم.",
    },
  },
  {
    id: "florals",
    title: { en: "Bespoke Florals", ar: "زهور خاصة" },
    body: {
      en: "Major custom floral installations and special-order blooms.",
      ar: "تركيبات زهرية مخصصة كبيرة وزهور خاصة الطلب.",
    },
  },
  {
    id: "cake",
    title: { en: "Wedding Cakes", ar: "كعك الزفاف" },
    body: {
      en: "Custom wedding cakes beyond the standard dessert presentation.",
      ar: "كعك زفاف مخصص يتجاوز تقديم الحلويات القياسي.",
    },
  },
  {
    id: "effects",
    title: { en: "Celebration Effects", ar: "تأثيرات الاحتفال" },
    body: {
      en: "Fireworks, cold sparks and cinematic celebration moments.",
      ar: "ألعاب نارية وشرر بارد ولحظات احتفال سينمائية.",
    },
  },
  {
    id: "entertainment",
    title: { en: "Special Entertainment", ar: "ترفيه خاص" },
    body: {
      en: "Specialty performers beyond your package entertainment.",
      ar: "مؤدون خاصون يتجاوزون ترفيه الباقة.",
    },
  },
  {
    id: "bars",
    title: { en: "Premium Hospitality Bars", ar: "بارات ضيافة فاخرة" },
    body: {
      en: "Specialty coffee, ice cream and premium fresh-juice bars.",
      ar: "بارات قهوة خاصة وآيس كريم وعصائر طازجة فاخرة.",
    },
  },
  {
    id: "hookah",
    title: { en: "Hookah Experience", ar: "تجربة الشيشة" },
    body: {
      en: "Hookah service and lounge ambience arranged after booking.",
      ar: "خدمة الشيشة وأجواء الصالة تُرتّب بعد الحجز.",
    },
  },
];
