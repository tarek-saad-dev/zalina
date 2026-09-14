import { setRequestLocale, getTranslations } from "next-intl/server";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { getWeddings } from "@/lib/api";
import { LuxuryFooter } from "@/sections/home";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import { WeddingsPageClient } from "@/sections/weddings/WeddingsPageClient";
import { isWeddingPrimaryImageryReady } from "@/sections/weddings/content/weddingMedia";
import { HeroRevealGate } from "@/components/media/HeroRevealGate";
import { buildPageMetadata, localeFromParams } from "@/lib/i18n/metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  return buildPageMetadata(params.locale, "weddings", "/weddings");
}

export default async function WeddingsPage({ params }: Props) {
  const { locale: localeParam } = params;
  setRequestLocale(localeParam);
  const locale = localeFromParams(localeParam);
  const t = await getTranslations({ locale: localeParam, namespace: "seo" });

  if (!FEATURE_FLAGS.WEDDINGS_ACTIVE) {
    return (
      <main className="zones-page min-h-screen overflow-x-hidden">
        <ComingSoonOverlay
          title={t("weddings.comingSoonTitle")}
          subtitle={t("weddings.comingSoonSubtitle")}
          variant="full"
        />
        <LuxuryFooter />
      </main>
    );
  }

  if (!isWeddingPrimaryImageryReady()) {
    return (
      <main className="zones-page min-h-screen overflow-x-hidden">
        <ComingSoonOverlay
          title={t("weddings.comingSoonTitle")}
          subtitle={t("weddings.imageryPendingSubtitle")}
          variant="full"
        />
        <LuxuryFooter />
      </main>
    );
  }

  let packages: Awaited<ReturnType<typeof getWeddings>> = [];
  try {
    packages = await getWeddings(locale);
  } catch {
    packages = [];
  }

  return (
    <HeroRevealGate>
      <main className="zones-page min-h-screen overflow-x-hidden">
        <WeddingsPageClient packages={packages} />
        <LuxuryFooter />
      </main>
    </HeroRevealGate>
  );
}
