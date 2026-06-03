"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const zones = [
  {
    image: "/images/zone-exhibition.jpg",
    title: "Exhibition Court",
    description:
      "A grand, open-air plaza inspired by traditional Arabian courtyards, perfect for large gatherings and celebrations under the stars.",
  },
  {
    image: "/images/zone-desert.jpg",
    title: "Desert Lounge",
    description:
      "An intimate sandy retreat offering cozy seating areas surrounded by desert palms and ambient fire pits.",
  },
  {
    image: "/images/zone-pool.jpg",
    title: "Poolside Pavilion",
    description:
      "A serene oasis featuring a stunning infinity pool, luxury cabanas, and breathtaking sunset views.",
  },
  {
    image: "/images/zone-royal.jpg",
    title: "Royal Banquet Hall",
    description:
      "An opulent indoor venue designed for elegant weddings, galas, and milestone celebrations.",
  },
];

export function MainZones() {
  return (
    <section className="zones-section" style={{ background: "var(--zones-bg)" }} id="zones">
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            Signature Spaces
          </span>
          <h2 className="zones-section-title">Main Zones</h2>
        </div>

        {/* Zone Cards - Stacked */}
        <div className="flex flex-col gap-6">
          {zones.map((zone, index) => (
            <div
              key={zone.title}
              className="flex flex-col lg:flex-row overflow-hidden zones-hover-lift"
              style={{
                height: "240px",
                background: "var(--zones-surface)",
                border: "1px solid var(--zones-border)",
                borderRadius: "16px",
              }}
            >
              {/* Image - 50% */}
              <div
                className={`relative w-full lg:w-1/2 h-[200px] lg:h-full overflow-hidden ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={zone.image}
                  alt={zone.title}
                  fill
                  className="object-cover zones-img-hover"
                />
              </div>

              {/* Content - 50% */}
              <div
                className={`flex flex-col justify-center p-6 lg:w-1/2 ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <h3 className="zones-card-title mb-3">{zone.title}</h3>
                <p className="zones-body mb-4">{zone.description}</p>
                <Link
                  href="#"
                  className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit"
                  style={{ height: "36px", paddingInline: "20px" }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
