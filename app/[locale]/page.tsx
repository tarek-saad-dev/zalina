import type { Metadata } from "next";
import { getEventAnnouncement } from "@/lib/api/events";
import { EventAnnouncementView } from "@/components/events/EventAnnouncement";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import {
  buildPageMetadata,
  localeFromParams,
} from "@/lib/i18n/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPageMetadata(params.locale, "home", "/");
}

export default async function Home({ params }: Props) {
  const { locale } = params;
  setRequestLocale(locale);

  const apiLocale = localeFromParams(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const [zones, experiences, galleryCatalog, announcement] = await Promise.all([
    getZones(apiLocale),
    getExperiences(apiLocale),
    loadGalleryCatalog(apiLocale),
    getEventAnnouncement(apiLocale).catch(() => null),
  ]);

  const moments = experiencesToMomentCards(experiences, apiLocale);

  // Same Al-Souk cover as /zones Main Zones card (mapZoneToUi / resolveCoverImage)
  const marketZone = findMarketZone(zones) ?? null;
  const marketZoneName =
    (locale === "ar"
      ? marketZone?.name_ar?.trim()
      : marketZone?.name_en?.trim()) || t("market.defaultZoneName");
  const stalls = [marketZoneCoverCard(marketZone)];

  // Same CMS source as /gallery → "Scenes Made to Be Remembered" → Bubble Stays
  const glimpseItems = galleryItemsToCatalogCards(
    filterGalleryItems(galleryCatalog.items, "bubbles"),
    apiLocale
  );

  return (
    <HeroRevealGate>
      <main className="lux-page min-h-screen">
        <LuxuryHero />
        {announcement && <EventAnnouncementView announcement={announcement} locale={locale} />}
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
    </HeroRevealGate>
  );
}
