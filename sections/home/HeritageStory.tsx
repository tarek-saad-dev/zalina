"use client";

import React from "react";
import { motion } from "framer-motion";

export function HeritageStory() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--lux-bg)", paddingTop: "40px", paddingBottom: "30px" }}
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
            className="flex justify-center mb-4"
          >
            <svg
              width="100"
              height="32"
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lux-heading-xl mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.2 }}
          >
            A Heritage. A Feeling. <span style={{ color: "var(--lux-gold)" }}>A Story.</span>
          </motion.h2>

          {/* Luxury Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lux-divider mx-auto mb-4"
          />

          {/* Story Text - Single Compact Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lux-body"
            style={{ maxWidth: "650px", margin: "0 auto", fontSize: "0.95rem" }}
          >
            Nestled within the golden dunes, Zalina Arabian Village is more than
            a destination—it is a journey through time, where ancient caravans blend
            with Arabian hospitality and every corner tells a story of timeless elegance.
          </motion.p>

          {/* Decorative Bottom Ornament */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-5"
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
