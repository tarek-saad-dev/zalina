"use client";

import React from "react";
import { Users, Clock, Sparkles, Plus } from "lucide-react";

const infoCards = [
  {
    icon: Users,
    title: "Ideal For",
    description: "Couples, Small Groups, Celebrations",
  },
  {
    icon: Clock,
    title: "Duration",
    description: "2-5 Hours",
  },
  {
    icon: Sparkles,
    title: "Atmosphere",
    description: "Elegant, Intimate, Memorable",
  },
  {
    icon: Plus,
    title: "Add-ons",
    description: "Private Transfers, Photography, Flowers",
  },
];

export function MicroInfoPreview() {
  return (
    <section
      className="section-spacing-mobile"
      style={{ background: "var(--exp-bg-surface)" }}
    >
      <div className="mobile-container">
        {/* Section Header */}
        <span
          className="text-[10px] tracking-widest uppercase mb-2 block text-center"
          style={{ color: "var(--exp-gold)" }}
        >
          Details
        </span>
        <h2 className="exp-section-heading text-center mb-6">
          Experience Information
        </h2>

        {/* 4 Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          {infoCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="flex flex-col p-3 hover-lift-luxury"
                style={{
                  height: "90px",
                  background: "var(--exp-bg-card)",
                  border: "1px solid var(--exp-border)",
                  borderRadius: "10px",
                }}
              >
                {/* Icon */}
                <Icon
                  size={14}
                  className="mb-2"
                  style={{ color: "var(--exp-gold)" }}
                  strokeWidth={1.5}
                />

                {/* Title */}
                <h3
                  className="text-[11px] font-semibold mb-1"
                  style={{ color: "var(--exp-text-primary)" }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[9px]"
                  style={{
                    color: "var(--exp-text-secondary)",
                    lineHeight: "12px",
                  }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
