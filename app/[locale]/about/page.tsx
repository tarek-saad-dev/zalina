import { setRequestLocale } from "next-intl/server";
import { AboutPageContent } from "@/sections/about";
import { LuxuryFooter } from "@/sections/home";
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getAboutPageMedia } from "@/lib/api/about-media";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  return buildPageMetadata(params.locale, "about", "/about");
}

export default async function AboutPage({ params }: Props) {
  setRequestLocale(params.locale);
  const media = await getAboutPageMedia(params.locale);

  return (
    <HeroRevealGate>
      <main className="zalina-about-page w-full min-h-screen" style={{ background: "#050505" }}>
        <AboutPageContent media={media} locale={params.locale} />
        <LuxuryFooter />
      </main>
    </HeroRevealGate>
  );
}
