"use client";

import React from "react";
import Image from "next/image";

const journeySteps = [
  { image: "/images/journey-arrival.jpg", caption: "Arrival & Welcome" },
  { image: "/images/journey-explore.jpg", caption: "Explore the Zones" },
  { image: "/images/journey-experience.jpg", caption: "Live the Experience" },
  { image: "/images/journey-depart.jpg", caption: "Depart with Memories" },
];

export function ImmersiveJourney() {
  return (
    <section className="zones-section" style={{ background: "var(--zones-surface)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            Your Journey
          </span>
          <h2 className="zones-section-title">Immersive Experience Journey</h2>
        </div>

        {/* 4 Image Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {journeySteps.map((step, index) => (
            <div
              key={step.caption}
              className="relative overflow-hidden zones-hover-lift"
              style={{
                height: "380px",
                borderRadius: "16px",
              }}
            >
              <Image
                src={step.image}
                alt={step.caption}
                fill
                className="object-cover zones-img-hover"
              />
              
              {/* Bottom Overlay */}
              <div
                className="absolute inset-0 flex items-end justify-center p-4"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)",
                }}
              >
                <span
                  className="text-lg font-medium"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--zones-text-light)",
                  }}
                >
                  {step.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
