import { describe, expect, it } from "vitest";
import {
  ABOUT_IMAGE_SLOTS, ABOUT_MEDIA_FALLBACKS, isAboutImageSlot,
  isApprovedAboutImageUrl, normalizeAboutMedia, resolveAboutImage,
} from "../media";

describe("About page image slots", () => {
  it("covers ten independent slots", () => {
    expect(ABOUT_IMAGE_SLOTS).toHaveLength(10);
    expect(new Set(ABOUT_IMAGE_SLOTS.map(s => s.id)).size).toBe(10);
    for (const slot of ABOUT_IMAGE_SLOTS) {
      expect(isAboutImageSlot(slot.id)).toBe(true);
      expect(ABOUT_MEDIA_FALLBACKS[slot.id].startsWith("/")).toBe(true);
    }
  });
  it("rejects untrusted URLs", () => {
    expect(isApprovedAboutImageUrl("/assets/day.webp")).toBe(true);
    expect(isApprovedAboutImageUrl("/storage/about/hero.webp")).toBe(true);
    expect(isApprovedAboutImageUrl("https://api.zalinaarabianvillage.com/storage/hero.webp")).toBe(true);
    expect(isApprovedAboutImageUrl("https://evil.example/capture.png")).toBe(false);
    expect(isApprovedAboutImageUrl("//evil.example/photo.jpg")).toBe(false);
    expect(isApprovedAboutImageUrl("javascript:alert(1)")).toBe(false);
    expect(isApprovedAboutImageUrl("/assets/../secret.txt")).toBe(false);
  });
  it("normalizes known published assets and preserves localized descriptions", () => {
    const data = normalizeAboutMedia({ slots: {
      hero: { url: "https://api.zalinaarabianvillage.com/storage/about/hero.webp", alt_ar: "واجهة زالينا", alt_en: "Zalina exterior" },
      stories: { url: "https://evil.example/photo.jpg" },
      unknown: { url: "/assets/unknown.webp" },
    } });
    expect(Object.keys(data)).toEqual(["hero"]);
    expect(resolveAboutImage(data, "hero", "ar", "Fallback").alt).toBe("واجهة زالينا");
    expect(resolveAboutImage(data, "hero", "en", "Fallback").alt).toBe("Zalina exterior");
    expect(resolveAboutImage(data, "stories", "ar", "حكايات").src).toBe(ABOUT_MEDIA_FALLBACKS.stories);
  });
  it("retains current images before API integration", () => {
    expect(normalizeAboutMedia(null)).toEqual({});
    expect(normalizeAboutMedia({ data: [] })).toEqual({});
    expect(resolveAboutImage({}, "story.primary", "ar", "صورة")).toEqual({ src: "/assets/zalina-hero-bg.webp", alt: "صورة" });
    expect(resolveAboutImage({}, "story.secondary", "en", "Photo")).toEqual({ src: "/assets/zalina-hero-bg.webp", alt: "Photo" });
  });
});
