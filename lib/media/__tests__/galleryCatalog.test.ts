import { describe, expect, it } from "vitest";
import type { AccommodationType } from "@/lib/api/booking-types";
import type { ApiExperience, ApiZone } from "@/lib/api/types";
import { NEUTRAL_MEDIA_FALLBACK } from "../fallback";
import type { MediaAsset } from "../types";
import {
  buildGalleryCatalog,
  dedupeGalleryItems,
  filterGalleryItems,
  galleryItemAlt,
  interleaveGalleryCategories,
  type GalleryItem,
} from "../galleryCatalog";

function asset(
  id: number,
  url: string,
  extras: Partial<MediaAsset> = {}
): MediaAsset {
  return {
    id,
    url,
    mime_type: "image/png",
    sort_order: extras.sort_order ?? id,
    ...extras,
  };
}

function experience(
  partial: Partial<ApiExperience> & Pick<ApiExperience, "id" | "name_en">
): ApiExperience {
  return {
    name_ar: partial.name_ar || partial.name_en,
    type: "dinner",
    is_active: true,
    cover_image: null,
    gallery: [],
    media: [],
    ...partial,
  };
}

function zone(
  partial: Partial<ApiZone> & Pick<ApiZone, "id" | "name_en">
): ApiZone {
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

function accommodation(
  partial: Partial<AccommodationType> &
    Pick<AccommodationType, "id" | "name_en" | "slug_en">
): AccommodationType {
  return {
    name_ar: partial.name_ar || partial.name_en,
    slug_ar: partial.slug_ar || partial.slug_en,
    max_guests: 2,
    price_per_night: "1000",
    is_active: true,
    bubbles_count: partial.bubbles?.length ?? 0,
    cover_image: null,
    gallery: [],
    media: [],
    bubbles: [],
    ...partial,
  };
}

describe("buildGalleryCatalog", () => {
  it("maps experience media → Experiences", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Traditional Bedouin Dinner",
          cover_image: asset(13, "https://api.example/media/assets/13"),
          media: [asset(13, "https://api.example/media/assets/13")],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.counts.experiences).toBe(1);
    expect(catalog.items[0].category).toBe("experiences");
    expect(catalog.items[0].sourceType).toBe("experience");
    expect(catalog.items[0].media.url).toContain("/13");
  });

  it("maps zone media → Zones", () => {
    const catalog = buildGalleryCatalog({
      experiences: [],
      zones: [
        zone({
          id: 1,
          name_en: "Al-Souk Village",
          gallery: [asset(6, "https://api.example/media/assets/6")],
        }),
      ],
      accommodations: [],
    });
    expect(catalog.counts.zones).toBe(1);
    expect(catalog.items[0].category).toBe("zones");
    expect(catalog.items[0].sourceName).toBe("Al-Souk Village");
  });

  it("maps accommodation type media → Bubble Stays", () => {
    const catalog = buildGalleryCatalog({
      experiences: [],
      zones: [],
      accommodations: [
        accommodation({
          id: 1,
          name_en: "One Bed Bubble",
          slug_en: "one-bed",
          cover_image: asset(20, "https://api.example/media/assets/20"),
        }),
      ],
    });
    expect(catalog.counts.bubbles).toBe(1);
    expect(catalog.items[0].sourceType).toBe("accommodation");
    expect(catalog.items[0].category).toBe("bubbles");
  });

  it("maps physical bubble media → Bubble Stays", () => {
    const catalog = buildGalleryCatalog({
      experiences: [],
      zones: [],
      accommodations: [
        accommodation({
          id: 1,
          name_en: "One Bed Bubble",
          slug_en: "one-bed",
          bubbles: [
            {
              id: 7,
              name_en: "CLEOPATRA Suite",
              name_ar: "كليوباترا",
              status: "available",
              cover_image: asset(29, "https://api.example/media/assets/29"),
              media: [asset(29, "https://api.example/media/assets/29")],
            },
          ],
        }),
      ],
    });
    expect(catalog.counts.bubbles).toBe(1);
    expect(catalog.items[0].sourceType).toBe("bubble");
    expect(catalog.items[0].sourceName).toBe("CLEOPATRA Suite");
  });

  it("ALL combines categories", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          media: [asset(1, "https://api.example/media/assets/1")],
        }),
      ],
      zones: [
        zone({
          id: 1,
          name_en: "Souk",
          media: [asset(2, "https://api.example/media/assets/2")],
        }),
      ],
      accommodations: [
        accommodation({
          id: 1,
          name_en: "One Bed",
          slug_en: "one",
          media: [asset(3, "https://api.example/media/assets/3")],
        }),
      ],
    });
    expect(catalog.counts.all).toBe(3);
    expect(catalog.availableFilters).toEqual([
      "all",
      "experiences",
      "zones",
      "bubbles",
    ]);
  });

  it("dedupes media by id (cover + media)", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          cover_image: asset(13, "https://api.example/media/assets/13", {
            is_cover: true,
          }),
          media: [
            asset(13, "https://api.example/media/assets/13", {
              is_cover: true,
            }),
          ],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.counts.experiences).toBe(1);
  });

  it("dedupes by normalized URL when ids differ", () => {
    const items = dedupeGalleryItems([
      {
        key: "a",
        media: {
          id: 1,
          url: "https://api.example/media/assets/x",
          isCover: false,
          sortOrder: 0,
        },
        sourceType: "zone",
        sourceId: 1,
        sourceName: "A",
        sourceNameAr: "A",
        category: "zones",
        sortOrder: 0,
        isCover: false,
        aspect: "wide",
        entityDisplayOrder: 0,
      },
      {
        key: "b",
        media: {
          id: 2,
          url: "HTTPS://API.EXAMPLE/MEDIA/ASSETS/X",
          isCover: false,
          sortOrder: 1,
        },
        sourceType: "zone",
        sourceId: 1,
        sourceName: "A",
        sourceNameAr: "A",
        category: "zones",
        sortOrder: 1,
        isCover: false,
        aspect: "wide",
        entityDisplayOrder: 0,
      },
    ]);
    expect(items).toHaveLength(1);
  });

  it("respects sort_order within an entity", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          media: [
            asset(2, "https://api.example/media/assets/2", { sort_order: 2 }),
            asset(1, "https://api.example/media/assets/1", { sort_order: 1 }),
          ],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.items.map((i) => i.media.id)).toEqual([1, 2]);
  });

  it("hides empty categories from available filters", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          media: [asset(1, "https://api.example/media/assets/1")],
        }),
      ],
      zones: [zone({ id: 1, name_en: "Empty Zone" })],
      accommodations: [],
    });
    expect(catalog.availableFilters).toEqual(["all", "experiences"]);
    expect(catalog.counts.zones).toBe(0);
  });

  it("does not manufacture neutral placeholder gallery content", () => {
    const catalog = buildGalleryCatalog({
      experiences: [],
      zones: [zone({ id: 1, name_en: "Empty" })],
      accommodations: [],
    });
    expect(catalog.items).toHaveLength(0);
    expect(
      catalog.items.some((i) => i.media.url === NEUTRAL_MEDIA_FALLBACK)
    ).toBe(false);
  });

  it("filters non-image media safely", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          media: [
            asset(1, "https://api.example/media/assets/1", {
              mime_type: "video/mp4",
            }),
            asset(2, "https://api.example/media/assets/2", {
              mime_type: "image/jpeg",
            }),
          ],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.counts.experiences).toBe(1);
    expect(catalog.items[0].media.id).toBe(2);
  });

  it("normalizes MediaAsset objects (not URL strings)", () => {
    const catalog = buildGalleryCatalog({
      zones: [
        zone({
          id: 1,
          name_en: "Souk",
          cover_image: asset(6, "https://api.example/media/assets/6", {
            alt_text: "Souk at dusk",
            title: "Spice Court",
            caption: "Lantern lane",
          }),
        }),
      ],
      experiences: [],
      accommodations: [],
    });
    expect(catalog.items[0].media.altText).toBe("Souk at dusk");
    expect(catalog.items[0].media.title).toBe("Spice Court");
    expect(catalog.items[0].caption).toBe("Lantern lane");
  });

  it("lightbox filter dataset respects active category", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          media: [asset(1, "https://api.example/media/assets/1")],
        }),
      ],
      zones: [
        zone({
          id: 1,
          name_en: "Souk",
          media: [asset(2, "https://api.example/media/assets/2")],
        }),
      ],
      accommodations: [],
    });
    const zonesOnly = filterGalleryItems(catalog.items, "zones");
    expect(zonesOnly).toHaveLength(1);
    expect(zonesOnly.every((i) => i.category === "zones")).toBe(true);
  });

  it("resolves localized source names", () => {
    const catalog = buildGalleryCatalog({
      locale: "ar",
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          name_ar: "عشاء بدوي",
          media: [asset(1, "https://api.example/media/assets/1")],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.items[0].sourceName).toBe("عشاء بدوي");
    expect(galleryItemAlt(catalog.items[0], "ar")).toContain("عشاء");
  });

  it("does not borrow parent accommodation image for empty bubble", () => {
    const catalog = buildGalleryCatalog({
      experiences: [],
      zones: [],
      accommodations: [
        accommodation({
          id: 1,
          name_en: "One Bed Bubble",
          slug_en: "one-bed",
          cover_image: asset(20, "https://api.example/media/assets/20"),
          bubbles: [
            {
              id: 1,
              name_en: "RA Suite",
              name_ar: "رع",
              status: "available",
              cover_image: null,
              media: [],
              gallery: [],
            },
          ],
        }),
      ],
    });
    expect(catalog.counts.bubbles).toBe(1);
    expect(catalog.items[0].sourceType).toBe("accommodation");
    expect(catalog.items.some((i) => i.sourceType === "bubble")).toBe(false);
  });

  it("malformed media cannot crash gallery", () => {
    const catalog = buildGalleryCatalog({
      experiences: [
        experience({
          id: 1,
          name_en: "Dinner",
          // @ts-expect-error intentional malformed cover
          cover_image: "https://not-an-asset",
          media: [
            // @ts-expect-error intentional junk
            { id: "bad", url: null },
            asset(5, "https://api.example/media/assets/5"),
          ],
        }),
      ],
      zones: [],
      accommodations: [],
    });
    expect(catalog.counts.experiences).toBe(1);
    expect(catalog.items[0].media.id).toBe(5);
  });

  it("interleave is deterministic and balanced", () => {
    const make = (
      category: GalleryItem["category"],
      id: number
    ): GalleryItem => ({
      key: `${category}-${id}`,
      media: {
        id,
        url: `https://api.example/media/assets/${id}`,
        isCover: false,
        sortOrder: 0,
      },
      sourceType:
        category === "experiences"
          ? "experience"
          : category === "zones"
            ? "zone"
            : "bubble",
      sourceId: id,
      sourceName: String(id),
      sourceNameAr: String(id),
      category,
      sortOrder: 0,
      isCover: false,
      aspect: "wide",
      entityDisplayOrder: 0,
    });
    const a = [make("experiences", 1), make("experiences", 2)];
    const b = [make("zones", 10)];
    const c = [make("bubbles", 20), make("bubbles", 21), make("bubbles", 22)];
    const first = interleaveGalleryCategories(a, b, c).map((i) => i.key);
    const second = interleaveGalleryCategories(a, b, c).map((i) => i.key);
    expect(first).toEqual(second);
    expect(first[0]).toBe("experiences-1");
    expect(first[1]).toBe("zones-10");
    expect(first[2]).toBe("bubbles-20");
  });
});

describe("gallery hard-coded photography guard", () => {
  it("gallery.data has no photography catalog arrays", async () => {
    const data = await import("@/sections/gallery/gallery.data");
    expect(data).not.toHaveProperty("GALLERY_ITEMS");
    expect(data).not.toHaveProperty("FEATURED_STORY_ITEMS");
    expect(data).not.toHaveProperty("DAY_NIGHT_FRAMES");
    expect(data).not.toHaveProperty("WEDDING_PREVIEW_ITEMS");
    expect(data).not.toHaveProperty("ATMOSPHERE_ITEMS");
    expect(data).not.toHaveProperty("REEL_ITEMS");
  });
});
