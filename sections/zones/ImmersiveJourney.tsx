"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { JOURNEY_STEPS } from "./zones.data";

export function ImmersiveJourney() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="immersive-journey-title"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 80%, rgba(200,155,82,0.04) 0%, transparent 60%)",
        }}
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
            YOUR JOURNEY
          </span>
          <h2
            id="immersive-journey-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Immersive Experience Journey
          </h2>
        </motion.div>

        {/* Desktop: horizontal cinematic cards with connecting line */}
        <div className="relative">
          {/* Gold connecting line behind cards - desktop only */}
          <div
            className="absolute top-1/2 left-[8%] right-[8%] h-px hidden lg:block pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(200,155,82,0.2), rgba(200,155,82,0.2), transparent)",
              transform: "translateY(-50%)",
            }}
          />

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {JOURNEY_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                className="group relative rounded-xl overflow-hidden cursor-default"
                style={{
                  height: "clamp(320px, 45vw, 420px)",
                  border: "1px solid var(--zones-border)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
                initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                whileHover={
                  !prefersReduced
                    ? { y: -5 }
                    : undefined
                }
              >
                {/* Background image */}
                <Image
                  src={step.image}
                  alt={`Step ${step.number}: ${step.title}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Dark gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.3) 40%, rgba(5,5,5,0.85) 100%)",
                  }}
                />

                {/* Gold number */}
                <div
                  className="absolute top-5 left-5 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold z-10"
                  style={{
                    background: "rgba(200,155,82,0.15)",
                    border: "1px solid rgba(200,155,82,0.5)",
                    color: "var(--zones-gold)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {step.number}
                </div>

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: "var(--zones-text-light)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500"
                    style={{ color: "var(--zones-text-muted)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
