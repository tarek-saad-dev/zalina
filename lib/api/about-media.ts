import { apiFetchSafe } from "@/lib/api/client";
import { normalizeAboutMedia, type AboutMediaMap } from "@/lib/about/media";

/** Only published images; missing backend leaves existing assets unchanged. */
export async function getAboutPageMedia(locale: string): Promise<AboutMediaMap> {
  const result = await apiFetchSafe<unknown>("/pages/about/media", null, {
    locale, next: { revalidate: 60 },
  });
  return normalizeAboutMedia(result);
}
