export type {
  CmsMedia,
  CmsMediaOwner,
  GalleryItemRaw,
  MediaAsset,
  MediaBearingEntity,
  RawApiMedia,
  ResolveCoverOptions,
  ResolvedImage,
} from "./types";
export { CMS_MEDIA_OWNERS, CMS_MEDIA_OWNER_ALIASES } from "./types";

export {
  NEUTRAL_MEDIA_FALLBACK,
  NEUTRAL_MEDIA_ALT,
  zoneFallbackImage,
  experienceFallbackImage,
  stayFallbackImage,
} from "./fallback";

export {
  isImageMime,
  isLikelyFilenameAlt,
  isMediaAssetLike,
  normalizeMediaAsset,
  normalizeApiMedia,
  normalizeGalleryItem,
  normalizeMediaList,
  dedupeMedia,
  sortMedia,
} from "./normalize";

export {
  coverImageAsMedia,
  collectEntityMedia,
  resolveCoverMedia,
  resolveGalleryMedia,
  resolveMediaAlt,
  selectDisplayUrl,
  resolveCoverImage,
  resolveBubbleCoverImage,
  resolveCoverUrl,
  resolveBubbleCoverUrl,
  aggregateEntityGalleries,
  normalizeRawMediaArray,
} from "./resolveMedia";

export {
  MARKET_ZONE_SLUG,
  findMarketZone,
  marketZoneCoverCard,
  marketZoneGalleryToCards,
  experiencesToMomentCards,
  zonesToMarketCardsWithSize,
  galleryItemsToCatalogCards,
  buildEntityGlimpseItems,
} from "./homeCatalogMedia";
export type { CatalogMediaCard, MarketCard } from "./homeCatalogMedia";

export {
  GALLERY_FILTER_IDS,
  GALLERY_FILTER_LABELS_EN,
  GALLERY_I18N_KEYS,
  buildGalleryCatalog,
  dedupeGalleryItems,
  entitiesNeedingMediaEnrichment,
  filterGalleryItems,
  galleryItemAlt,
  galleryItemTitle,
  getSafeGalleryFilterId,
  interleaveGalleryCategories,
  isGalleryFilterId,
} from "./galleryCatalog";
export type {
  GalleryAspect,
  GalleryCatalogResult,
  GalleryCategory,
  GalleryFilterId,
  GalleryItem,
  GallerySourceType,
} from "./galleryCatalog";

export { loadGalleryCatalog } from "./loadGalleryCatalog";
