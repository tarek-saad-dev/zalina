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
import {
  getExperiences,
  getZone,
  getZones,
  listAccommodationTypes,
  listMediaForModel,
} from "@/lib/api";
import {
  MARKET_ZONE_SLUG,
  buildEntityGlimpseItems,
  experiencesToMomentCards,
  findMarketZone,
  marketZoneGalleryToCards,
} from "@/lib/media";

export const revalidate = 60;

export default async function Home() {
  const [zones, experiences, accommodations] = await Promise.all([
    getZones(),
    getExperiences(),
    listAccommodationTypes(),
  ]);

  const moments = experiencesToMomentCards(experiences);

  // Market strip uses Al-Souk gallery — never the full zones catalog.
  const marketFromList = findMarketZone(zones);
  const marketDetail = await getZone(
    marketFromList?.slug_en || MARKET_ZONE_SLUG
  );
  const marketZone = marketDetail ?? marketFromList ?? null;
  const marketMedia = marketZone
    ? await listMediaForModel("zone", marketZone.id)
    : [];
  const stalls = marketZoneGalleryToCards(marketZone, marketMedia);
  const marketZoneName =
    marketZone?.name_en?.trim() || "Al-Souk Village";

  const glimpseItems = buildEntityGlimpseItems(
    zones,
    experiences,
    accommodations
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
