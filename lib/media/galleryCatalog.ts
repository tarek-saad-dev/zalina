/**
 * CMS-driven Gallery catalog builder.
 *
 * Sources (catalog only — never availability endpoints):
 *   GET /experiences
 *   GET /zones
 *   GET /accommodations  (+ nested physical bubbles)
 *
 * Nested cover_image / gallery / media are preferred.
 * Optional GET /media/{owner}/{id} enrichment is available when nested is empty.
 */

import type { AccommodationType, PhysicalBubble } from "@/lib/api/booking-types";
import type { ApiExperience, ApiZone } from "@/lib/api/types";
import {
  collectEntityMedia,
  resolveMediaAlt,
} from "./resolveMedia";
import { dedupeMedia } from "./normalize";
import type { CmsMedia, CmsMediaOwner, MediaBearingEntity } from "./types";

export const GALLERY_FILTER_IDS = [
  "all",
  "experiences",
  "zones",
  "bubbles",
] as const;

export type GalleryFilterId = (typeof GALLERY_FILTER_IDS)[number];

/** Guest-facing filter categories (All is not a media category). */
export type GalleryCategory = Exclude<GalleryFilterId, "all">;

export type GallerySourceType =
  | "experience"
  | "zone"
  | "accommodation"
  | "bubble";

export type GalleryAspect = "wide" | "portrait" | "square" | "tall";

export interface GalleryItem {
  key: string;
  media: CmsMedia;
  sourceType: GallerySourceType;
  sourceId: number;
  sourceName: string;
  sourceNameAr: string;
  sourceSlug?: string | null;
  category: GalleryCategory;
  caption?: string | null;
  sortOrder: number;
  isCover: boolean;
  /** Derived layout hint for masonry — never used as content. */
  aspect: GalleryAspect;
  entityDisplayOrder: number;
}

export interface GalleryCatalogResult {
  items: GalleryItem[];
  counts: Record<GalleryFilterId, number>;
  /** Filters with at least one real CMS image (always includes all when any). */
  availableFilters: GalleryFilterId[];
}

export interface BuildGalleryCatalogInput {
  experiences: ApiExperience[];
  zones: ApiZone[];
  accommodations: AccommodationType[];
  locale?: "en" | "ar";
  /**
   * Optional prefetched GET /media results keyed by `owner:id`.
   * Used only when nested entity media is empty — avoids N+1 by default.
   */
  extraMediaByOwner?: Record<string, CmsMedia[]>;
}

/** Translation-ready filter labels (EN defaults; AR phase wires these keys). */
export const GALLERY_I18N_KEYS = {
  all: "gallery.all",
  experiences: "gallery.experiences",
  zones: "gallery.zones",
  bubbleStays: "gallery.bubbleStays",
  empty: "gallery.empty",
  previous: "gallery.previous",
  next: "gallery.next",
  close: "gallery.close",
} as const;

export const GALLERY_FILTER_LABELS_EN: Record<GalleryFilterId, string> = {
  all: "All",
  experiences: "Experiences",
  zones: "Zones",
  bubbles: "Bubble Stays",
};

export function isGalleryFilterId(value: string): value is GalleryFilterId {
  return (GALLERY_FILTER_IDS as readonly string[]).includes(value);
}

export function getSafeGalleryFilterId(value: string): GalleryFilterId {
  return isGalleryFilterId(value) ? value : "all";
}

function mediaOwnerKey(owner: CmsMediaOwner, id: number): string {
  return `${owner}:${id}`;
}

function aspectFromMedia(media: CmsMedia, index: number): GalleryAspect {
  const w = media.width;
  const h = media.height;
  if (typeof w === "number" && typeof h === "number" && w > 0 && h > 0) {
    const ratio = w / h;
    if (ratio >= 1.45) return "wide";
    if (ratio <= 0.72) return "tall";
    if (ratio <= 0.92) return "portrait";
    return "square";
  }
  const cycle: GalleryAspect[] = ["wide", "portrait", "square", "tall"];
  return cycle[index % cycle.length];
}

function localizedName(
  nameEn: string,
  nameAr: string | null | undefined,
  locale: "en" | "ar"
): string {
  if (locale === "ar" && nameAr?.trim()) return nameAr.trim();
  return nameEn.trim() || nameAr?.trim() || "Zalina";
}

function pushEntityMedia(options: {
  items: GalleryItem[];
  entity: MediaBearingEntity;
  sourceType: GallerySourceType;
  sourceId: number;
  sourceNameEn: string;
  sourceNameAr: string;
  sourceSlug?: string | null;
  category: GalleryCategory;
  entityDisplayOrder: number;
  locale: "en" | "ar";
  extra?: CmsMedia[];
}): void {
  const {
    items,
    entity,
    sourceType,
    sourceId,
    sourceNameEn,
    sourceNameAr,
    sourceSlug,
    category,
    entityDisplayOrder,
    locale,
    extra = [],
  } = options;

  try {
    const nested = collectEntityMedia(entity);
    const merged = dedupeMedia([...nested, ...extra]);
    const sourceName = localizedName(sourceNameEn, sourceNameAr, locale);

    merged.forEach((media, index) => {
      if (!media?.url) return;
      items.push({
        key: `${sourceType}-${sourceId}-media-${media.id}`,
        media,
        sourceType,
        sourceId,
        sourceName,
        sourceNameAr: sourceNameAr || sourceNameEn,
        sourceSlug: sourceSlug ?? null,
        category,
        caption: media.caption ?? null,
        sortOrder: media.sortOrder,
        isCover: media.isCover,
        aspect: aspectFromMedia(media, index),
        entityDisplayOrder,
      });
    });
  } catch {
    // One bad entity must never crash the gallery.
  }
}

/**
 * Deterministic round-robin merge across categories for editorial ALL view.
 * Stable under SSR/hydration — no Math.random().
 */
export function interleaveGalleryCategories(
  experiences: GalleryItem[],
  zones: GalleryItem[],
  bubbles: GalleryItem[]
): GalleryItem[] {
  const buckets: GalleryItem[][] = [
    sortWithinCategory(experiences),
    sortWithinCategory(zones),
    sortWithinCategory(bubbles),
  ];
  const result: GalleryItem[] = [];
  let remaining = buckets.reduce((n, b) => n + b.length, 0);
  const indices = [0, 0, 0];

  while (remaining > 0) {
    for (let b = 0; b < buckets.length; b += 1) {
      const idx = indices[b];
      if (idx < buckets[b].length) {
        result.push(buckets[b][idx]);
        indices[b] = idx + 1;
        remaining -= 1;
      }
    }
  }
  return result;
}

function sortWithinCategory(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((a, b) => {
    if (a.entityDisplayOrder !== b.entityDisplayOrder) {
      return a.entityDisplayOrder - b.entityDisplayOrder;
    }
    if (a.sourceId !== b.sourceId) return a.sourceId - b.sourceId;
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.media.id - b.media.id;
  });
}

/** Primary dedupe by media id; fallback by normalized URL. */
export function dedupeGalleryItems(items: GalleryItem[]): GalleryItem[] {
  const seenIds = new Set<number>();
  const seenUrls = new Set<string>();
  const out: GalleryItem[] = [];

  for (const item of items) {
    try {
      if (!item?.media?.url) continue;
      const id = item.media.id;
      if (id > 0) {
        if (seenIds.has(id)) continue;
        seenIds.add(id);
      }
      const urlKey = item.media.url.trim().toLowerCase();
      if (urlKey) {
        if (seenUrls.has(urlKey)) continue;
        seenUrls.add(urlKey);
      }
      out.push(item);
    } catch {
      // skip malformed
    }
  }
  return out;
}

export function filterGalleryItems(
  items: GalleryItem[],
  filter: GalleryFilterId
): GalleryItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.category === filter);
}

export function galleryItemAlt(
  item: GalleryItem,
  locale: "en" | "ar" = "en"
): string {
  const name =
    locale === "ar" && item.sourceNameAr
      ? item.sourceNameAr
      : item.sourceName;
  return resolveMediaAlt(item.media, {
    entityName: name,
    contextualAlt: name,
  });
}

export function galleryItemTitle(item: GalleryItem): string {
  const title = item.media.title?.trim();
  if (title) return title;
  const caption = item.caption?.trim() || item.media.caption?.trim();
  if (caption) return caption;
  return item.sourceName;
}

/**
 * Build the full gallery wall from catalog entities.
 * Does not manufacture NEUTRAL_MEDIA_FALLBACK placeholders.
 */
export function buildGalleryCatalog(
  input: BuildGalleryCatalogInput
): GalleryCatalogResult {
  const locale = input.locale ?? "en";
  const extra = input.extraMediaByOwner ?? {};
  const raw: GalleryItem[] = [];

  const experiences = [...(input.experiences ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.id - b.id
  );
  for (const exp of experiences) {
    if (!exp || exp.is_active === false) continue;
    pushEntityMedia({
      items: raw,
      entity: exp,
      sourceType: "experience",
      sourceId: exp.id,
      sourceNameEn: exp.name_en,
      sourceNameAr: exp.name_ar,
      sourceSlug: exp.slug_en ?? null,
      category: "experiences",
      entityDisplayOrder: exp.display_order ?? 0,
      locale,
      extra: extra[mediaOwnerKey("experience", exp.id)] ?? [],
    });
  }

  const zones = [...(input.zones ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.id - b.id
  );
  for (const zone of zones) {
    if (!zone || zone.is_active === false) continue;
    pushEntityMedia({
      items: raw,
      entity: zone,
      sourceType: "zone",
      sourceId: zone.id,
      sourceNameEn: zone.name_en,
      sourceNameAr: zone.name_ar,
      sourceSlug: zone.slug_en ?? null,
      category: "zones",
      entityDisplayOrder: zone.display_order ?? 0,
      locale,
      extra: extra[mediaOwnerKey("zone", zone.id)] ?? [],
    });
  }

  const types = [...(input.accommodations ?? [])].sort(
    (a, b) => a.id - b.id
  );
  for (const type of types) {
    if (!type || type.is_active === false) continue;
    pushEntityMedia({
      items: raw,
      entity: type,
      sourceType: "accommodation",
      sourceId: type.id,
      sourceNameEn: type.name_en,
      sourceNameAr: type.name_ar,
      sourceSlug: type.slug_en ?? null,
      category: "bubbles",
      entityDisplayOrder: type.id,
      locale,
      extra: extra[mediaOwnerKey("accommodation", type.id)] ?? [],
    });

    const bubbles: PhysicalBubble[] = [...(type.bubbles ?? [])].sort(
      (a, b) => a.id - b.id
    );
    for (const bubble of bubbles) {
      if (!bubble) continue;
      // Do NOT borrow parent accommodation images for empty bubbles.
      pushEntityMedia({
        items: raw,
        entity: bubble,
        sourceType: "bubble",
        sourceId: bubble.id,
        sourceNameEn: bubble.name_en,
        sourceNameAr: bubble.name_ar,
        sourceSlug: null,
        category: "bubbles",
        entityDisplayOrder: type.id * 1000 + bubble.id,
        locale,
        extra: extra[mediaOwnerKey("bubble", bubble.id)] ?? [],
      });
    }
  }

  const experienceItems = dedupeGalleryItems(
    raw.filter((i) => i.category === "experiences")
  );
  const zoneItems = dedupeGalleryItems(raw.filter((i) => i.category === "zones"));
  const bubbleItems = dedupeGalleryItems(
    raw.filter((i) => i.category === "bubbles")
  );

  const all = dedupeGalleryItems(
    interleaveGalleryCategories(experienceItems, zoneItems, bubbleItems)
  );

  const counts: Record<GalleryFilterId, number> = {
    all: all.length,
    experiences: experienceItems.length,
    zones: zoneItems.length,
    bubbles: bubbleItems.length,
  };

  const availableFilters: GalleryFilterId[] = [];
  if (counts.all > 0) availableFilters.push("all");
  if (counts.experiences > 0) availableFilters.push("experiences");
  if (counts.zones > 0) availableFilters.push("zones");
  if (counts.bubbles > 0) availableFilters.push("bubbles");

  return { items: all, counts, availableFilters };
}

/**
 * Controlled enrichment: only request GET /media for entities with zero nested images.
 * Callers pass results via `extraMediaByOwner` to avoid stampeding every row.
 */
export function entitiesNeedingMediaEnrichment(input: {
  experiences: ApiExperience[];
  zones: ApiZone[];
  accommodations: AccommodationType[];
}): Array<{ owner: CmsMediaOwner; id: number }> {
  const needs: Array<{ owner: CmsMediaOwner; id: number }> = [];

  for (const exp of input.experiences ?? []) {
    if (exp && collectEntityMedia(exp).length === 0) {
      needs.push({ owner: "experience", id: exp.id });
    }
  }
  for (const zone of input.zones ?? []) {
    if (zone && collectEntityMedia(zone).length === 0) {
      needs.push({ owner: "zone", id: zone.id });
    }
  }
  for (const type of input.accommodations ?? []) {
    if (!type) continue;
    if (collectEntityMedia(type).length === 0) {
      needs.push({ owner: "accommodation", id: type.id });
    }
    for (const bubble of type.bubbles ?? []) {
      if (bubble && collectEntityMedia(bubble).length === 0) {
        needs.push({ owner: "bubble", id: bubble.id });
      }
    }
  }
  return needs;
}
