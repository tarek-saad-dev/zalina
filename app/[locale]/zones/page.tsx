import { setRequestLocale } from "next-intl/server";
import {
  Hero,
  DestinationOverview,
  MainZones,
  FeaturedZone,
  ZoneDifferentiation,
  ImmersiveJourney,
  WhyZonesMatter,
  BookingConnection,
  FinalCTA,
} from "@/sections/zones";
import { LuxuryFooter } from "@/sections/home";
import { getZones, mapZoneToUi } from "@/lib/api";
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import {
  buildPageMetadata,
  localeFromParams,
} from "@/lib/i18n/metadata";

export const revalidate = 60;

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  return buildPageMetadata(params.locale, "zones", "/zones");
}

export default async function ZonesPage({ params }: Props) {
  setRequestLocale(params.locale);
  const locale = localeFromParams(params.locale);

  const apiZones = await getZones(locale);
  const zones = apiZones.map((z) => mapZoneToUi(z, locale));
  const featured =
    zones.find((z) => z.isBookableOnline) ?? zones[0] ?? null;

  return (
    <HeroRevealGate>
      <main className="zones-page min-h-screen overflow-x-hidden">
        <Hero />
        <DestinationOverview />
        <MainZones zones={zones} />
        <FeaturedZone zone={featured} />
        <ZoneDifferentiation />
        <ImmersiveJourney zones={zones} />
        <WhyZonesMatter />
        <BookingConnection />
        <FinalCTA />
        <LuxuryFooter />
      </main>
    </HeroRevealGate>
  );
}
