import type { EventAvailability, EventDetail } from "./domain";

/**
 * Fictional developer preview data only. Never exposed as live CMS inventory.
 * Enabled exclusively by ZALINA_EVENTS_DEMO=true in the non-production server.
 */
export const demoEvents: EventDetail[] = [
  {
    id: 901, slug: "christmas-night-preview",
    title_ar: "ليلة الكريسماس في زالينا", title_en: "Christmas Night at Zalina",
    summary_ar: "أمسية استثنائية من الضيافة والموسيقى على ضفاف النيل.",
    summary_en: "An intimate evening of heritage, dining and music beside the Nile.",
    description_ar: "أجواء احتفالية راقية تجمع المذاقات المصرية والتراث واللحظات التي لا تُنسى.",
    description_en: "Celebrate under the stars with curated Egyptian dining, cultural performances and thoughtful hospitality.",
    cover_image_url: "/assets/zalina-hero-bg.png",
    starts_at: "2026-12-24T19:00:00+02:00", ends_at: "2026-12-25T01:00:00+02:00",
    booking_status: "open", starting_price: "950.00", currency: "EGP",
    venue_ar: "قرية زالينا العربية، الأقصر", venue_en: "Zalina Arabian Village, Luxor",
    highlights_ar: ["عشاء احتفالي", "عروض فنية حية", "تجربة على ضفاف النيل"],
    highlights_en: ["Festive dinner", "Live cultural performances", "Nile-side ambience"],
    terms_ar: "الأسعار والمواعيد تجريبية للمعاينة فقط.",
    terms_en: "Dates and prices shown are fictional development preview data only.",
    gallery_urls: [],
    occurrences: [
      { id: 9101, starts_at: "2026-12-24T19:00:00+02:00", ends_at: "2026-12-25T01:00:00+02:00", booking_status: "open", label_ar: "ليلة 24 ديسمبر", label_en: "Christmas Eve" },
      { id: 9102, starts_at: "2026-12-25T19:00:00+02:00", ends_at: "2026-12-26T01:00:00+02:00", booking_status: "sold_out", label_ar: "ليلة 25 ديسمبر", label_en: "Christmas Day" },
    ],
    packages: [
      { id: 9201, name_ar: "الدخول المميز", name_en: "Signature Entry", description_ar: "أمسية زالينا الأساسية", description_en: "The essential Zalina celebration", includes_ar: ["الدخول", "العشاء", "العروض الفنية"], includes_en: ["Entry", "Festive dinner", "Live performances"], price: "950.00", currency: "EGP", pricing_mode: "per_person", guests_per_unit: 1, min_quantity: 1, max_quantity: 8, display_order: 0 },
      { id: 9202, name_ar: "تجربة الثنائي", name_en: "Couple Experience", description_ar: "أمسية مميزة لشخصين", description_en: "A special evening for two", includes_ar: ["دخول لشخصين", "عشاء", "جلسة مميزة"], includes_en: ["Two admissions", "Festive dinner", "Reserved seating"], price: "2200.00", currency: "EGP", pricing_mode: "per_package", guests_per_unit: 2, min_quantity: 1, max_quantity: 4, display_order: 1 },
      { id: 9203, name_ar: "ليلة VIP", name_en: "VIP Night", description_ar: "ضيافة وتجربة أكثر خصوصية", description_en: "Premium seating and hospitality", includes_ar: ["مقاعد VIP", "عشاء مميز", "استقبال خاص"], includes_en: ["VIP seating", "Premium dinner", "Personal welcome"], price: "1750.00", currency: "EGP", pricing_mode: "per_person", guests_per_unit: 1, min_quantity: 1, max_quantity: 6, display_order: 2 },
    ],
  },
  {
    id: 902, slug: "new-years-eve-preview",
    title_ar: "ليلة رأس السنة", title_en: "New Year's Eve",
    summary_ar: "احتفال بنهاية العام بإطلالة استثنائية.",
    summary_en: "A spectacular celebration to welcome the new year.",
    description_ar: "ليلة فريدة بين الأنغام والضيافة والأجواء الساحرة.",
    description_en: "An unforgettable countdown with warm hospitality and festive moments.",
    cover_image_url: "/assets/zalina-hero-bg.png",
    starts_at: "2026-12-31T20:00:00+02:00", ends_at: "2027-01-01T02:00:00+02:00",
    booking_status: "sold_out", starting_price: "1200.00", currency: "EGP",
    venue_ar: "زالينا، الأقصر", venue_en: "Zalina, Luxor",
    highlights_ar: ["حفل خاص"], highlights_en: ["Special celebration"],
    terms_ar: null, terms_en: null, gallery_urls: [],
    occurrences: [{ id: 9103, starts_at: "2026-12-31T20:00:00+02:00", ends_at: "2027-01-01T02:00:00+02:00", booking_status: "sold_out", label_ar: null, label_en: null }],
    packages: [{ id: 9204, name_ar: "تذكرة الاحتفال", name_en: "Celebration Ticket", description_ar: "", description_en: "", includes_ar: ["الدخول"], includes_en: ["Entry"], price: "1200.00", currency: "EGP", pricing_mode: "per_person", guests_per_unit: 1, min_quantity: 1, max_quantity: 8, display_order: 0 }],
  },
  {
    id: 903, slug: "valentines-evening-preview",
    title_ar: "أمسية عيد الحب", title_en: "Valentine's Evening",
    summary_ar: "أمسية رومانسية مميزة سيتم فتح حجزها قريبًا.",
    summary_en: "A romantic experience with bookings opening soon.",
    description_ar: "تفاصيل مميزة لأمسية دافئة.", description_en: "An intimate experience designed for unforgettable moments.",
    cover_image_url: "/assets/zalina-hero-bg.png",
    starts_at: "2027-02-14T18:00:00+02:00", ends_at: "2027-02-14T23:00:00+02:00",
    booking_status: "upcoming", starting_price: null, currency: "EGP",
    venue_ar: "زالينا، الأقصر", venue_en: "Zalina, Luxor",
    highlights_ar: ["عشاء خاص"], highlights_en: ["Intimate dining"],
    terms_ar: null, terms_en: null, gallery_urls: [],
    occurrences: [{ id: 9104, starts_at: "2027-02-14T18:00:00+02:00", ends_at: "2027-02-14T23:00:00+02:00", booking_status: "upcoming", label_ar: null, label_en: null }],
    packages: [],
  },
];

export function demoAvailability(eventSlug: string, occurrenceId: number): EventAvailability | null {
  const event = demoEvents.find(e => e.slug === eventSlug);
  const occurrence = event?.occurrences.find(o => o.id === occurrenceId);
  if (!event || !occurrence) return null;
  const available = event.booking_status === "open" && occurrence.booking_status === "open";
  return {
    occurrence_id: occurrence.id, checked_at: new Date("2026-11-17T07:00:00Z").toISOString(),
    packages: event.packages.map((pkg, index) => ({
      package_id: pkg.id, unit_price: pkg.price, currency: pkg.currency,
      available, remaining_units: available ? (index === 0 ? 8 : index === 1 ? 3 : 2) : 0,
    })),
  };
}
