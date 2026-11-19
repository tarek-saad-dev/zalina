import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CmsImagesProvider } from "@/components/static-cms/CmsImagesProvider";
import { WEDDING_MEDIA, resolveWeddingMediaSrc, type WeddingMediaSlot } from "../content/weddingMedia";
import { WeddingHero } from "../WeddingHero";
import { WeddingExperience } from "../WeddingExperience";
import { SignatureSpotlight } from "../SignatureSpotlight";
import { WeddingVisualStory } from "../WeddingVisualStory";
import { WeddingUpgrades } from "../WeddingUpgrades";
import { WeddingFinalCTA } from "../WeddingFinalCTA";

const state = vi.hoisted(() => ({ locale: "en" as "ar" | "en" }));
vi.mock("@/components/book-now/useBookingLocale", () => ({ useBookingLocale: () => state.locale }));
vi.mock("@/components/media/HeroRevealGate", () => ({ useMarkHeroReady: () => () => {} }));
vi.mock("next/image", () => ({ default: (props: { src: string; alt: string }) => React.createElement("img", { src: props.src, alt: props.alt }) }));
vi.mock("framer-motion", () => ({
  useReducedMotion: () => true,
  motion: new Proxy({}, { get: (_target, tag: string) => ({ children }: { children?: React.ReactNode }) => React.createElement(tag, null, children) }),
}));

vi.stubGlobal("React", React);

const placements: { slot: string; media: WeddingMediaSlot; component: React.ComponentType }[] = [
  { slot: "weddings.hero", media: "hero", component: WeddingHero },
  { slot: "weddings.experience", media: "experience", component: WeddingExperience },
  { slot: "weddings.signature", media: "signature", component: SignatureSpotlight },
  { slot: "weddings.story.primary", media: "visualStoryPrimary", component: WeddingVisualStory },
  { slot: "weddings.story.secondary", media: "visualStorySecondary", component: WeddingVisualStory },
  { slot: "weddings.upgrades.hospitality", media: "upgradesHospitality", component: WeddingUpgrades },
  { slot: "weddings.finalCta", media: "finalCta", component: WeddingFinalCTA },
];

describe("Weddings CMS images", () => {
  for (const locale of ["ar", "en"] as const) {
    it(`uses independent overrides and original fallbacks in ${locale}`, () => {
      state.locale = locale;
      for (const { slot, media, component } of placements) {
        const render = (images: Record<string, { src: string; alt_ar?: string; alt_en?: string }>) => renderToStaticMarkup(
          React.createElement(CmsImagesProvider, { images, children: React.createElement(component) })
        );
        const original = render({});
        expect(original).toContain(resolveWeddingMediaSrc(media));
        expect(original).toContain(WEDDING_MEDIA[media].alt[locale]);
        const updated = render({ [slot]: { src: "/api/cms/media/custom.webp", alt_ar: "وصف مخصص", alt_en: "Custom description" } });
        expect(updated).toContain('/api/cms/media/custom.webp');
        expect(updated).toContain(locale === "ar" ? "وصف مخصص" : "Custom description");
        expect(render({ [slot]: { src: "/api/cms/media/custom.webp" } })).toContain(WEDDING_MEDIA[media].alt[locale]);
        if (slot.startsWith("weddings.story.")) {
          const other = media === "visualStoryPrimary" ? "visualStorySecondary" : "visualStoryPrimary";
          expect(updated).toContain(resolveWeddingMediaSrc(other));
        }
      }
    });
  }
});
