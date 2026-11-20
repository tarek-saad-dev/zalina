import { resolveWeddingMediaSrc } from "@/sections/weddings/content/weddingMedia";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

export const CMS_PAGES = ["home","about","experiences","zones","weddings","gallery","nav","footer","common"] as const;
export type CmsPage = (typeof CMS_PAGES)[number];
export type CmsLocale = "ar" | "en";

export const CMS_IMAGE_SLOTS = [
  { id:"home.hero", page:"home", ar:"الرئيسية — صورة الغلاف", en:"Home — Hero", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"home.day", page:"home", ar:"الرئيسية — النهار", en:"Home — Day", fallback:"/assets/day-experience.webp" },
  { id:"home.night", page:"home", ar:"الرئيسية — الليل", en:"Home — Night", fallback:"/assets/night-experience.webp" },
  { id:"about.hero", page:"about", ar:"عن زالينا — صورة الغلاف", en:"About — Hero", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.story.primary", page:"about", ar:"عن زالينا — الصورة الكبيرة", en:"About — Main story", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.story.secondary", page:"about", ar:"عن زالينا — الصورة المتداخلة", en:"About — Overlay story", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.pillars.heritage", page:"about", ar:"التراث", en:"Pillars — Heritage", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.pillars.atmosphere", page:"about", ar:"الأجواء", en:"Pillars — Atmosphere", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.pillars.celebration", page:"about", ar:"الاحتفال", en:"Pillars — Celebration", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.stories", page:"about", ar:"الحكايات الغامرة", en:"About — Immersive stories", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.difference.night", page:"about", ar:"اختلاف زالينا — ليلًا", en:"About — Night", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.difference.day", page:"about", ar:"اختلاف زالينا — نهارًا", en:"About — Day", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"about.cta", page:"about", ar:"عن زالينا — صورة الخاتمة", en:"About — Ending", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"experiences.hero", page:"experiences", ar:"التجارب — صورة الغلاف", en:"Experiences — Hero", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"zones.hero", page:"zones", ar:"المناطق — صورة الغلاف", en:"Zones — Hero", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"weddings.hero", page:"weddings", ar:"الأفراح — صورة الغلاف", en:"Weddings — Hero", fallback:resolveWeddingMediaSrc("hero") },
  { id:"weddings.experience", page:"weddings", ar:"الأفراح — التجربة", en:"Weddings — Experience", fallback:resolveWeddingMediaSrc("experience") },
  { id:"weddings.signature", page:"weddings", ar:"الأفراح — التجربة المميزة", en:"Weddings — Signature experience", fallback:resolveWeddingMediaSrc("signature") },
  { id:"weddings.story.primary", page:"weddings", ar:"الأفراح — القصة المصورة الرئيسية", en:"Weddings — Main story image", fallback:resolveWeddingMediaSrc("visualStoryPrimary") },
  { id:"weddings.story.secondary", page:"weddings", ar:"الأفراح — القصة المصورة الثانية", en:"Weddings — Secondary story image", fallback:resolveWeddingMediaSrc("visualStorySecondary") },
  { id:"weddings.upgrades.hospitality", page:"weddings", ar:"الأفراح — الضيافة والترقيات", en:"Weddings — Hospitality upgrades", fallback:resolveWeddingMediaSrc("upgradesHospitality") },
  { id:"weddings.finalCta", page:"weddings", ar:"الأفراح — الصورة الختامية", en:"Weddings — Final image", fallback:resolveWeddingMediaSrc("finalCta") },
  { id:"gallery.hero", page:"gallery", ar:"المعرض — صورة الغلاف", en:"Gallery — Hero", fallback:"/assets/zalina-hero-bg.webp" },
  { id:"gallery.cta", page:"gallery", ar:"المعرض — صورة الخاتمة", en:"Gallery — CTA", fallback:"/assets/zalina-hero-bg.webp" },
] as const;
export type CmsImageSlot = (typeof CMS_IMAGE_SLOTS)[number]["id"];

export type CmsImage = { src: string; alt_ar?: string; alt_en?: string };
export type CmsPublished = {
  version: 1;
  texts: Record<CmsLocale, Record<string,string>>;
  images: Partial<Record<CmsImageSlot, CmsImage>>;
  updatedAt?: string;
};

export function emptyCms(): CmsPublished {
  return { version: 1, texts: { ar:{}, en:{} }, images:{} };
}
export const BASE_MESSAGES = { ar, en } as const;
export function flattenCopy(source: unknown, prefix = ""): Record<string,string> {
  const out: Record<string,string> = {};
  if (!source || typeof source !== "object" || Array.isArray(source)) return out;
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? prefix+"."+key : key;
    if (typeof value === "string") out[path] = value;
    else if (value && typeof value === "object" && !Array.isArray(value))
      Object.assign(out,flattenCopy(value,path));
  }
  return out;
}
const COPY_BY_LOCALE: Record<CmsLocale,Record<string,string>> = {
  ar: flattenCopy(ar), en:flattenCopy(en),
};
export function staticCopyEntries(locale: CmsLocale, page: CmsPage) {
  return Object.entries(COPY_BY_LOCALE[locale])
    .filter(([key, value]) => key.startsWith(page+".") &&
      value.length < 1200 && !/\{[^}]+\}/.test(value))
    .map(([key,value])=>({key,value}));
}
export function isEditableText(locale: CmsLocale, key: string): boolean {
  const page = key.split(".")[0] as CmsPage;
  return CMS_PAGES.includes(page) && staticCopyEntries(locale,page).some(item=>item.key===key);
}
export function isCmsImageSlot(id: string): id is CmsImageSlot {
  return CMS_IMAGE_SLOTS.some(slot=>slot.id===id);
}
export function fallbackImage(slot: CmsImageSlot): string {
  return CMS_IMAGE_SLOTS.find(x=>x.id===slot)!.fallback;
}
export function mergeCmsMessages(locale: CmsLocale, changes: Record<string,string>): Record<string,any> {
  const source = BASE_MESSAGES[locale] as unknown as Record<string,unknown>;
  const copy = JSON.parse(JSON.stringify(source)) as Record<string,unknown>;
  for(const [path, value] of Object.entries(changes)){
    if(!isEditableText(locale,path) || !value.trim()) continue;
    const nodes=path.split(".");
    let current: Record<string,unknown>=copy;
    for(const node of nodes.slice(0,-1)) current=current[node] as Record<string,unknown>;
    current[nodes[nodes.length-1]]=value;
  }
  return copy;
}
