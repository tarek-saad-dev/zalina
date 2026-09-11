import type { Metadata } from "next";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { getWeddings } from "@/lib/api";
import { LuxuryFooter } from "@/sections/home";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import { WeddingsPageClient } from "@/sections/weddings/WeddingsPageClient";
import { isWeddingPrimaryImageryReady } from "@/sections/weddings/content/weddingMedia";

export const metadata: Metadata = {
  title: "Weddings | Zalina Arabian Village",
  description:
    "Celebrate a destination wedding at Zalina Arabian Village in Luxor — elegant stage, Arabian gardens, dining and entertainment in one unforgettable night.",
  keywords: [
    "Zalina weddings",
    "destination wedding Luxor",
    "Arabian wedding venue",
    "Zalina Signature Wedding",
  ],
  openGraph: {
    title: "Weddings | Zalina Arabian Village",
    description:
      "Your wedding. One Arabian village. One unforgettable night at Zalina.",
    type: "website",
  },
};

export default async function WeddingsPage() {
  // Keep kill switch OFF until final QA + production imagery are ready.
  if (!FEATURE_FLAGS.WEDDINGS_ACTIVE) {
    return (
      <main className="zones-page min-h-screen overflow-x-hidden">
        <ComingSoonOverlay
          title="Weddings at Zalina"
          subtitle="We are crafting an extraordinary celebration experience. Stay tuned for something truly unforgettable."
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
          title="Weddings at Zalina"
          subtitle="Final wedding imagery is being prepared. The celebration experience will open shortly."
          variant="full"
        />
        <LuxuryFooter />
      </main>
    );
  }

  let packages: Awaited<ReturnType<typeof getWeddings>> = [];
  try {
    packages = await getWeddings();
  } catch {
    packages = [];
  }

  return (
    <main className="zones-page min-h-screen overflow-x-hidden">
      <WeddingsPageClient packages={packages} />
      <LuxuryFooter />
    </main>
  );
}
