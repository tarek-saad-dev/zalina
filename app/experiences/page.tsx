import type { Metadata } from "next";
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

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Experiences | Zalina Arabian Village Luxor",
  description:
    "Discover Luxor cultural experiences at Zalina Arabian Village — Egyptian dining, live cooking, entertainment and village exploration.",
  keywords: [
    "Zalina Luxor experiences",
    "Luxor dinner experience",
    "Luxor cultural experience",
    "Egyptian hospitality Luxor",
    "things to do in Luxor",
  ],
  openGraph: {
    title: "Experiences | Zalina Arabian Village Luxor",
    description:
      "Egyptian cuisine, cultural evenings and village hospitality in the heart of Luxor.",
    type: "website",
    images: [{ url: "/assets/zalina-hero-bg.png", width: 1200, height: 630 }],
  },
};

export default async function ExperiencesPage() {
  const apiExperiences = await getExperiences();
  const experiences = apiExperiences
    .filter((e) => e.is_active)
    .map((e) => mapExperienceToCatalogItem(e));

  return (
    <main className="exp-page min-h-screen w-full">
      <Hero />
      <ExperiencesCatalog experiences={experiences} />
      <EditorialSpotlight />
      <ExclusiveOffer />
      <WhyChooseZalina />
      <ExperienceJourney />
      <MicroInfoPreview />
      <FuturePackages />
      <CTASection />
      <LuxuryFooter />
    </main>
  );
}
