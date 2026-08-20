import {
  LuxuryHero,
  HeritageStory,
  MarketShowcase,
  SignatureMoments,
  DayNightExperience,
  ZalinaPromise,
  WeddingShowcase,
  FinalCTA,
  LuxuryFooter,
  GlimpseGallery,
} from "@/sections/home";
import { getExperiences, getZones } from "@/lib/api";
import {
  experiencesToMomentCards,
  filterGalleryItems,
  findMarketZone,
  galleryItemsToCatalogCards,
  loadGalleryCatalog,
  marketZoneCoverCard,
} from "@/lib/media";

export const revalidate = 60;

export default async function Home() {
  const [zones, experiences, galleryCatalog] = await Promise.all([
    getZones(),
    getExperiences(),
    loadGalleryCatalog("en"),
  ]);

  const moments = experiencesToMomentCards(experiences);

  // Same Al-Souk cover as /zones Main Zones card (mapZoneToUi / resolveCoverImage)
  const marketZone = findMarketZone(zones) ?? null;
  const marketZoneName =
    marketZone?.name_en?.trim() || "Al-Souk Village";
  const stalls = [marketZoneCoverCard(marketZone)];

  // Same CMS source as /gallery → "Scenes Made to Be Remembered" → Bubble Stays
  const glimpseItems = galleryItemsToCatalogCards(
    filterGalleryItems(galleryCatalog.items, "bubbles")
  );

  return (
    <main className="lux-page min-h-screen">
      <LuxuryHero />
      <HeritageStory />
      <SignatureMoments moments={moments} />
      <DayNightExperience />
      <MarketShowcase stalls={stalls} zoneName={marketZoneName} />
      <GlimpseGallery items={glimpseItems} />
      <ZalinaPromise />
      <WeddingShowcase />
      <FinalCTA />
      <LuxuryFooter />
    </main>
  );
}
