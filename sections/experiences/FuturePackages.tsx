"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useExpMotion } from "./useExpMotion";

const PACKAGE_KEYS = [
  "weekend",
  "celebration",
  "seasonal",
  "custom",
] as const;

export function FuturePackages() {
  const t = useTranslations("experiences");
  const { prefersReducedMotion, fadeUp, transition, stagger } = useExpMotion();

  return (
    <section
      className="exp-section"
      style={{ background: "var(--exp-bg-navy)" }}
      aria-labelledby="future-packages-heading"
    >
      <div className="exp-container">
        <motion.div
          className="exp-section-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <p className="exp-eyebrow mb-3">{t("future.eyebrow")}</p>
          <h2 id="future-packages-heading" className="exp-section-heading">
            {t("future.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {PACKAGE_KEYS.map((key, index) => (
            <motion.article
              key={key}
              className="group relative overflow-hidden rounded-sm p-6 sm:p-7"
              style={{
                background:
                  "linear-gradient(160deg, #2a1f18 0%, #161210 55%, #0f0c0a 100%)",
                border: "1px solid rgba(212,175,55,0.12)",
                opacity: 0.92,
              }}
              initial={fadeUp.initial}
              whileInView={fadeUp.animate}
              viewport={{ once: true }}
              transition={transition(stagger(index))}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      borderColor: "rgba(212,175,55,0.35)",
                    }
              }
            >
              <span
                className="absolute right-4 top-4 rounded-sm px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em]"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  color: "var(--exp-gold)",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                {t("future.badge")}
              </span>

              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.05) 100%)",
                }}
                aria-hidden="true"
              />

              <h3
                className="relative mb-2 mt-6 text-xl sm:mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--exp-text-primary)",
                }}
              >
                {t(`future.packages.${key}.title`)}
              </h3>
              <p className="relative exp-body text-sm">
                {t(`future.packages.${key}.description`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
