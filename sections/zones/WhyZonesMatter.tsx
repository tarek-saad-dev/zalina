"use client";

import React from "react";
import { Gem, Shield, Palette, Clock } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Premium Quality",
    description: "Every detail crafted to perfection",
  },
  {
    icon: Shield,
    title: "Exclusive Privacy",
    description: "Private spaces for intimate moments",
  },
  {
    icon: Palette,
    title: "Unique Atmosphere",
    description: "Each zone has its own character",
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description: "Day and evening availability",
  },
];

export function WhyZonesMatter() {
  return (
    <section className="zones-section-md" style={{ background: "var(--zones-bg)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            Our Promise
          </span>
          <h2 className="zones-section-title">Why Each Zone Matters</h2>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 zones-hover-lift"
                style={{
                  background: "var(--zones-surface)",
                  border: "1px solid var(--zones-border)",
                  borderRadius: "16px",
                }}
              >
                {/* Gold Icon Circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(200, 155, 82, 0.2)",
                    border: "1px solid var(--zones-gold)",
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: "var(--zones-gold)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="zones-card-title mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="zones-body">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
