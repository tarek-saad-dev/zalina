import { describe, expect, it } from "vitest";
import type { CatalogMediaCard } from "@/lib/media";
import { selectSignatureMomentCards } from "../signatureMomentsLayout";

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
      .toEqual(["0", "1", "2", "3"]);
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
