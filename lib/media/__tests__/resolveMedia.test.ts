import { describe, expect, it } from "vitest";
import {
  NEUTRAL_MEDIA_FALLBACK,
  coverImageAsMedia,
  normalizeMediaAsset,
  normalizeMediaList,
  dedupeMedia,
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
import { beforeEach, afterEach, vi } from "vitest";

const asset = (
  id: number,
  url: string,
  extra: Partial<{
    is_cover: boolean;
    sort_order: number;
    thumbnail_url: string;
    alt_text: string;
    mime_type: string;
    title: string;
  }> = {}
) => ({
  id,
  url,
  thumbnail_url: extra.thumbnail_url ?? null,
  file_name: `file-${id}.jpg`,
  mime_type: extra.mime_type ?? "image/jpeg",
  size: 1000,
  width: 1600,
  height: 900,
  title: extra.title ?? null,
  alt_text: extra.alt_text ?? null,
  caption: null,
  collection_name: "gallery",
  is_cover: extra.is_cover ?? false,
  sort_order: extra.sort_order ?? id,
});

describe("CMS MediaAsset normalization", () => {
  it("normalizes MediaAsset object fields once", () => {
    const media = normalizeMediaAsset(
      asset(9, "https://api.zalinaarabianvillage.com/media/assets/9", {
        is_cover: true,
        alt_text: "Lantern courtyard",
        thumbnail_url: "https://api.zalinaarabianvillage.com/media/assets/9/thumbnail",
      })
    );
    expect(media).toMatchObject({
      id: 9,
      url: "https://api.zalinaarabianvillage.com/media/assets/9",
      thumbnailUrl: "https://api.zalinaarabianvillage.com/media/assets/9/thumbnail",
      altText: "Lantern courtyard",
      isCover: true,
    });
  });

  it("cover_image = null yields no cover", () => {
    expect(coverImageAsMedia(null)).toBeNull();
    expect(resolveCoverMedia({ cover_image: null, gallery: [], media: [] })).toBeNull();
  });

  it("cover_image = MediaAsset object selects url", () => {
    const cover = resolveCoverMedia({
      cover_image: asset(123, "https://api.zalinaarabianvillage.com/media/assets/123"),
      gallery: [],
      media: [],
    });
    expect(cover?.url).toBe("https://api.zalinaarabianvillage.com/media/assets/123");
    expect(typeof cover?.url).toBe("string");
  });

  it("does not crash when cover_image is accidentally a string", () => {
    expect(() =>
      resolveCoverUrlSafe({
        // @ts-expect-error intentional bad input
        cover_image: "https://cdn.example/legacy.jpg",
      })
    ).not.toThrow();
  });

  it("filters non-image mime types", () => {
    expect(
      normalizeMediaAsset(
        asset(1, "https://cdn.example/clip.mp4", { mime_type: "video/mp4" })
      )
    ).toBeNull();
    expect(isImageMime("image/webp")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
  });

  it("invalid MediaAsset does not crash", () => {
    expect(normalizeMediaAsset({} as never)).toBeNull();
    expect(
      resolveCoverImage({
        cover_image: { id: 1 } as never,
        gallery: [],
        media: [],
      }).url
    ).toBe(NEUTRAL_MEDIA_FALLBACK);
  });
});

function resolveCoverUrlSafe(entity: Parameters<typeof resolveCoverImage>[0]) {
  return resolveCoverImage(entity).url;
}

describe("cover resolution priority", () => {
  it("prefers explicit cover_image MediaAsset", () => {
    const cover = resolveCoverMedia({
      cover_image: asset(10, "https://cdn.example/cover.jpg"),
      media: [asset(1, "https://cdn.example/media-cover.jpg", { is_cover: true })],
      gallery: [asset(2, "https://cdn.example/gallery.jpg")],
    });
    expect(cover?.url).toBe("https://cdn.example/cover.jpg");
  });

  it("prefers is_cover media when no cover_image", () => {
    const cover = resolveCoverMedia({
      cover_image: null,
      media: [
        asset(1, "https://cdn.example/a.jpg", { is_cover: false, sort_order: 0 }),
        asset(2, "https://cdn.example/b.jpg", { is_cover: true, sort_order: 5 }),
      ],
    });
    expect(cover?.url).toBe("https://cdn.example/b.jpg");
  });

  it("uses sort_order for first media image", () => {
    const cover = resolveCoverMedia({
      media: [
        asset(2, "https://cdn.example/second.jpg", { sort_order: 2 }),
        asset(1, "https://cdn.example/first.jpg", { sort_order: 1 }),
      ],
    });
    expect(cover?.url).toBe("https://cdn.example/first.jpg");
  });

  it("falls back to gallery[0] MediaAsset", () => {
    const cover = resolveCoverMedia({
      cover_image: null,
      media: [],
      gallery: [
        asset(1, "https://cdn.example/g0.jpg"),
        asset(2, "https://cdn.example/g1.jpg"),
      ],
    });
    expect(cover?.url).toBe("https://cdn.example/g0.jpg");
  });

  it("uses neutral fallback when empty", () => {
    const resolved = resolveCoverImage({
      cover_image: null,
      gallery: [],
      media: [],
    });
    expect(resolved.url).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(resolved.isFallback).toBe(true);
  });
});

describe("gallery / thumbnail / alt / dedupe", () => {
  it("gallery is MediaAsset[] and dedupes cover also present in media", () => {
    const gallery = resolveGalleryMedia(
      {
        cover_image: asset(3, "https://cdn.example/a.jpg", {
          is_cover: true,
          sort_order: 1,
        }),
        gallery: [],
        media: [
          asset(3, "https://cdn.example/a.jpg", {
            is_cover: true,
            sort_order: 1,
          }),
          asset(2, "https://cdn.example/b.jpg", { sort_order: 2 }),
        ],
      },
      { coverFirst: true }
    );
    expect(gallery.map((g) => g.id)).toEqual([3, 2]);
    expect(gallery).toHaveLength(2);
  });

  it("selects thumbnail_url for thumbnail mode", () => {
    const media = normalizeMediaAsset(
      asset(1, "https://cdn.example/full.jpg", {
        thumbnail_url: "https://cdn.example/thumb.jpg",
      })
    )!;
    expect(selectDisplayUrl(media, true)).toBe("https://cdn.example/thumb.jpg");
    expect(selectDisplayUrl(media, false)).toBe("https://cdn.example/full.jpg");
  });

  it("alt_text beats entity name; rejects filenames", () => {
    const media = normalizeMediaAsset(
      asset(1, "https://cdn.example/x.jpg", { alt_text: "Private majlis at dusk" })
    )!;
    expect(resolveMediaAlt(media, { entityName: "VIP Zone" })).toBe(
      "Private majlis at dusk"
    );
    const filenameAlt = normalizeMediaAsset(
      asset(2, "https://cdn.example/y.jpg", { alt_text: "IMG_3882.jpg" })
    )!;
    expect(
      resolveMediaAlt(filenameAlt, { entityName: "Al-Souk Village" })
    ).toBe("Al-Souk Village");
  });

  it("localized entity-name alt fallback", () => {
    expect(resolveMediaAlt(null, { entityName: "قرية السوق" })).toBe(
      "قرية السوق"
    );
  });

  it("dedupeMedia removes duplicate ids and urls", () => {
    const list = normalizeMediaList([
      asset(1, "https://cdn.example/a.jpg"),
      asset(1, "https://cdn.example/a-dup.jpg"),
      asset(2, "https://cdn.example/a.jpg"),
      asset(3, "https://cdn.example/b.jpg"),
    ]);
    expect(dedupeMedia(list).map((m) => m.id)).toEqual([1, 3]);
  });
});

describe("entity media helpers", () => {
  it("accommodation cover object works", () => {
    expect(
      resolveAccommodationImage({
        cover_image: asset(3, "https://api.zalinaarabianvillage.com/media/assets/3"),
        gallery: [],
        media: [],
      })
    ).toBe("https://api.zalinaarabianvillage.com/media/assets/3");
  });

  it("bubble own cover beats parent cover", () => {
    const bubble = resolveBubbleCoverImage(
      {
        cover_image: asset(1, "https://api.zalinaarabianvillage.com/media/assets/1"),
      },
      {
        cover_image: asset(99, "https://api.zalinaarabianvillage.com/media/assets/99"),
      }
    );
    expect(bubble.url).toBe("https://api.zalinaarabianvillage.com/media/assets/1");
  });

  it("bubble availability falls back to parent accommodation", () => {
    expect(
      resolveBubbleImage(
        { cover_image: null, gallery: [], media: [] },
        {
          cover_image: asset(5, "https://api.zalinaarabianvillage.com/media/assets/5"),
        }
      )
    ).toBe("https://api.zalinaarabianvillage.com/media/assets/5");
  });

  it("zone and experience cover objects work", () => {
    expect(
      resolveCoverImage({
        cover_image: asset(7, "https://cdn.example/zone.jpg"),
      }).url
    ).toBe("https://cdn.example/zone.jpg");
    expect(
      resolveCoverImage({
        gallery: [asset(8, "https://cdn.example/exp.jpg")],
      }).url
    ).toBe("https://cdn.example/exp.jpg");
  });

  it("resolvers always return string URLs — never MediaAsset objects", () => {
    const url = resolveAccommodationImage({
      cover_image: asset(3, "https://api.zalinaarabianvillage.com/media/assets/3"),
    });
    expect(typeof url).toBe("string");
    expect(url).not.toContain("[object Object]");
  });

  it("no type/slug → local business-image mapping", () => {
    expect(zoneFallbackImage("souk")).toBe(NEUTRAL_MEDIA_FALLBACK);
    expect(experienceFallbackImage("dinner")).toBe(NEUTRAL_MEDIA_FALLBACK);
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
    expect(assertCmsMediaOwner("zones")).toBe("zone");
    expect(assertCmsMediaOwner("bubbles")).toBe("bubble");
  });

  it("dedupes concurrent listMediaForModel requests", async () => {
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
  });
});
