import { apiFetchSafe } from "./client";
import { resolveApiLocale } from "./locale";
import {
  CMS_MEDIA_OWNER_ALIASES,
  type CmsMedia,
  type CmsMediaOwner,
  type RawApiMedia,
  normalizeRawMediaArray,
} from "@/lib/media";

export class UnsupportedMediaOwnerError extends Error {
  constructor(modelType: string) {
    super(`Unsupported media model type: ${modelType}`);
    this.name = "UnsupportedMediaOwnerError";
  }
}

export function assertCmsMediaOwner(modelType: string): CmsMediaOwner {
  const owner = CMS_MEDIA_OWNER_ALIASES[modelType.toLowerCase()];
  if (!owner) {
    throw new UnsupportedMediaOwnerError(modelType);
  }
  return owner;
}

/** In-flight dedupe so catalog cards don't stampede GET /media. */
const inflight = new Map<string, Promise<CmsMedia[]>>();

/**
 * GET /api/v1/media/{model_type}/{model_id}
 * Only accommodation | bubble | zone | experience (and plural aliases).
 * Add-on is intentionally rejected — use nested catalog media instead.
 */
export function listMediaForModel(
  modelType: CmsMediaOwner | string,
  modelId: number | string,
  locale?: string
): Promise<CmsMedia[]> {
  const owner = assertCmsMediaOwner(String(modelType));
  const id = String(modelId);
  const cacheKey = `${owner}:${id}:${resolveApiLocale(locale)}`;

  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const promise = apiFetchSafe<RawApiMedia[]>(
    `/media/${owner}/${id}`,
    [],
    {
      locale: resolveApiLocale(locale),
      next: { revalidate: 60 },
    }
  ).then((raw) => normalizeRawMediaArray(raw));

  inflight.set(cacheKey, promise);
  promise.finally(() => {
    // Keep resolved promise briefly so concurrent callers still share it.
    setTimeout(() => {
      if (inflight.get(cacheKey) === promise) inflight.delete(cacheKey);
    }, 0);
  });

  return promise;
}

/** Test helper — clears in-flight media request cache. */
export function clearMediaRequestCache(): void {
  inflight.clear();
}
