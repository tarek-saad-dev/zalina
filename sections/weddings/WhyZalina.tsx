"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { REASONS_TO_CHOOSE } from "./weddings.data";
import {
  Sparkles,
  Landmark,
  Maximize2,
  Heart,
  Camera,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: LucideIcon[] = [
  Sparkles,
  Landmark,
  Maximize2,
  Heart,
  Camera,
  Users,
];

export function WhyZalina() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "transparent",
        paddingTop: "72px",
        paddingBottom: "72px",
      }}
      aria-labelledby="why-zalina-title"
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
            WHY ZALINA
          </span>
          <h2
            id="why-zalina-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Why Couples Choose Zalina
          </h2>
        </motion.div>

        {/* Cards — 3x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-[1080px] mx-auto">
          {REASONS_TO_CHOOSE.map((reason, index) => {
            const Icon = icons[index] || Sparkles;
            return (
              <motion.div
                key={reason.title}
                className="group relative flex flex-col items-center text-center p-6 md:p-7 rounded-xl transition-all duration-500 cursor-default"
                style={{
                  background: "rgba(9,12,20,0.7)",
                  border: "1px solid var(--zones-border)",
                  backdropFilter: "blur(8px)",
                }}
                initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={!prefersReduced ? { y: -3 } : undefined}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px rgba(200,155,82,0.15), 0 0 30px rgba(200,155,82,0.05)",
                  }}
                />

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-4 relative z-10"
                  style={{
                    background: "rgba(200,155,82,0.1)",
                    border: "1px solid rgba(200,155,82,0.25)",
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: "var(--zones-gold)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3
                  className="mb-2 relative z-10"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    color: "var(--zones-text-light)",
                  }}
                >
                  {reason.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed relative z-10"
                  style={{ color: "var(--zones-text-secondary)" }}
                >
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
