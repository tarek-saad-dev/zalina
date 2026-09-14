import { setRequestLocale } from "next-intl/server";
import { LuxuryFooter } from "@/sections/home";
import { GalleryPageContent } from "@/sections/gallery/GalleryPageContent";
import { loadGalleryCatalog } from "@/lib/media";
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
  return buildPageMetadata(params.locale, "gallery", "/gallery");
}

export default async function GalleryPage({ params }: Props) {
  setRequestLocale(params.locale);
  const locale = localeFromParams(params.locale);
  const catalog = await loadGalleryCatalog(locale);

  return (
    <HeroRevealGate>
      <GalleryPageContent
        items={catalog.items}
        availableFilters={catalog.availableFilters}
      />
      <LuxuryFooter />
    </HeroRevealGate>
  );
}
