import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { GalleryPageContent } from "@/sections/gallery/GalleryPageContent";
import { loadGalleryCatalog } from "@/lib/media";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery | Zalina Arabian Village",
  description:
    "Explore Zalina Arabian Village through experiences, zones, and bubble stays — a living CMS-driven gallery.",
  openGraph: {
    title: "Gallery | Zalina Arabian Village",
    description:
      "A cinematic visual journey through experiences, zones, and bubble stays at Zalina Arabian Village.",
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
      <Footer />
    </>
  );
}
