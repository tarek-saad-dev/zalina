"use client";

import { useMemo, useState } from "react";
import type { WeddingPackage } from "@/lib/api";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WeddingHero } from "./WeddingHero";
import { WeddingExperience } from "./WeddingExperience";
import { WeddingPackageCards } from "./WeddingPackageCards";
import { WeddingPackageComparison } from "./WeddingPackageComparison";
import { SignatureSpotlight } from "./SignatureSpotlight";
import { WeddingVisualStory } from "./WeddingVisualStory";
import { WeddingUpgrades } from "./WeddingUpgrades";
import { WeddingPlanner } from "./WeddingPlanner";
import { WeddingFinalCTA } from "./WeddingFinalCTA";
import { isSignaturePackageSlug } from "./content/weddingMedia";

interface WeddingsPageClientProps {
  packages: WeddingPackage[];
}

export function WeddingsPageClient({ packages }: WeddingsPageClientProps) {
  const locale = useBookingLocale();
  const defaultId = useMemo(() => {
    const signature = packages.find((p) => isSignaturePackageSlug(p.slug));
    return signature?.id ?? packages[0]?.id ?? null;
  }, [packages]);

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    defaultId
  );

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <WeddingHero />
      <WeddingExperience />
      <WeddingPackageCards
        packages={packages}
        selectedId={selectedPackageId}
        onSelect={(pkg) => {
          setSelectedPackageId(pkg.id);
          document.getElementById("plan")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />
      <WeddingPackageComparison packages={packages} />
      <SignatureSpotlight />
      <WeddingVisualStory />
      <WeddingUpgrades />
      <WeddingPlanner
        packages={packages}
        selectedPackageId={selectedPackageId}
        onSelectPackageId={setSelectedPackageId}
      />
      <WeddingFinalCTA />
    </div>
  );
}
