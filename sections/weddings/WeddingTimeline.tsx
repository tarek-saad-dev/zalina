"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { WEDDING_JOURNEY_STEPS, clampJourneyStep } from "./weddings.data";

export function WeddingTimeline() {
  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);

  const handleStepClick = (step: number) => {
    setActiveStep(clampJourneyStep(step));
  };

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="wedding-timeline-title"
    >
      {/* Subtle glow */}
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
            YOUR STORY
          </span>
          <h2
            id="wedding-timeline-title"
            className="zones-section-title mb-5"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Your Wedding Journey
          </h2>
          <p
            className="zones-body mx-auto"
            style={{ maxWidth: "520px", fontSize: "15px", lineHeight: "1.8" }}
          >
            Every moment flows with intention — from arrival to celebration.
          </p>
        </motion.div>

        {/* Desktop — Horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting gold line */}
          <div
            className="absolute top-[218px] left-[10%] right-[10%] h-px pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(200,155,82,0.25), rgba(200,155,82,0.25), transparent)",
            }}
          />

          <div className="grid grid-cols-5 gap-5">
            {WEDDING_JOURNEY_STEPS.map((step, index) => {
              const isActive = activeStep === step.number;
              return (
                <motion.div
                  key={step.id}
                  initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    className="w-full text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] rounded-xl"
                    aria-pressed={isActive}
                  >
                    {/* Image */}
                    <div
                      className="relative h-[180px] rounded-xl overflow-hidden mb-5 transition-all duration-500"
                      style={{
                        border: isActive
                          ? "1px solid rgba(200,155,82,0.4)"
                          : "1px solid var(--zones-border)",
                        boxShadow: isActive
                          ? "0 0 40px rgba(200,155,82,0.1), 0 12px 40px rgba(0,0,0,0.4)"
                          : "0 8px 24px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Image
                        src={step.image}
                        alt={`Step ${step.number}: ${step.title}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="20vw"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.6) 100%)",
                        }}
                      />
                    </div>

                    {/* Number */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold transition-all duration-300"
                      style={{
                        background: isActive
                          ? "rgba(200,155,82,0.2)"
                          : "rgba(200,155,82,0.08)",
                        border: isActive
                          ? "1px solid rgba(200,155,82,0.5)"
                          : "1px solid rgba(200,155,82,0.2)",
                        color: "var(--zones-gold)",
                      }}
                    >
                      {step.number}
                    </div>

                    {/* Title */}
                    <h3
                      className="mb-1"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: isActive
                          ? "var(--zones-text-light)"
                          : "var(--zones-text-secondary)",
                        transition: "color 0.3s",
                      }}
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--zones-text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile — Vertical timeline */}
        <div className="lg:hidden flex flex-col gap-6 relative">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 left-5 w-px pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(200,155,82,0.2), rgba(200,155,82,0.2), transparent)",
            }}
          />

          {WEDDING_JOURNEY_STEPS.map((step, index) => {
            const isActive = activeStep === step.number;
            return (
              <motion.div
                key={step.id}
                className="flex gap-5 pl-2"
                initial={!prefersReduced ? { opacity: 0, x: -20 } : undefined}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                {/* Number dot */}
                <button
                  type="button"
                  onClick={() => handleStepClick(step.number)}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                  style={{
                    background: isActive
                      ? "rgba(200,155,82,0.2)"
                      : "rgba(200,155,82,0.08)",
                    border: isActive
                      ? "1px solid rgba(200,155,82,0.5)"
                      : "1px solid rgba(200,155,82,0.2)",
                    color: "var(--zones-gold)",
                  }}
                  aria-pressed={isActive}
                >
                  {step.number}
                </button>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: isActive
                        ? "var(--zones-text-light)"
                        : "var(--zones-text-secondary)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--zones-text-secondary)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
