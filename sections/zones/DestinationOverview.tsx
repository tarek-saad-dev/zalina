"use client";

import React from "react";
import Image from "next/image";

export function DestinationOverview() {
  return (
    <section className="zones-section" style={{ background: "var(--zones-bg)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            The Destination
          </span>
          <h2 className="zones-section-title">Destination Overview</h2>
        </div>

        {/* Map Image */}
        <div
          className="relative w-full overflow-hidden zones-radius-xl zones-shadow-luxury"
          style={{ height: "500px" }}
        >
          <Image
            src="/images/zones-map.jpg"
            alt="Zalina resort map overview"
            fill
            className="object-cover"
          />
          {/* Subtle overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(17, 21, 28, 0.6) 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
