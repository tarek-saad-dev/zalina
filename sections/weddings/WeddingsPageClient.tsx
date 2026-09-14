"use client";

import { useState } from "react";
import type { WeddingPackage } from "@/lib/api";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WeddingHero } from "./WeddingHero";
import { WeddingExperience } from "./WeddingExperience";
import { WeddingPackageCards } from "./WeddingPackageCards";
import { WeddingPackageComparison } from "./WeddingPackageComparison";
import { SignatureSpotlight } from "./SignatureSpotlight";
import { WeddingVisualStory } from "./WeddingVisualStory";
import { WeddingUpgrades } from "./WeddingUpgrades";
import { WeddingFinalCTA } from "./WeddingFinalCTA";
import { WeddingBookingModal } from "./WeddingBookingModal";

interface WeddingsPageClientProps {
  packages: WeddingPackage[];
}

export function WeddingsPageClient({ packages }: WeddingsPageClientProps) {
  const locale = useBookingLocale();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <WeddingHero />
      <WeddingExperience />

      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 42%, transparent 100%)",
        }}
      >
        <WeddingPackageCards
          packages={packages}
          selectedId={selectedPackageId}
          onSelect={(pkg) => {
            setSelectedPackageId(pkg.id);
            setBookingOpen(true);
          }}
        />
      </div>

      <WeddingPackageComparison
        packages={packages}
        selectedPackageId={selectedPackageId}
      />
      <SignatureSpotlight />
      <WeddingVisualStory />
      <WeddingUpgrades />
      <WeddingFinalCTA />

      <WeddingBookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        packages={packages}
        selectedPackageId={selectedPackageId}
      />
    </div>
  );
}
