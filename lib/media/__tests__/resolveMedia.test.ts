import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  NEUTRAL_MEDIA_FALLBACK,
  normalizeApiMedia,
  normalizeMediaList,
  dedupeMedia,
  sortMedia,
  resolveCoverMedia,
  resolveCoverImage,
  resolveBubbleCoverImage,
  resolveGalleryMedia,
  resolveMediaAlt,
  selectDisplayUrl,
  isImageMime,
  zoneFallbackImage,
  experienceFallbackImage,
} from "@/lib/media";
import {
  assertCmsMediaOwner,
  clearMediaRequestCache,
  listMediaForModel,
  UnsupportedMediaOwnerError,
} from "@/lib/api/media";
import {
  resolveAccommodationImage,
  resolveBubbleImage,
} from "@/components/book-now/bookingMedia";

describe("CMS media normalization", () => {
  it("normalizes snake_case API fields once", () => {
    const media = normalizeApiMedia({
      id: 9,
      url: "https://cdn.example/full.jpg",
      thumbnail_url: "https://cdn.example/thumb.jpg",
      mime_type: "image/jpeg",
      width: 1600,
      height: 900,
      title: "Courtyard",
      alt_text: "Lantern courtyard",
      caption: "Evening",
      collection_name: "gallery",
      is_cover: true,
      sort_order: 2,
      file_name: "courtyard.jpg",
      size: 12000,
    });
    expect(media).toMatchObject({
      id: 9,
      url: "https://cdn.example/full.jpg",
      thumbnailUrl: "https://cdn.example/thumb.jpg",
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      altText: "Lantern courtyard",
      isCover: true,
      sortOrder: 2,
    });
  });

  it("filters non-image mime types", () => {
    expect(
      normalizeApiMedia({
        id: 1,
        url: "https://cdn.example/clip.mp4",
        mime_type: "video/mp4",
      })
    ).toBeNull();
    expect(isImageMime("image/webp")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
  });
});

describe("cover resolution priority", () => {
  it("prefers explicit cover_image", () => {
    const cover = resolveCoverMedia({
      cover_image: "https://cdn.example/cover.jpg",
      media: [
        {
          id: 1,
          url: "https://cdn.example/media-cover.jpg",
          is_cover: true,
          mime_type: "image/jpeg",
        },
      ],
      gallery: ["https://cdn.example/gallery.jpg"],
    });
    expect(cover?.url).toBe("https://cdn.example/cover.jpg");
  });

  it("prefers is_cover media when no cover_image", () => {
    const cover = resolveCoverMedia({
      cover_image: null,
      media: [
        {
          id: 1,
          url: "https://cdn.example/a.jpg",
          is_cover: false,
          sort_order: 0,
          mime_type: "image/jpeg",
        },
        {
          id: 2,
          url: "https://cdn.example/b.jpg",
          is_cover: true,
          sort_order: 5,
          mime_type: "image/jpeg",
        },
      ],
    });
    expect(cover?.url).toBe("https://cdn.example/b.jpg");
  });

  it("uses sort_order for first media image", () => {
    const cover = resolveCoverMedia({
      media: [
        {
          id: 2,
          url: "https://cdn.example/second.jpg",
          sort_order: 2,
          mime_type: "image/jpeg",
        },
        {
          id: 1,
          url: "https://cdn.example/first.jpg",
          sort_order: 1,
          mime_type: "image/jpeg",
        },
      ],
    });
    expect(cover?.url).toBe("https://cdn.example/first.jpg");
  });

  it("falls back to gallery[0]", () => {
    const cover = resolveCoverMedia({
      cover_image: null,
      media: [],
      gallery: ["https://cdn.example/g0.jpg", "https://cdn.example/g1.jpg"],
    });
    expect(cover?.url).toBe("https://cdn.example/g0.jpg");
  });

  it("uses neutral fallback when empty", () => {
    const resolved = resolveCoverImage({ cover_image: null, gallery: [], media: [] });
    expect(resolved.url).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(resolved.isFallback).toBe(true);
  });
});

describe("gallery / thumbnail / alt", () => {
  it("sorts gallery and removes duplicates", () => {
    const gallery = resolveGalleryMedia({
      cover_image: "https://cdn.example/a.jpg",
      gallery: [
        "https://cdn.example/a.jpg",
        { id: 3, url: "https://cdn.example/c.jpg", sort_order: 3, mime_type: "image/jpeg" },
      ],
      media: [
        { id: 3, url: "https://cdn.example/c.jpg", sort_order: 3, mime_type: "image/jpeg" },
        { id: 2, url: "https://cdn.example/b.jpg", sort_order: 2, mime_type: "image/jpeg" },
      ],
    });
    const urls = gallery.map((g) => g.url);
    expect(urls).toEqual([
      "https://cdn.example/a.jpg",
      "https://cdn.example/b.jpg",
      "https://cdn.example/c.jpg",
    ]);
  });

  it("selects thumbnail for compact cards", () => {
    const media = normalizeApiMedia({
      id: 1,
      url: "https://cdn.example/full.jpg",
      thumbnail_url: "https://cdn.example/thumb.jpg",
      mime_type: "image/jpeg",
    })!;
    expect(selectDisplayUrl(media, true)).toBe("https://cdn.example/thumb.jpg");
    expect(selectDisplayUrl(media, false)).toBe("https://cdn.example/full.jpg");
  });

  it("alt_text beats entity name; rejects filenames", () => {
    const media = normalizeApiMedia({
      id: 1,
      url: "https://cdn.example/x.jpg",
      alt_text: "Private majlis at dusk",
      file_name: "IMG_3882.jpg",
      mime_type: "image/jpeg",
    })!;
    expect(resolveMediaAlt(media, { entityName: "VIP Zone" })).toBe(
      "Private majlis at dusk"
    );
    const filenameAlt = normalizeApiMedia({
      id: 2,
      url: "https://cdn.example/y.jpg",
      alt_text: "IMG_3882.jpg",
      mime_type: "image/jpeg",
    })!;
    expect(
      resolveMediaAlt(filenameAlt, { entityName: "Al-Souk Village" })
    ).toBe("Al-Souk Village");
  });

  it("localized entity-name alt fallback", () => {
    expect(
      resolveMediaAlt(null, { entityName: "قرية السوق" })
    ).toBe("قرية السوق");
  });
});

describe("entity media helpers", () => {
  it("accommodation media uses shared resolver", () => {
    expect(
      resolveAccommodationImage({
        cover_image: "https://cdn.example/type.jpg",
        gallery: ["https://cdn.example/g.jpg"],
      })
    ).toBe("https://cdn.example/type.jpg");
  });

  it("bubble media falls back to parent accommodation only", () => {
    expect(
      resolveBubbleImage(
        { cover_image: null, gallery: [], media: [] },
        { cover_image: "https://cdn.example/type.jpg" }
      )
    ).toBe("https://cdn.example/type.jpg");

    const bubble = resolveBubbleCoverImage(
      {
        media: [
          {
            id: 1,
            url: "https://cdn.example/bubble.jpg",
            mime_type: "image/jpeg",
          },
        ],
      },
      { cover_image: "https://cdn.example/other-type.jpg" }
    );
    expect(bubble.url).toBe("https://cdn.example/bubble.jpg");
  });

  it("zone and experience covers resolve without slug maps", () => {
    expect(
      resolveCoverImage({
        cover_image: "https://cdn.example/zone.jpg",
      }).url
    ).toBe("https://cdn.example/zone.jpg");
    expect(
      resolveCoverImage({
        gallery: [{ id: 1, url: "https://cdn.example/exp.jpg", mime_type: "image/jpeg" }],
      }).url
    ).toBe("https://cdn.example/exp.jpg");
  });

  it("no type/slug → local business-image mapping", () => {
    expect(zoneFallbackImage("souk")).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(zoneFallbackImage("vip")).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(experienceFallbackImage("dinner")).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(experienceFallbackImage("show")).toBe(NEUTRAL_MEDIA_FALLBACK);
  });
});

describe("media owner API", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
    clearMediaRequestCache();
  });

  afterEach(() => {
    clearMediaRequestCache();
    vi.restoreAllMocks();
  });

  it("rejects unsupported media model types", () => {
    expect(() => assertCmsMediaOwner("add-on")).toThrow(UnsupportedMediaOwnerError);
    expect(() => assertCmsMediaOwner("addon")).toThrow(UnsupportedMediaOwnerError);
    expect(() => assertCmsMediaOwner("page")).toThrow(UnsupportedMediaOwnerError);
    expect(assertCmsMediaOwner("zones")).toBe("zone");
    expect(assertCmsMediaOwner("bubbles")).toBe("bubble");
  });

  it("dedupes concurrent listMediaForModel requests (no N+1 stampede)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, message: "ok", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await Promise.all([
      listMediaForModel("zone", 3),
      listMediaForModel("zones", 3),
      listMediaForModel("zone", 3),
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain("/media/zone/3");
  });

  it("does not call add-on generic media endpoint from typed helper", () => {
    expect(() => assertCmsMediaOwner("add-on")).toThrow(/Unsupported media model type/);
  });
});

describe("dedupeMedia utility", () => {
  it("removes duplicate ids and urls", () => {
    const list = normalizeMediaList([
      { id: 1, url: "https://cdn.example/a.jpg", mime_type: "image/jpeg" },
      { id: 1, url: "https://cdn.example/a-dup.jpg", mime_type: "image/jpeg" },
      { id: 2, url: "https://cdn.example/a.jpg", mime_type: "image/jpeg" },
      { id: 3, url: "https://cdn.example/b.jpg", mime_type: "image/jpeg" },
    ]);
    expect(dedupeMedia(list).map((m) => m.id)).toEqual([1, 3]);
  });

  it("sortMedia keeps cover first", () => {
    const sorted = sortMedia(
      normalizeMediaList([
        { id: 1, url: "https://cdn.example/a.jpg", sort_order: 0, mime_type: "image/jpeg" },
        {
          id: 2,
          url: "https://cdn.example/b.jpg",
          is_cover: true,
          sort_order: 9,
          mime_type: "image/jpeg",
        },
      ])
    );
    expect(sorted[0].id).toBe(2);
  });
});
