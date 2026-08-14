import type { CmsMedia, GalleryItemRaw, RawApiMedia } from "./types";

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickUrl(raw: RawApiMedia): string | null {
  const url = raw.url || raw.original_url;
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** True when mime looks like an image (or is unknown — treat as image for legacy string URLs). */
export function isImageMime(mimeType?: string | null): boolean {
  if (!mimeType) return true;
  return mimeType.toLowerCase().startsWith("image/");
}

export function isLikelyFilenameAlt(alt: string): boolean {
  const t = alt.trim();
  if (!t) return true;
  if (/\.(jpe?g|png|gif|webp|avif|svg|bmp|heic)$/i.test(t)) return true;
  if (/^IMG[_-]?\d+/i.test(t)) return true;
  if (/^DSC[_-]?\d+/i.test(t)) return true;
  return false;
}

let syntheticId = -1;
function nextSyntheticId(): number {
  syntheticId -= 1;
  return syntheticId;
}

export function normalizeApiMedia(
  raw: RawApiMedia,
  index = 0
): CmsMedia | null {
  const url = pickUrl(raw);
  if (!url) return null;
  if (!isImageMime(raw.mime_type)) return null;

  return {
    id: asNumber(raw.id, nextSyntheticId()),
    url,
    thumbnailUrl: raw.thumbnail_url ?? null,
    mimeType: raw.mime_type ?? null,
    width: asOptionalNumber(raw.width),
    height: asOptionalNumber(raw.height),
    title: raw.title ?? null,
    altText: raw.alt_text ?? null,
    caption: raw.caption ?? null,
    collectionName: raw.collection_name ?? null,
    isCover: Boolean(raw.is_cover),
    sortOrder: asNumber(raw.sort_order, index),
    fileName: raw.file_name ?? null,
    size: asOptionalNumber(raw.size),
  };
}

export function normalizeGalleryItem(
  item: GalleryItemRaw,
  index = 0
): CmsMedia | null {
  if (typeof item === "string") {
    const url = item.trim();
    if (!url) return null;
    return {
      id: nextSyntheticId(),
      url,
      thumbnailUrl: null,
      mimeType: "image/*",
      width: null,
      height: null,
      title: null,
      altText: null,
      caption: null,
      collectionName: "gallery",
      isCover: false,
      sortOrder: index,
      fileName: null,
      size: null,
    };
  }
  return normalizeApiMedia(item, index);
}

export function normalizeMediaList(
  items: Array<GalleryItemRaw | RawApiMedia> | null | undefined
): CmsMedia[] {
  if (!items?.length) return [];
  const out: CmsMedia[] = [];
  items.forEach((item, index) => {
    const normalized = normalizeGalleryItem(item as GalleryItemRaw, index);
    if (normalized) out.push(normalized);
  });
  return dedupeMedia(out);
}

/** Remove duplicate ids / urls, keep first occurrence order then sort. */
export function dedupeMedia(items: CmsMedia[]): CmsMedia[] {
  const seenIds = new Set<number>();
  const seenUrls = new Set<string>();
  const unique: CmsMedia[] = [];

  for (const item of items) {
    if (item.id > 0 && seenIds.has(item.id)) continue;
    if (seenUrls.has(item.url)) continue;
    if (item.id > 0) seenIds.add(item.id);
    seenUrls.add(item.url);
    unique.push(item);
  }

  return unique;
}

export function sortMedia(items: CmsMedia[]): CmsMedia[] {
  return [...items].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}
