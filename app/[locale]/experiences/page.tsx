import { setRequestLocale } from "next-intl/server";
import { LuxuryFooter } from "@/sections/home";
import {
  Hero,
  ExperiencesCatalog,
  EditorialSpotlight,
  ExclusiveOffer,
  WhyChooseZalina,
  ExperienceJourney,
  MicroInfoPreview,
  FuturePackages,
  CTASection,
} from "@/sections/experiences";
import { getExperiences, mapExperienceToCatalogItem } from "@/lib/api";
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import {
  buildPageMetadata,
  localeFromParams,
} from "@/lib/i18n/metadata";

export const revalidate = 60;

type Props = {
  params: { locale: string };
  searchParams?: { category?: string };
};

export async function generateMetadata({ params }: Props) {
  return buildPageMetadata(params.locale, "experiences", "/experiences");
}

export default async function ExperiencesPage({
  params,
  searchParams,
}: Props) {
  setRequestLocale(params.locale);
  const locale = localeFromParams(params.locale);

  const apiExperiences = await getExperiences(locale);
  const experiences = apiExperiences
    .filter((e) => e.is_active)
    .map((e) => mapExperienceToCatalogItem(e, locale));

  return (
    <HeroRevealGate>
      <main className="exp-page min-h-screen w-full">
        <Hero />
        <ExperiencesCatalog
          experiences={experiences}
          initialCategory={searchParams?.category}
        />
        <EditorialSpotlight />
        <ExclusiveOffer />
        <WhyChooseZalina />
        <ExperienceJourney />
        <MicroInfoPreview />
        <FuturePackages />
        <CTASection />
        <LuxuryFooter />
      </main>
    </HeroRevealGate>
  );
}
