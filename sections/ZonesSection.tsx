"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ZoneCard } from "@/components/ui/ZoneCard";
import { getZones, mapZoneToUi } from "@/lib/api";
import type { Zone } from "@/sections/zones/zones.data";

interface ZonesSectionProps {
  zones?: Zone[];
}

export function ZonesSection({ zones: initialZones }: ZonesSectionProps) {
  const [zones, setZones] = useState<Zone[]>(initialZones ?? []);

  useEffect(() => {
    if (initialZones && initialZones.length > 0) return;
    let cancelled = false;
    getZones()
      .then((data) => {
        if (cancelled) return;
        setZones(data.map((z) => mapZoneToUi(z)));
      })
      .catch(() => {
        if (!cancelled) setZones([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initialZones]);

  const cards = zones.map((zone) => ({
    title: zone.title,
    subtitle: zone.mood,
    description: zone.description,
    image: zone.image,
  }));

  return (
    <section id="zones" className="py-24 md:py-32 bg-bg-main">
      <Container size="large">
        <div className="text-center mb-16">
          <SectionHeading
            subtitle="Distinctive Spaces"
            title="Explore Our Zones"
            description="Unique destinations within Zalina, each offering a different facet of Arabian hospitality and culture."
            align="center"
          />
        </div>

        {cards.length === 0 ? (
          <p className="text-center text-sm opacity-60">
            Zones are loading or temporarily unavailable.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.slice(0, 2).map((zone) => (
                <ZoneCard
                  key={zone.title}
                  {...zone}
                  size="large"
                  className="min-h-[480px]"
                />
              ))}
            </div>
            {cards.length > 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {cards.slice(2).map((zone) => (
                  <ZoneCard
                    key={zone.title}
                    {...zone}
                    size="large"
                    className="min-h-[400px]"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
