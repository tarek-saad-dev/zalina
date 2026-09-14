"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Landmark, Heart, Sparkles, Star } from "lucide-react";

const pillarKeys = [
  { icon: Landmark, key: "heritage" as const },
  { icon: Heart, key: "hospitality" as const },
  { icon: Sparkles, key: "experiences" as const },
  { icon: Star, key: "memories" as const },
];

export function ZalinaPromise() {
  const t = useTranslations("home.promise");

  return (
    <section
      className="relative overflow-hidden py-10"
      style={{ background: "var(--lux-surface)" }}
    >
      {/* Top Gold Line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--lux-gold), transparent)",
        }}
      />

      <div className="lux-container relative z-10">
        {/* Slim Pillars Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
          {pillarKeys.map((pillar, index) => {
            const Icon = pillar.icon;
            const isLast = index === pillarKeys.length - 1;
            const title = t(pillar.key);

            return (
              <React.Fragment key={pillar.key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4 px-6 md:px-10"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(201, 163, 92, 0.1)",
                      border: "1px solid rgba(201, 163, 92, 0.3)",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "var(--lux-gold)" }}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Title */}
                  <span
                    className="text-sm font-medium tracking-wide whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-body-ar), var(--font-display), serif",
                      color: "var(--lux-text)",
                    }}
                  >
                    {title}
                  </span>
                </motion.div>

                {/* Gold Divider (not after last item) */}
                {!isLast && (
                  <div
                    className="hidden md:block w-px h-8 mx-4"
                    style={{
                      background: "linear-gradient(180deg, transparent, var(--lux-gold), transparent)",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom Gold Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--lux-gold), transparent)",
        }}
      />
    </section>
  );
}
