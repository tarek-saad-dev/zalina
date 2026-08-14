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
  getZones,
  listAccommodationTypes,
} from "@/lib/api";
import {
  buildEntityGlimpseItems,
  experiencesToMomentCards,
  zonesToMarketCardsWithSize,
} from "@/lib/media";

export const revalidate = 60;

export default async function Home() {
  const [zones, experiences, accommodations] = await Promise.all([
    getZones(),
    getExperiences(),
    listAccommodationTypes(),
  ]);

  const moments = experiencesToMomentCards(experiences);
  const stalls = zonesToMarketCardsWithSize(zones);
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
      <MarketShowcase stalls={stalls} />
      <GlimpseGallery items={glimpseItems} />
      <ZalinaPromise />
      <WeddingShowcase />
      <FinalCTA />
      <LuxuryFooter />
    </main>
  );
}
