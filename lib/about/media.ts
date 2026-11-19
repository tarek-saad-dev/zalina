import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media/fallback";

export const ABOUT_IMAGE_SLOTS = [
  { id:"hero", ar:"صورة الغلاف الرئيسية", en:"Hero background", ratio:"16:9" },
  { id:"story.primary", ar:"جوهر زالينا — الصورة الكبيرة", en:"Story — primary", ratio:"4:5" },
  { id:"story.secondary", ar:"جوهر زالينا — الصورة المتداخلة", en:"Story — secondary", ratio:"4:5" },
  { id:"pillars.heritage", ar:"التراث", en:"Pillars — heritage", ratio:"3:4" },
  { id:"pillars.atmosphere", ar:"الأجواء", en:"Pillars — atmosphere", ratio:"3:4" },
  { id:"pillars.celebration", ar:"الاحتفال", en:"Pillars — celebration", ratio:"3:4" },
  { id:"stories", ar:"الحكايات الغامرة", en:"Immersive stories", ratio:"4:5" },
  { id:"difference.night", ar:"اختلاف زالينا — ليلًا", en:"Difference — night", ratio:"4:5" },
  { id:"difference.day", ar:"اختلاف زالينا — نهارًا", en:"Difference — day", ratio:"4:5" },
  { id:"cta", ar:"صورة الخاتمة", en:"Final CTA background", ratio:"16:9" },
] as const;

export type AboutImageSlot = typeof ABOUT_IMAGE_SLOTS[number]["id"];
export type AboutMediaImage = { src: string; alt_ar?: string; alt_en?: string };
export type AboutMediaMap = Partial<Record<AboutImageSlot, AboutMediaImage>>;

export const ABOUT_MEDIA_FALLBACKS: Record<AboutImageSlot, string> = {
  hero: NEUTRAL_MEDIA_FALLBACK,
  "story.primary": "/assets/day.webp",
  "story.secondary": "/assets/night-experience.webp",
  "pillars.heritage": NEUTRAL_MEDIA_FALLBACK,
  "pillars.atmosphere": NEUTRAL_MEDIA_FALLBACK,
  "pillars.celebration": NEUTRAL_MEDIA_FALLBACK,
  stories: NEUTRAL_MEDIA_FALLBACK,
  "difference.night": NEUTRAL_MEDIA_FALLBACK,
  "difference.day": NEUTRAL_MEDIA_FALLBACK,
  cta: NEUTRAL_MEDIA_FALLBACK,
};

const SLOT_SET = new Set<string>(ABOUT_IMAGE_SLOTS.map(s => s.id));
export function isAboutImageSlot(id: string): id is AboutImageSlot {
  return SLOT_SET.has(id);
}

export function isApprovedAboutImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const url = value.trim();
  if (/^\/api\/cms\/media\/[a-z0-9-]+-[a-f0-9]{16}\.webp$/.test(url)) return true;
  if (/^\/(assets|storage|media)\//.test(url) && !url.includes("..") && !url.includes("?")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "api.zalinaarabianvillage.com" &&
      !parsed.username && !parsed.password;
  } catch { return false; }
}

/** Public response shape: {slots:{slot_id:{url,alt_ar?,alt_en?}}}. */
export function normalizeAboutMedia(raw: unknown): AboutMediaMap {
  if (!raw || typeof raw !== "object") return {};
  const slots = (raw as { slots?: unknown }).slots;
  if (!slots || typeof slots !== "object" || Array.isArray(slots)) return {};
  const result: AboutMediaMap = {};
  for (const slot of ABOUT_IMAGE_SLOTS) {
    const entry = (slots as Record<string, unknown>)[slot.id];
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (!isApprovedAboutImageUrl(e.url)) continue;
    result[slot.id] = {
      src: e.url.trim(),
      alt_ar: typeof e.alt_ar === "string" ? e.alt_ar.slice(0,180).trim() : undefined,
      alt_en: typeof e.alt_en === "string" ? e.alt_en.slice(0,180).trim() : undefined,
    };
  }
  return result;
}

export function resolveAboutImage(
  media: AboutMediaMap | undefined,
  slot: AboutImageSlot,
  locale: string,
  fallbackAlt: string
): { src: string; alt: string } {
  const asset = media?.[slot];
  return {
    src: asset && isApprovedAboutImageUrl(asset.src) ? asset.src : ABOUT_MEDIA_FALLBACKS[slot],
    alt: (locale === "ar" ? asset?.alt_ar : asset?.alt_en)?.trim() || fallbackAlt,
  };
}
