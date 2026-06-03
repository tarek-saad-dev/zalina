"use client";

import React from "react";
import { motion } from "framer-motion";
import { Landmark, Heart, Sparkles, UtensilsCrossed, Shield } from "lucide-react";

const promises = [
  {
    icon: Landmark,
    title: "Authentic Heritage",
    description:
      "Every element reflects centuries of Arabian tradition, meticulously preserved and thoughtfully presented.",
  },
  {
    icon: Heart,
    title: "Exceptional Hospitality",
    description:
      "Our team embodies the warmth of Arabian welcome, anticipating your needs before you speak them.",
  },
  {
    icon: Sparkles,
    title: "Exquisite Experiences",
    description:
      "From sunrise to starlight, each moment is crafted to create lasting impressions and cherished memories.",
  },
  {
    icon: UtensilsCrossed,
    title: "Culinary Excellence",
    description:
      "Master chefs blend traditional recipes with contemporary artistry, creating flavors that tell stories.",
  },
  {
    icon: Shield,
    title: "Uncompromised Quality",
    description:
      "We hold ourselves to the highest standards, ensuring every detail meets the expectations of discerning guests.",
  },
];

export function ZalinaPromise() {
  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "var(--lux-surface)" }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 lux-pattern opacity-20" />
      
      {/* Gold Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201, 163, 92, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="lux-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lux-eyebrow mb-6"
          >
            Our Commitment
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lux-heading-lg mb-6"
          >
            The Zalina Promise
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lux-divider mx-auto"
          />
        </div>

        {/* Promise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="group text-center"
              >
                {/* Icon Container */}
                <div className="relative mb-8">
                  {/* Outer Ring */}
                  <div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--lux-border)",
                    }}
                  >
                    {/* Inner Circle */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-[rgba(201,163,92,0.15)]"
                      style={{
                        background: "rgba(201, 163, 92, 0.08)",
                        border: "1px solid var(--lux-gold)",
                      }}
                    >
                      <Icon
                        size={28}
                        style={{ color: "var(--lux-gold)" }}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Decorative Line */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--lux-gold), transparent)",
                    }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-medium mb-4 transition-colors duration-300 group-hover:text-[var(--lux-gold)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--lux-text)",
                  }}
                >
                  {promise.title}
                </h3>

                {/* Description */}
                <p className="lux-body text-sm leading-relaxed">
                  {promise.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
