"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const chips = [
  "Lantern-lit pathways",
  "Private celebration spaces",
  "Heritage architecture",
  "Night hospitality",
];

export function DestinationOverview() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative zones-section overflow-hidden"
      style={{ background: "transparent" }}
      aria-labelledby="destination-overview-title"
    >
      {/* Ornamental pattern background */}
      <div
        className="absolute inset-0 pointer-events-none exp-pattern opacity-20"
        aria-hidden="true"
      />

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
            THE DESTINATION
          </span>
          <h2
            id="destination-overview-title"
            className="zones-section-title mb-5"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Destination Overview
          </h2>
          <p
            className="zones-body mx-auto"
            style={{ maxWidth: "620px", fontSize: "15px", lineHeight: "1.8" }}
          >
            Zalina is designed as a collection of atmospheric spaces — each zone
            shaped for a different kind of gathering, from intimate evenings to
            grand celebrations beneath the stars.
          </p>
        </motion.div>

        {/* Large cinematic image + floating chips */}
        <motion.div
          className="relative max-w-[960px] mx-auto"
          initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Soft amber backlight */}
          <div
            className="absolute -inset-6 rounded-[28px] pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(200,155,82,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Image container with gold frame */}
          <div
            className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(200,155,82,0.2)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(200,155,82,0.08)",
            }}
          >
            <Image
              src="/assets/aboutHero.png"
              alt="Panoramic view of Zalina Arabian Village at dusk with heritage buildings and lantern-lit pathways"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 960px"
            />
            {/* Cinematic overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,5,5,0.2) 0%, transparent 40%, rgba(5,5,5,0.4) 100%)",
              }}
            />
          </div>

          {/* Floating detail chips - desktop */}
          <div className="hidden md:block" aria-hidden="true">
            {chips.map((chip, i) => {
              const positions: React.CSSProperties[] = [
                { top: "20%", left: "-7%" },
                { top: "60%", left: "-8%" },
                { top: "20%", right: "-7%", left: "auto" },
                { top: "60%", right: "-8%", left: "auto" },
              ];
              const pos = positions[i];
              return (
                <motion.div
                  key={chip}
                  className="absolute px-3.5 py-1.5 rounded-full text-[11px] font-medium"
                  style={{
                    ...pos,
                    background: "rgba(18,18,20,0.85)",
                    border: "1px solid rgba(200,155,82,0.25)",
                    color: "var(--zones-text-secondary)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                  initial={!prefersReduced ? { opacity: 0, scale: 0.9 } : undefined}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                >
                  {chip}
                </motion.div>
              );
            })}
          </div>

          {/* Mobile chips - displayed inline below image */}
          <div className="flex md:hidden flex-wrap justify-center gap-2 mt-5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{
                  background: "rgba(18,18,20,0.85)",
                  border: "1px solid rgba(200,155,82,0.25)",
                  color: "var(--zones-text-secondary)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
