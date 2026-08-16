/**
 * Server-side gallery data loader.
 *
 * Strategy:
 * 1. Fetch catalog lists in parallel (experiences, zones, accommodations).
 * 2. Prefer nested cover_image / gallery / media — no per-row /media storm.
 * 3. Controlled enrichment: GET /media only for entities with zero nested images
 *    (typically empty zones). Parallel, failure-isolated via Promise.allSettled.
 *
 * Never uses accommodation availability endpoints.
 */

import {
  getExperiences,
  getZones,
  listAccommodationTypes,
  listMediaForModel,
} from "@/lib/api";
import type { CmsMedia, CmsMediaOwner } from "@/lib/media";
import {
  buildGalleryCatalog,
  entitiesNeedingMediaEnrichment,
  type GalleryCatalogResult,
} from "./galleryCatalog";

/** Cap enrichment fan-out so a sparse CMS cannot stampede the API. */
const MAX_ENRICHMENT_REQUESTS = 12;

export async function loadGalleryCatalog(
  locale: "en" | "ar" = "en"
): Promise<GalleryCatalogResult> {
  const [experiences, zones, accommodations] = await Promise.all([
    getExperiences(locale).catch(() => []),
    getZones(locale).catch(() => []),
    listAccommodationTypes({ locale }).catch(() => []),
  ]);

  const needs = entitiesNeedingMediaEnrichment({
    experiences,
    zones,
    accommodations,
  }).slice(0, MAX_ENRICHMENT_REQUESTS);

  const extraMediaByOwner: Record<string, CmsMedia[]> = {};

  if (needs.length > 0) {
    const settled = await Promise.allSettled(
      needs.map(async ({ owner, id }) => {
        const media = await listMediaForModel(owner, id, locale);
        return { owner, id, media };
      })
    );

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const { owner, id, media } = result.value;
      if (media.length === 0) continue;
      extraMediaByOwner[`${owner as CmsMediaOwner}:${id}`] = media;
    }
  }

  return buildGalleryCatalog({
    experiences,
    zones,
    accommodations,
    locale,
    extraMediaByOwner,
  });
}
