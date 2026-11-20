import { describe, expect, it } from "vitest";
import type { CatalogMediaCard } from "@/lib/media";
import { getSignaturePanels, getSignaturePanelTagline, getSignaturePanelCaption, getSignaturePanelTitleVariant } from "../signaturePanelsData";

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

describe("individual CMS panel taglines", () => {
  it("uses the real experience description instead of a hardcoded repeated label", () => {
    expect(getSignaturePanelTagline("A mesmerizing performance of grace, balance and spirit.", "Experiences"))
      .toBe("A mesmerizing performance of");
    expect(getSignaturePanelTagline("تجربة غنية بالإيقاع والفنون النوبية المميزة", "تجارب"))
      .toBe("تجربة غنية بالإيقاع والفنون");
  });
  it("uses the translated fallback when no description exists", () => {
    expect(getSignaturePanelTagline("", "Curated Experiences")).toBe("Curated Experiences");
    expect(getSignaturePanelTagline(undefined, "تجارب مختارة")).toBe("تجارب مختارة");
  });
});

describe("responsive complete panel text (without CSS ellipses)", () => {
  it("uses smaller text for long names while preserving the original name", () => {
    expect(getSignaturePanelTitleVariant("Nubian Show")).toBe("normal");
    expect(getSignaturePanelTitleVariant("Egyptian & Arabian Dinner")).toBe("long");
    expect(getSignaturePanelTitleVariant("Live Charcoal BBQ & Brick-Oven Cooking")).toBe("extra-long");
  });
  it("keeps every heading, kicker and caption free of CSS line clamps", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync(new URL("../../../app/globals.css", import.meta.url), "utf8");
    const panels = css.slice(css.indexOf("/* Signature Moments V2"));
    expect(panels).toContain('.signature-panel-title[data-title-size="extra-long"]');
    expect(panels).toContain("grid-template-rows: 118px minmax(0, 1fr) 78px");
    expect(panels).toContain("height: clamp(590px, 85svh, 790px)");
    expect(panels).toContain("font-size: clamp(21px, 1.8vw, 29px)");
    expect(panels).toContain("font-size: clamp(10px, 0.8vw, 12.5px)");
    expect(panels).not.toContain("-webkit-line-clamp");
    expect(panels).not.toContain("text-overflow: ellipsis");
  });
});

describe("reference-matched photographic cards", () => {
  it("summarizes the long CMS paragraph into a short footer without ellipses", () => {
    expect(getSignaturePanelCaption(
      "Explore the Arabian Village and its market, discover traditional tents and spaces, enjoy shopping and capture photos.",
      "Explore",
    )).toBe("Explore the Arabian Village and its market");
    expect(getSignaturePanelCaption(
      "Experience live charcoal BBQ and traditional brick-oven cooking as fresh food is prepared in front of you.",
      "Explore",
    )).toBe("Experience live charcoal BBQ and traditional brick-oven cooking");
    expect(getSignaturePanelCaption("", "تجارب مختارة")).toBe("تجارب مختارة");
    expect(getSignaturePanelCaption("Traditional music, dance and drums from Nubia", "Fallback"))
      .toBe("Traditional music dance and drums from Nubia");
  });

  it("renders no visible CTA and leaves the whole card as the link", async () => {
    const { readFileSync } = await import("node:fs");
    const component = readFileSync(new URL("../SignatureMoments.tsx", import.meta.url), "utf8");
    expect(component).toContain('className="signature-panel"');
    expect(component).toContain('className="signature-panel-image"');
    expect(component).toContain('className="signature-panel-footer"');
    expect(component).not.toContain('signature-panel-discover');
    expect(component).not.toContain('signature-panel-chevron');
  });

  it("keeps five cards on desktop and all actual CMS cards visible in rows", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync(new URL("../../../app/globals.css", import.meta.url), "utf8");
    const panels = css.slice(css.indexOf("/* Signature Moments V2"));
    expect(panels).toContain("grid-template-columns: repeat(var(--signature-panel-cols, 5), minmax(0, 1fr))");
    expect(panels).toContain("grid-template-rows: 118px minmax(0, 1fr) 78px");
    expect(panels).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(panels).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  });
});
