"use client";

import React from "react";
import { Gem, Shield, Palette, Clock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PROMISE_CARDS } from "./zones.data";
import type { LucideIcon } from "lucide-react";

const icons: LucideIcon[] = [Gem, Shield, Palette, Clock];

export function WhyZonesMatter() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "transparent", paddingTop: "72px", paddingBottom: "72px" }}
      aria-labelledby="why-zones-title"
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
            OUR PROMISE
          </span>
          <h2
            id="why-zones-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Why Each Zone Matters
          </h2>
        </motion.div>

        {/* 4 Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROMISE_CARDS.map((card, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={card.title}
                className="group relative flex flex-col items-center text-center p-7 rounded-xl transition-all duration-500"
                style={{
                  background: "rgba(9,12,20,0.6)",
                  border: "1px solid var(--zones-border)",
                  backdropFilter: "blur(6px)",
                }}
                initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={
                  !prefersReduced
                    ? {
                        y: -3,
                        borderColor: "rgba(200,155,82,0.3)",
                        boxShadow:
                          "0 0 24px rgba(200,155,82,0.08), 0 12px 32px rgba(0,0,0,0.25)",
                      }
                    : undefined
                }
              >
                {/* Low backlight */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(ellipse at center bottom, rgba(200,155,82,0.05) 0%, transparent 70%)",
                  }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5 relative z-10"
                  style={{
                    background: "rgba(200,155,82,0.1)",
                    border: "1px solid rgba(200,155,82,0.25)",
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
                    fontSize: "1.15rem",
                    fontWeight: 500,
                    color: "var(--zones-text-light)",
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed relative z-10"
                  style={{ color: "var(--zones-text-secondary)" }}
                >
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
