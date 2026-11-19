import { readCms } from "@/lib/static-cms/store";
import { ABOUT_IMAGE_SLOTS, type AboutMediaMap } from "@/lib/about/media";

/** Static CMS data on VPS, separate from Laravel catalog, with original assets as fallbacks. */
export async function getAboutPageMedia(_locale: string): Promise<AboutMediaMap> {
  const published=readCms().images;
  const images:AboutMediaMap={};
  for(const slot of ABOUT_IMAGE_SLOTS){
    const entry=published["about."+slot.id as keyof typeof published];
    if(entry)images[slot.id]={src:entry.src,alt_ar:entry.alt_ar,alt_en:entry.alt_en};
  }
  return images;
}
