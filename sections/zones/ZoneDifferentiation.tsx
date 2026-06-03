"use client";

import React from "react";
import { Sun, Moon, Star, Compass, Heart } from "lucide-react";

const zoneTypes = [
  {
    icon: Sun,
    title: "Day Events",
    description: "Perfect for brunches, pool parties, and daytime celebrations",
  },
  {
    icon: Moon,
    title: "Evening Affairs",
    description: "Ideal for dinners, galas, and nighttime gatherings",
  },
  {
    icon: Star,
    title: "Weddings",
    description: "Dedicated spaces for ceremonies and receptions",
  },
  {
    icon: Compass,
    title: "Corporate",
    description: "Professional settings for business events and conferences",
  },
  {
    icon: Heart,
    title: "Private",
    description: "Intimate spaces for exclusive celebrations",
  },
];

export function ZoneDifferentiation() {
  return (
    <section className="zones-section-md" style={{ background: "var(--zones-bg)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            By Occasion
          </span>
          <h2 className="zones-section-title">Zone Differentiation</h2>
        </div>

        {/* 5 Equal Cards */}
        <div className="flex flex-wrap justify-center gap-4">
          {zoneTypes.map((zone, index) => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.title}
                className="flex flex-col items-center text-center p-5 zones-hover-lift"
                style={{
                  width: "220px",
                  height: "260px",
                  background: "var(--zones-surface)",
                  border: "1px solid var(--zones-border)",
                  borderRadius: "16px",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(200, 155, 82, 0.15)",
                    border: "1px solid var(--zones-gold)",
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: "var(--zones-gold)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="zones-card-title mb-3">{zone.title}</h3>

                {/* Description */}
                <p
                  className="text-sm"
                  style={{
                    color: "var(--zones-text-secondary)",
                    lineHeight: "20px",
                  }}
                >
                  {zone.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
