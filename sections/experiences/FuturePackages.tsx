"use client";

import React from "react";

const packages = [
  {
    title: "Weekend Retreats",
    description: "Multi-day immersive experiences",
  },
  {
    title: "Celebration Packages",
    description: "Birthdays, anniversaries & more",
  },
  {
    title: "Seasonal Experiences",
    description: "Limited-time special events",
  },
  {
    title: "Custom Packages",
    description: "Tailored to your preferences",
  },
];

export function FuturePackages() {
  return (
    <section className="section-spacing-mobile">
      <div className="mobile-container">
        {/* Section Header */}
        <span
          className="text-[10px] tracking-widest uppercase mb-2 block text-center"
          style={{ color: "var(--exp-gold)" }}
        >
          Coming Soon
        </span>
        <h2 className="exp-section-heading text-center mb-6">
          Future Packages
        </h2>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="flex flex-col p-4 relative overflow-hidden hover-lift-luxury"
              style={{
                height: "120px",
                background:
                  "linear-gradient(145deg, #2A211C 0%, #161210 100%)",
                borderRadius: "12px",
                border: "1px solid var(--exp-border)",
              }}
            >
              {/* Coming Soon Label */}
              <span
                className="absolute top-2 right-2 text-[8px] px-2 py-0.5"
                style={{
                  background: "rgba(214, 185, 141, 0.15)",
                  color: "var(--exp-gold)",
                  borderRadius: "4px",
                }}
              >
                Soon
              </span>

              {/* Title */}
              <h3
                className="text-[12px] font-semibold mb-2 mt-4"
                style={{
                  color: "var(--exp-text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {pkg.title}
              </h3>

              {/* Description */}
              <p
                className="text-[10px]"
                style={{
                  color: "var(--exp-text-secondary)",
                  lineHeight: "14px",
                }}
              >
                {pkg.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
