"use client";

import React from "react";
import { Coffee, Sun, Shield, HeartHandshake, Leaf } from "lucide-react";

const brandValues = [
  {
    icon: Coffee,
    title: "Hospitality",
    description:
      "Authentic Arabian warmth in every interaction, creating a sense of belonging",
  },
  {
    icon: Sun,
    title: "Heritage",
    description:
      "Preserving and celebrating the rich cultural traditions of the Arabian Peninsula",
  },
  {
    icon: Shield,
    title: "Excellence",
    description:
      "Uncompromising standards in every detail, from service to amenities",
  },
  {
    icon: HeartHandshake,
    title: "Connection",
    description:
      "Fostering meaningful relationships between guests, culture, and community",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "Respectful stewardship of our environment and cultural heritage",
  },
];

export function BrandValues() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="section-label block mb-4">What We Stand For</span>
          <h2
            className="section-heading-about"
            style={{ color: "#F8F6F2" }}
          >
            Brand Values
          </h2>
        </div>

        {/* Values Grid - 5 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {brandValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="h-[160px] rounded-[18px] p-5 flex flex-col items-center text-center hover-lift-card"
                style={{
                  background: "#F4EFE8",
                  border: "1px solid #DCC8AF",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                }}
              >
                {/* Icon Container */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #D9B073 0%, #8A5A2F 100%)",
                    boxShadow: "0 4px 15px rgba(138, 90, 47, 0.3)",
                  }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3
                  className="text-base font-semibold mb-2"
                  style={{
                    color: "#221816",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {value.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(34, 24, 22, 0.7)" }}
                >
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
