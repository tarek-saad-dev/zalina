import { describe, expect, it } from "vitest";
import {
 CMS_PAGES,CMS_IMAGE_SLOTS,emptyCms,flattenCopy,staticCopyEntries,
 isEditableText,isCmsImageSlot,mergeCmsMessages,
} from "../schema";
describe("Zalina Mini CMS static-only contract",()=>{
 it("limits content editing to marketing translations",()=>{
   expect(CMS_PAGES).toEqual(["home","about","experiences","zones","gallery","nav","footer","common"]);
   expect(isEditableText("ar","about.hero.subtitle")).toBe(true);
   expect(isEditableText("ar","booking.price")).toBe(false);
   expect(isEditableText("en","seo.home.title")).toBe(false);
 });
 it("has independent static image slots, not backend entity IDs",()=>{
   expect(CMS_IMAGE_SLOTS.length).toBeGreaterThanOrEqual(17);
   expect(new Set(CMS_IMAGE_SLOTS.map(x=>x.id)).size).toBe(CMS_IMAGE_SLOTS.length);
   expect(isCmsImageSlot("about.story.primary")).toBe(true);
   expect(isCmsImageSlot("home.hero")).toBe(true);
   expect(isCmsImageSlot("catalog.experience.123")).toBe(false);
 });
 it("ignores ICU placeholders and only overrides allowed content",()=>{
   expect(staticCopyEntries("ar","about").some(x=>x.key==="about.hero.subtitle")).toBe(true);
   expect(staticCopyEntries("ar","about").every(x=>!/\{[^}]+\}/.test(x.value))).toBe(true);
   const x=mergeCmsMessages("ar",{"about.hero.subtitle":"نص تجريبي جديد","booking.secret":"not allowed"});
   expect((x.about as any).hero.subtitle).toBe("نص تجريبي جديد");
   expect((x as any).booking?.secret).not.toBe("not allowed");
 });
 it("does not mutate bundled messages or defaults",()=>{
   const a=mergeCmsMessages("en",{"about.hero.subtitle":"A fresh intro"});
   const b=mergeCmsMessages("en",{});
   expect((a.about as any).hero.subtitle).toBe("A fresh intro");
   expect((b.about as any).hero.subtitle).not.toBe("A fresh intro");
   expect(emptyCms().texts.ar).toEqual({});
   expect(flattenCopy({a:{b:"text"}})).toEqual({"a.b":"text"});
 });
});
