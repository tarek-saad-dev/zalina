"use client";

import React from "react";
import { Award, Users, Palette, Gem } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Curated Excellence",
    description: "Every experience is thoughtfully designed",
  },
  {
    icon: Users,
    title: "Personalized Service",
    description: "Attentive care tailored to you",
  },
  {
    icon: Palette,
    title: "Authentic Atmosphere",
    description: "Immersive Arabian ambiance",
  },
  {
    icon: Gem,
    title: "Unforgettable Moments",
    description: "Creating memories that last forever",
  },
];

export function WhyChooseZalina() {
  return (
    <section
      className="section-spacing-mobile"
      style={{ background: "var(--exp-bg-surface)" }}
    >
      <div className="mobile-container">
        {/* Section Header */}
        <h2 className="exp-section-heading text-center mb-6">
          Why Choose Zalina Experiences
        </h2>

        {/* 4 Cards Grid - 2 Columns */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 hover-lift-luxury"
                style={{
                  height: "120px",
                  background: "var(--exp-bg-card)",
                  border: "1px solid var(--exp-border)",
                  borderRadius: "12px",
                }}
              >
                {/* Gold Outlined Icon */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                  style={{
                    border: "1px solid var(--exp-gold)",
                  }}
                >
                  <Icon
                    size={14}
                    style={{ color: "var(--exp-gold)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-[11px] font-semibold mb-1"
                  style={{ color: "var(--exp-text-primary)" }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[9px]"
                  style={{
                    color: "var(--exp-text-secondary)",
                    lineHeight: "12px",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
