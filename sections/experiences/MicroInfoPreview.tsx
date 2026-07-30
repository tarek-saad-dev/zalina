"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, Sparkles, Plus } from "lucide-react";
import { useExpMotion } from "./useExpMotion";

const INFO_CARDS = [
  {
    icon: Users,
    title: "Ideal For",
    description: "Couples, small groups, celebrations",
  },
  {
    icon: Clock,
    title: "Duration",
    description: "2–5 hours",
  },
  {
    icon: Sparkles,
    title: "Atmosphere",
    description: "Elegant, intimate, memorable",
  },
  {
    icon: Plus,
    title: "Add-ons",
    description: "Private transfers, photography, flowers",
  },
] as const;

export function MicroInfoPreview() {
  const { fadeUp, transition, stagger } = useExpMotion();

  return (
    <section
      className="exp-section"
      style={{ background: "transparent" }}
      aria-labelledby="info-heading"
    >
      <div className="exp-container">
        <motion.div
          className="exp-section-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <p className="exp-eyebrow mb-3">Details</p>
          <h2 id="info-heading" className="exp-section-heading">
            Experience Information
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {INFO_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                className="exp-glass flex gap-4 rounded-sm p-6 sm:gap-5 sm:p-7"
                style={{ boxShadow: "0 14px 36px rgba(0,0,0,0.28)" }}
                initial={fadeUp.initial}
                whileInView={fadeUp.animate}
                viewport={{ once: true }}
                transition={transition(stagger(index))}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
                  style={{
                    border: "1px solid var(--exp-border)",
                    background: "rgba(212,175,55,0.06)",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: "var(--exp-gold)" }}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3
                    className="mb-1.5 text-lg sm:mb-2 sm:text-xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--exp-text-primary)",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="exp-body text-sm">{card.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
