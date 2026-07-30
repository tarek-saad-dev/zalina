"use client";

import React from "react";
import { Sun, Moon, Star, Briefcase, Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { OCCASIONS } from "./zones.data";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "day-events": Sun,
  "evening-affairs": Moon,
  weddings: Star,
  corporate: Briefcase,
  private: Heart,
};

export function ZoneDifferentiation() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "transparent", paddingTop: "72px", paddingBottom: "72px" }}
      aria-labelledby="zone-differentiation-title"
    >
      <div className="zones-container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="block text-[11px] font-medium tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            BY OCCASION
          </span>
          <h2
            id="zone-differentiation-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Zone Differentiation
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {OCCASIONS.map((occasion, index) => {
            const Icon = iconMap[occasion.id] || Star;
            return (
              <motion.div
                key={occasion.id}
                className="group relative flex flex-col items-center text-center p-6 md:p-7 rounded-xl transition-all duration-500 cursor-default"
                style={{
                  background: "rgba(9,12,20,0.7)",
                  border: "1px solid var(--zones-border)",
                  backdropFilter: "blur(8px)",
                }}
                initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={
                  !prefersReduced
                    ? {
                        y: -4,
                        borderColor: "rgba(200,155,82,0.35)",
                        boxShadow:
                          "0 0 30px rgba(200,155,82,0.1), 0 16px 40px rgba(0,0,0,0.3)",
                      }
                    : undefined
                }
              >
                {/* Soft inner glow on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(200,155,82,0.06) 0%, transparent 70%)",
                  }}
                />

                {/* Icon circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5 relative z-10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(200,155,82,0.15)]"
                  style={{
                    background: "rgba(200,155,82,0.08)",
                    border: "1px solid rgba(200,155,82,0.3)",
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: "var(--zones-gold)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3
                  className="mb-2 relative z-10"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--zones-text-light)",
                  }}
                >
                  {occasion.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed relative z-10"
                  style={{ color: "var(--zones-text-secondary)" }}
                >
                  {occasion.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
