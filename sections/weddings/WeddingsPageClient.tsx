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
import { WeddingPlanner } from "./WeddingPlanner";
import { WeddingFinalCTA } from "./WeddingFinalCTA";

interface WeddingsPageClientProps {
  packages: WeddingPackage[];
}

function scrollToPlan() {
  document.getElementById("plan")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function WeddingsPageClient({ packages }: WeddingsPageClientProps) {
  const locale = useBookingLocale();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );

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
            requestAnimationFrame(() => {
              scrollToPlan();
            });
          }}
        />

        <div
          className="zones-container"
          aria-hidden
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "-12px",
            marginBottom: "-4px",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "28px",
              background:
                "linear-gradient(180deg, rgba(212,175,55,0.55), rgba(212,175,55,0.08))",
            }}
          />
        </div>

        <WeddingPlanner
          packages={packages}
          selectedPackageId={selectedPackageId}
        />
      </div>

      <WeddingPackageComparison packages={packages} />
      <SignatureSpotlight />
      <WeddingVisualStory />
      <WeddingUpgrades />
      <WeddingFinalCTA />
    </div>
  );
}
