import type { Metadata } from "next";
import { BookNowPage } from "@/components/book-now/BookNowPage";
import {
  getAccommodations,
  getAddOns,
  getExperiences,
  mapAccommodationToStay,
  mapAddOnToEnhancement,
  mapExperienceToOption,
} from "@/lib/api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Book Now | Zalina Arabian Village",
  description:
    "Begin your Zalina experience. Choose your journey, personalize your stay, and let the village take care of the rest.",
};

export default async function BookNow() {
  const [accommodations, experiences, addOns] = await Promise.all([
    getAccommodations(),
    getExperiences(),
    getAddOns(),
  ]);

  const catalog = {
    stays: accommodations
      .filter((a) => a.is_active)
      .map((a) => mapAccommodationToStay(a)),
    experiences: experiences
      .filter((e) => e.is_active)
      .map((e) => mapExperienceToOption(e)),
    addOns: addOns.map((a) => mapAddOnToEnhancement(a)),
  };

  return <BookNowPage catalog={catalog} />;
}
