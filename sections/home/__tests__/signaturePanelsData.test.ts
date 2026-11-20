import { describe, expect, it } from "vitest";
import type { CatalogMediaCard } from "@/lib/media";
import { getSignaturePanels } from "../signaturePanelsData";

const fallback: CatalogMediaCard = {
  id: "fallback",
  title: "Zalina",
  subtitle: "Explore Zalina",
  image: "/assets/wedding.png",
  alt: "Zalina",
  href: "/experiences",
};

describe("Signature Moments — all-visible portrait panels", () => {
  it("renders every valid moment instead of hiding cards in a carousel", () => {
    const moments: CatalogMediaCard[] = Array.from({ length: 12 }, (_, index) => ({
      id: String(index),
      title: `Moment ${index}`,
      subtitle: `Description ${index}`,
      image: `/media/${index}.webp`,
      alt: `Moment ${index}`,
      href: "/experiences",
    }));
    const panels = getSignaturePanels(moments, fallback);
    expect(panels).toHaveLength(12);
    expect(panels.map(panel => panel.id)).toEqual(moments.map(moment => moment.id));
    expect(panels.every(panel => panel.href === "/experiences")).toBe(true);
  });

  it("preserves only valid API entries and their image, copy and link", () => {
    const valid = {
      id: "nubian",
      title: "Nubian Show",
      subtitle: "Traditional rhythms",
      image: "/media/nubian.webp",
      alt: "Performers",
      href: "/experiences",
    };
    expect(getSignaturePanels([
      { ...valid, id: "missing-photo", image: "" },
      valid,
      { ...valid, id: "blank-title", title: "  " },
    ], fallback)).toEqual([valid]);
  });

  it("shows the neutral fallback only for an empty or invalid catalog", () => {
    expect(getSignaturePanels([], fallback)).toEqual([fallback]);
    expect(getSignaturePanels([
      { id: "bad", title: "", image: " ", alt: "" },
    ], fallback)).toEqual([fallback]);
  });

  it("keeps a single real card without creating imaginary extra panels", () => {
    const only = { id: "one", title: "Live Band", image: "/band.webp", alt: "Band" };
    expect(getSignaturePanels([only], fallback)).toEqual([only]);
  });
});
