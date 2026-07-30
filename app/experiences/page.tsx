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
  title: "Experiences | Zalina Arabian Village",
  description:
    "Discover curated luxury experiences at Zalina Arabian Village. From signature dining to sunset celebrations, create unforgettable memories beneath the stars.",
  keywords: [
    "Zalina experiences",
    "luxury dining",
    "Arabian hospitality",
    "desert experiences",
    "signature events",
    "Egypt luxury destination",
  ],
  openGraph: {
    title: "Experiences | Zalina Arabian Village",
    description:
      "Signature moments crafted with elegance, heritage, and Arabian warmth.",
    type: "website",
    images: [{ url: "/assets/night.png", width: 1200, height: 630 }],
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
