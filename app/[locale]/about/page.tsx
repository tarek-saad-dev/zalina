import { setRequestLocale } from "next-intl/server";
import { AboutPageContent } from "@/sections/about";
import { LuxuryFooter } from "@/sections/home";
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import { buildPageMetadata } from "@/lib/i18n/metadata";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  return buildPageMetadata(params.locale, "about", "/about");
}

export default function AboutPage({ params }: Props) {
  setRequestLocale(params.locale);

  return (
    <HeroRevealGate>
      <main className="w-full min-h-screen" style={{ background: "#050505" }}>
        <AboutPageContent />
        <LuxuryFooter />
      </main>
    </HeroRevealGate>
  );
}
