import { describe, expect, it } from "vitest";
import type { ApiZone } from "@/lib/api/types";
import {
  findMarketZone,
  marketZoneCoverCard,
  marketZoneGalleryToCards,
  zonesToMarketCardsWithSize,
} from "../homeCatalogMedia";
import type { MediaAsset } from "../types";

function asset(
  id: number,
  url: string,
  extras: Partial<MediaAsset> = {}
): MediaAsset {
  return {
    id,
    url,
    mime_type: "image/png",
    ...extras,
  };
}

function zone(partial: Partial<ApiZone> & Pick<ApiZone, "id" | "name_en">): ApiZone {
  return {
    name_ar: partial.name_ar || partial.name_en,
    slug_en: partial.slug_en || `zone-${partial.id}`,
    slug_ar: partial.slug_ar || `zone-${partial.id}`,
    cover_image: null,
    gallery: [],
    media: [],
    ...partial,
  };
}

describe("findMarketZone", () => {
  it("prefers al-souk-village slug", () => {
    const zones = [
      zone({ id: 3, name_en: "Arrival Plaza", slug_en: "arrival-plaza" }),
      zone({ id: 1, name_en: "Al-Souk Village", slug_en: "al-souk-village" }),
      zone({ id: 2, name_en: "Food", slug_en: "food" }),
    ];
    expect(findMarketZone(zones)?.id).toBe(1);
  });

  it("matches souk/market by name when slug differs", () => {
    const zones = [
      zone({ id: 9, name_en: "Desert Market", slug_en: "desert-market" }),
    ];
    expect(findMarketZone(zones)?.id).toBe(9);
  });
});

describe("marketZoneCoverCard", () => {
  it("uses the same cover_image as /zones Main Zones", () => {
    const market = zone({
      id: 1,
      name_en: "Al-Souk Village",
      slug_en: "al-souk-village",
      cover_image: asset(6, "https://api.example/media/assets/6"),
      gallery: [
        asset(10, "https://api.example/media/assets/10", {
          title: "Spice Court",
        }),
      ],
    });

    const card = marketZoneCoverCard(market);
    expect(card.image).toBe("https://api.example/media/assets/6");
    expect(card.title).toBe("Al-Souk Village");
    expect(card.href).toBe("/zones");
  });
});

describe("marketZoneGalleryToCards", () => {
  it("uses gallery MediaAsset[] instead of listing all zones", () => {
    const market = zone({
      id: 1,
      name_en: "Al-Souk Village",
      slug_en: "al-souk-village",
      cover_image: asset(6, "https://api.example/media/assets/6"),
      gallery: [
        asset(10, "https://api.example/media/assets/10", {
          title: "Spice Court",
          caption: "Lantern lane",
        }),
        asset(11, "https://api.example/media/assets/11", {
          title: "Artisan Tent",
        }),
      ],
    });
    const other = zone({
      id: 2,
      name_en: "Arrival Plaza",
      slug_en: "arrival-plaza",
      cover_image: asset(99, "https://api.example/media/assets/99"),
    });

    const cards = marketZoneGalleryToCards(market);
    expect(cards).toHaveLength(2);
    expect(cards.map((c) => c.image)).toEqual([
      "https://api.example/media/assets/10",
      "https://api.example/media/assets/11",
    ]);
    expect(cards.some((c) => c.image.includes("/99"))).toBe(false);
    expect(zonesToMarketCardsWithSize([other, market])).toHaveLength(2);
  });

  it("falls back to zone media/cover when gallery is empty", () => {
    const market = zone({
      id: 1,
      name_en: "Al-Souk Village",
      slug_en: "al-souk-village",
      cover_image: asset(6, "https://api.example/media/assets/6"),
      gallery: [],
    });
    const cards = marketZoneGalleryToCards(market, [
      {
        id: 6,
        url: "https://api.example/media/assets/6",
        isCover: true,
        sortOrder: 1,
        altText: "test zone alt text",
      },
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0].image).toBe("https://api.example/media/assets/6");
  });

  it("does not emit MediaAsset objects as image src", () => {
    const cards = marketZoneGalleryToCards(
      zone({
        id: 1,
        name_en: "Al-Souk Village",
        slug_en: "al-souk-village",
        gallery: [asset(10, "https://api.example/media/assets/10")],
      })
    );
    expect(typeof cards[0].image).toBe("string");
    expect(cards[0].image).not.toContain("[object Object]");
  });
});
