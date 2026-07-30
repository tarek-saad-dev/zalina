"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useExpMotion } from "./useExpMotion";

const STEPS = [
  { number: 1, title: "Choose", description: "Browse & select" },
  { number: 2, title: "Customize", description: "Personalize details" },
  { number: 3, title: "Add-ons", description: "Enhance experience" },
  { number: 4, title: "Confirm", description: "Secure booking" },
  { number: 5, title: "Enjoy", description: "Live the moment" },
] as const;

function clampStep(step: number): number {
  if (!Number.isFinite(step)) return 1;
  return Math.min(5, Math.max(1, Math.round(step)));
}

export function ExperienceJourney() {
  const [activeStep, setActiveStep] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const { prefersReducedMotion, fadeUp, transition } = useExpMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const safeActive = clampStep(activeStep);

  const handleStep = (step: number) => {
    setActiveStep(clampStep(step));
  };

  return (
    <section
      className="exp-section overflow-hidden"
      style={{ background: "transparent" }}
      aria-labelledby="journey-heading"
    >
      <div className="exp-container">
        <motion.div
          className="exp-section-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <p className="exp-eyebrow mb-3">How It Works</p>
          <h2 id="journey-heading" className="exp-section-heading">
            Experience Journey
          </h2>
        </motion.div>

        {isDesktop ? (
          <div className="relative">
            <div
              className="absolute left-0 right-0 top-[2.75rem] h-px"
              style={{ background: "rgba(212,175,55,0.15)" }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute left-0 top-[2.75rem] h-px origin-left"
              style={{
                background:
                  "linear-gradient(90deg, var(--exp-gold), var(--exp-gold-soft))",
                boxShadow: "0 0 12px rgba(212,175,55,0.45)",
              }}
              initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1.4,
                ease: "easeOut",
              }}
              aria-hidden="true"
            />

            <ol className="relative grid grid-cols-5 gap-4">
              {STEPS.map((step) => {
                const isActive = safeActive === step.number;
                return (
                  <li key={step.number}>
                    <button
                      type="button"
                      onClick={() => handleStep(step.number)}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Step ${step.number}: ${step.title}`}
                      className="group flex w-full flex-col items-center text-center transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--exp-gold)]"
                      style={{
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                      }}
                    >
                      <span
                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-full text-xl transition-all duration-300"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isActive ? "#1a1208" : "var(--exp-gold)",
                          background: isActive
                            ? "linear-gradient(135deg, #d4af37, #e8c66a)"
                            : "rgba(15,12,10,0.9)",
                          border: isActive
                            ? "none"
                            : "1px solid var(--exp-border)",
                          boxShadow: isActive
                            ? "0 0 28px rgba(212,175,55,0.35)"
                            : "none",
                        }}
                      >
                        {step.number}
                      </span>
                      <span
                        className="mb-1 text-lg"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isActive
                            ? "var(--exp-gold-soft)"
                            : "var(--exp-text-primary)",
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--exp-text-muted)" }}
                      >
                        {step.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <ol className="relative space-y-0">
            <motion.div
              className="absolute bottom-4 left-[1.65rem] top-4 w-px origin-top"
              style={{
                background:
                  "linear-gradient(180deg, var(--exp-gold), rgba(212,175,55,0.15))",
              }}
              initial={{ scaleY: prefersReducedMotion ? 1 : 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 1.2 }}
              aria-hidden="true"
            />

            {STEPS.map((step) => {
              const isActive = safeActive === step.number;
              return (
                <li key={step.number}>
                  <button
                    type="button"
                    onClick={() => handleStep(step.number)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Step ${step.number}: ${step.title}`}
                    className="relative flex w-full items-start gap-5 py-4 text-left transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exp-gold)]"
                    style={{
                      transform: isActive ? "translateX(4px)" : "none",
                    }}
                  >
                    <span
                      className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: isActive ? "#1a1208" : "var(--exp-gold)",
                        background: isActive
                          ? "linear-gradient(135deg, #d4af37, #e8c66a)"
                          : "var(--exp-bg-deep)",
                        border: isActive
                          ? "none"
                          : "1px solid var(--exp-border)",
                        boxShadow: isActive
                          ? "0 0 24px rgba(212,175,55,0.35)"
                          : "none",
                      }}
                    >
                      {step.number}
                    </span>
                    <span className="pt-2">
                      <span
                        className="mb-1 block text-xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: isActive
                            ? "var(--exp-gold-soft)"
                            : "var(--exp-text-primary)",
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="block text-sm"
                        style={{ color: "var(--exp-text-muted)" }}
                      >
                        {step.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
