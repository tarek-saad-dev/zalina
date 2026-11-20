import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";

vi.mock("framer-motion", () => ({ motion: {}, useReducedMotion: () => false }));
vi.mock("@/i18n/navigation", () => ({ Link: "a" }));
vi.mock("@/components/media/CmsImage", () => ({ CmsImage: () => null }));

import { SignatureMomentsV1, type SignatureMomentsV1Props } from "../SignatureMomentsV1";

const props: SignatureMomentsV1Props = {
  cards: [{ id: "one", title: "First", subtitle: "Three golden words here", image: "/one.jpg", alt: "First", href: "/first" },
    { id: "two", title: "Second", image: "/two.jpg", alt: "Second" }],
  fallback: { id: "fallback", title: "Fallback", image: "/fallback.jpg", alt: "Fallback" },
  locale: "en", defaultHref: "/catalog",
  labels: { title: "Our moments", carouselAria: "Moments", navigateHint: "Use arrows", discover: "Explore", cardAria: title => `Explore ${title}`, showMomentAria: title => `Show ${title}` },
};

describe("preserved Signature Moments v1", () => {
  it("renders caller content, links, carousel and slides", () => {
    const html = renderToStaticMarkup(createElement(SignatureMomentsV1, props));
    expect(html).toContain("Our moments");
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('aria-roledescription="slide"');
    expect(html).toContain('href="/first"');
    expect(html).toContain("Show Second");
    expect(html).toContain("signature-moments-v1-copy-panel");
  });
  it("uses caller fallback and Arabic direction", () => {
    const html = renderToStaticMarkup(createElement(SignatureMomentsV1, { ...props, cards: [], locale: "ar" }));
    expect(html).toContain("Fallback");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('href="/catalog"');
  });
  it("keeps responsive sizing and visibility rules in its own stylesheet", () => {
    const css = readFileSync(new URL("../signature-moments-v1.css", import.meta.url), "utf8");
    expect(css).toContain("--moment-card-width: clamp(168px, 49vw, 218px)");
    expect(css).toContain("max-width: 1449px");
    expect(css).toContain("min-height: calc(100svh - var(--zalina-nav-height, 80px))");
  });
});
