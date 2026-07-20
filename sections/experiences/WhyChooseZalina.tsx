"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Users, Landmark, Gem } from "lucide-react";
import { useExpMotion } from "./useExpMotion";

const FEATURES = [
  {
    icon: Award,
    title: "Curated Excellence",
    description: "Every experience is thoughtfully designed.",
  },
  {
    icon: Users,
    title: "Personalized Service",
    description: "Attentive care tailored to you.",
  },
  {
    icon: Landmark,
    title: "Authentic Atmosphere",
    description: "Immersive Arabian ambience.",
  },
  {
    icon: Gem,
    title: "Unforgettable Moments",
    description: "Creating memories that last forever.",
  },
] as const;

export function WhyChooseZalina() {
  const { prefersReducedMotion, fadeUp, transition, stagger } = useExpMotion();

  return (
    <section
      className="exp-section relative"
      style={{ background: "var(--exp-bg-navy)" }}
      aria-labelledby="why-choose-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="exp-container relative z-10">
        <motion.div
          className="exp-section-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <h2 id="why-choose-heading" className="exp-section-heading">
            Why Choose Zalina Experiences
          </h2>
          <div className="mx-auto mt-4 exp-editorial-line-long" aria-hidden="true" />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                className="group relative overflow-hidden rounded-sm p-6 text-center sm:p-7"
                style={{
                  background: "var(--exp-bg-card)",
                  border: "1px solid var(--exp-border)",
                  backdropFilter: "blur(16px)",
                }}
                initial={fadeUp.initial}
                whileInView={fadeUp.animate}
                viewport={{ once: true }}
                transition={transition(stagger(index))}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: -3,
                        borderColor: "rgba(212,175,55,0.38)",
                      }
                }
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(ellipse at top, rgba(212,175,55,0.07) 0%, transparent 60%)",
                  }}
                  aria-hidden="true"
                />

                <div
                  className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:mb-5 sm:h-14 sm:w-14"
                  style={{
                    border: "1px solid var(--exp-border)",
                    background: "rgba(212,175,55,0.06)",
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: "var(--exp-gold)" }}
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                </div>

                <h3
                  className="relative mb-2 text-lg sm:mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--exp-text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <p className="relative exp-body text-sm">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
