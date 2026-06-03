"use client";

import React from "react";
import { motion } from "framer-motion";

export function HeritageStory() {
  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "var(--lux-bg)" }}
    >
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 lux-pattern opacity-50" />

      <div className="lux-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative Top Ornament */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-12"
          >
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              fill="none"
              className="opacity-60"
            >
              <path
                d="M60 0 L60 40"
                stroke="var(--lux-gold)"
                strokeWidth="1"
              />
              <path
                d="M0 20 L120 20"
                stroke="var(--lux-gold)"
                strokeWidth="1"
              />
              <circle
                cx="60"
                cy="20"
                r="8"
                stroke="var(--lux-gold)"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="60"
                cy="20"
                r="3"
                fill="var(--lux-gold)"
              />
            </svg>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lux-heading-xl mb-8"
          >
            A Heritage.
            <br />
            A Feeling.
            <br />
            <span style={{ color: "var(--lux-gold)" }}>A Story.</span>
          </motion.h2>

          {/* Luxury Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lux-divider mx-auto mb-10"
          />

          {/* Story Text */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lux-body-lg mb-8"
          >
            Nestled within the golden dunes, Zalina Arabian Village is more than
            a destination—it is a journey through time. Here, the whispers of
            ancient caravans blend with the gentle rustle of palm fronds, creating
            an atmosphere of profound tranquility and timeless elegance.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="lux-body-lg"
          >
            Every corner tells a story of Arabian hospitality, where guests are
            not merely visitors, but honored members of an extended family. This
            is where memories are woven into the fabric of tradition, where every
            sunset paints a new chapter of your personal legacy.
          </motion.p>

          {/* Decorative Bottom Ornament */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex justify-center mt-16"
          >
            <div className="lux-ornament">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                  fill="var(--lux-gold)"
                  fillOpacity="0.6"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
