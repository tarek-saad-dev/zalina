import { describe, expect, it } from "vitest";
import type { CatalogMediaCard } from "@/lib/media";
import { canAutoAdvanceMoments, getMomentDeckPose, tokenizeMomentDescription, momentDeckXShift, selectSignatureMomentCards, signedCarouselDistance } from "../signatureMomentsLayout";

const fallback: CatalogMediaCard = {
  id: "fallback", title: "Zalina", image: "/assets/day.webp", alt: "Zalina"
};

describe("Signature Moments editorial layout data", () => {
  it("renders a fallback when the CMS catalog is empty", () => {
    expect(selectSignatureMomentCards([], fallback)).toEqual([fallback]);
  });

  it("never overflows the editorial selection and keeps the CMS order", () => {
    const items = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      title: `Experience ${index}`,
      image: `/assets/${index}.webp`,
      alt: `Experience ${index}`,
    }));
    expect(selectSignatureMomentCards(items, fallback).map((item) => item.id))
      .toEqual(["0", "1", "2", "3", "4", "5", "6"]);
    expect(items).toHaveLength(7);
  });

  it("filters missing media or title and shows fallback for invalid-only data", () => {
    const invalid = [
      { id: "blank-image", title: "One", image: " ", alt: "" },
      { id: "blank-title", title: "", image: "/image.webp", alt: "" },
    ];
    expect(selectSignatureMomentCards(invalid, fallback)).toEqual([fallback]);
    expect(selectSignatureMomentCards([...invalid, {
      id: "valid", title: "Valid", image: "/image.webp", alt: "Valid",
    }], fallback).map(item => item.id)).toEqual(["valid"]);
  });

  it("supports shorter catalogs without inventing cards", () => {
    const one: CatalogMediaCard = {
      id: "one", title: "One", image: "/image.webp", alt: "One",
    };
    expect(selectSignatureMomentCards([one], fallback)).toEqual([one]);
  });
});

describe("vertical 3D carousel navigation", () => {
  it("wraps safely in both directions", () => {
    expect(signedCarouselDistance(3, 0, 4)).toBe(-1);
    expect(signedCarouselDistance(0, 3, 4)).toBe(1);
    expect(signedCarouselDistance(1, 0, 4)).toBe(1);
    expect(signedCarouselDistance(0, 0, 4)).toBe(0);
  });
  it("works for one and two CMS cards", () => {
    expect(signedCarouselDistance(0, 0, 1)).toBe(0);
    expect(signedCarouselDistance(1, 0, 2)).toBe(1);
  });
  it("places the farthest item behind the active card", () => {
    expect(signedCarouselDistance(2, 0, 4)).toBe(2);
  });
});

describe("portrait coverflow 3D geometry", () => {
  it("promotes the centered card and angles left/right neighbors toward it", () => {
    const center = getMomentDeckPose(0);
    const left = getMomentDeckPose(-1);
    const right = getMomentDeckPose(1);
    expect(center.zIndex).toBeGreaterThan(left.zIndex);
    expect(center.depth).toBeGreaterThan(left.depth);
    expect(center.scale).toBe(1);
    expect(left.rotateY).toBeGreaterThan(0);
    expect(right.rotateY).toBeLessThan(0);
    expect(left.opacity).toBeLessThan(center.opacity);
  });
  it("shows two depth tiers and hides items outside the five-card fan", () => {
    expect(getMomentDeckPose(2).depth).toBeLessThan(getMomentDeckPose(1).depth);
    expect(getMomentDeckPose(-2).visible).toBe(true);
    expect(getMomentDeckPose(3).visible).toBe(true);
    expect(getMomentDeckPose(4).visible).toBe(false);
  });
});

describe("cross-browser CSS deck positioning", () => {
  it("uses only CSS calc addition/subtraction rather than unsupported multiplication", () => {
    expect(momentDeckXShift(0)).toBe("0px");
    expect(momentDeckXShift(1)).toBe("var(--moment-stride)");
    expect(momentDeckXShift(-1)).toBe("calc(0px - var(--moment-stride))");
    expect(momentDeckXShift(2)).toBe("calc(var(--moment-stride) + var(--moment-stride))");
    expect(momentDeckXShift(-2)).toBe("calc(0px - var(--moment-stride) - var(--moment-stride))");
    expect(momentDeckXShift(3)).toBe("calc(var(--moment-stride) + var(--moment-stride) + var(--moment-outer-step))");
    expect(momentDeckXShift(-3)).toBe("calc(0px - var(--moment-stride) - var(--moment-stride) - var(--moment-outer-step))");
  });
});

describe("autoplay eligibility and manual takeover", () => {
  const enabled = { count: 5, isInView: true, userInteracted: false, isHovered: false, hasFocusWithin: false, reducedMotion: false };
  it("auto-advances a visible multi-card deck on desktop or mobile", () => {
    expect(canAutoAdvanceMoments(enabled)).toBe(true);
  });
  it("stops permanently once a user manually moves the carousel", () => {
    expect(canAutoAdvanceMoments({ ...enabled, userInteracted: true })).toBe(false);
  });
  it("pauses on hover, keyboard focus, hidden viewport and motion preference", () => {
    expect(canAutoAdvanceMoments({ ...enabled, isHovered: true })).toBe(false);
    expect(canAutoAdvanceMoments({ ...enabled, hasFocusWithin: true })).toBe(false);
    expect(canAutoAdvanceMoments({ ...enabled, isInView: false })).toBe(false);
    expect(canAutoAdvanceMoments({ ...enabled, reducedMotion: true })).toBe(false);
    expect(canAutoAdvanceMoments({ ...enabled, count: 1 })).toBe(false);
  });
});

describe("full description and first-three-words accent", () => {
  it("preserves Arabic text while accenting exactly its first three words", () => {
    const copy = "استكشف القرية العربية وسوقها، واكتشف الخيام والأجواء التراثية.";
    const tokens = tokenizeMomentDescription(copy);
    expect(tokens.map(t => t.text).join("")).toEqual(copy);
    expect(tokens.filter(t => t.highlight).map(t => t.text)).toEqual(["استكشف","القرية","العربية"]);
  });
  it("works for English, repeated spaces and empty text", () => {
    const copy = "Explore  the Arabian Village and its market.";
    const tokens = tokenizeMomentDescription(copy);
    expect(tokens.map(t => t.text).join("")).toBe(copy);
    expect(tokens.filter(t => t.highlight).map(t => t.text)).toEqual(["Explore","the","Arabian"]);
    expect(tokenizeMomentDescription("")).toEqual([]);
    expect(tokenizeMomentDescription("One word").filter(t => t.highlight)).toHaveLength(2);
  });
  it("can consume nine genuine CMS cards without inventing filler", () => {
    const cards = Array.from({length:11},(_,i)=>({id:String(i),title:`Experience ${i}`,image:`/media/${i}.webp`,alt:"Experience"}));
    expect(selectSignatureMomentCards(cards, fallback)).toHaveLength(9);
    expect(selectSignatureMomentCards(cards.slice(0,3),fallback)).toHaveLength(3);
  });
});
