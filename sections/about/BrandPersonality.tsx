"use client";

import React from "react";
import { Sparkles, Crown, Key, HandHeart, Scroll, Gem, Eye, Feather, Anchor } from "lucide-react";

const personalityTraits = [
  { icon: Sparkles, title: "Warm", height: "short" },
  { icon: Crown, title: "Elegant", height: "tall" },
  { icon: Key, title: "Exclusive", height: "short" },
  { icon: HandHeart, title: "Welcoming", height: "medium" },
  { icon: Scroll, title: "Authentic", height: "tall" },
  { icon: Gem, title: "Refined", height: "short" },
  { icon: Eye, title: "Immersive", height: "medium" },
  { icon: Feather, title: "Graceful", height: "short" },
  { icon: Anchor, title: "Modern Yet Rooted", height: "medium" },
];

export function BrandPersonality() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="section-label block mb-4">Who We Are</span>
          <h2
            className="section-heading-about"
            style={{ color: "#F8F6F2" }}
          >
            Brand Personality
          </h2>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {personalityTraits.map((trait, index) => {
            const Icon = trait.icon;
            // Determine height based on trait
            const heightClass =
              trait.height === "tall"
                ? "h-[200px]"
                : trait.height === "medium"
                ? "h-[160px]"
                : "h-[140px]";

            return (
              <div
                key={trait.title}
                className={`${heightClass} rounded-[18px] p-6 flex flex-col items-center justify-center text-center hover-lift-card`}
                style={{
                  background: "#F4EFE8",
                  border: "1px solid #DCC8AF",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Icon Container */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, #D9B073 0%, #8A5A2F 100%)",
                    boxShadow: "0 4px 15px rgba(138, 90, 47, 0.3)",
                  }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: "#221816",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {trait.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
