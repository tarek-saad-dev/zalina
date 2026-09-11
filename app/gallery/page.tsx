import type { Metadata } from "next";
import { LuxuryFooter } from "@/sections/home";
import { GalleryPageContent } from "@/sections/gallery/GalleryPageContent";
import { loadGalleryCatalog } from "@/lib/media";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery | Zalina Arabian Village Luxor",
  description:
    "Explore Zalina Arabian Village in Luxor through experiences, village zones, dining atmosphere and bubble stays.",
  openGraph: {
    title: "Gallery | Zalina Arabian Village Luxor",
    description:
      "A visual journey through Egyptian hospitality, village atmosphere and evenings in Luxor.",
    type: "website",
  },
};

export default async function GalleryPage() {
  const catalog = await loadGalleryCatalog("en");

  return (
    <>
      <GalleryPageContent
        items={catalog.items}
        availableFilters={catalog.availableFilters}
      />
      <LuxuryFooter />
    </>
  );
}
