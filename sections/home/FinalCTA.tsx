"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* Decorative Pattern */}
      <div className="absolute inset-0 lux-pattern opacity-30" />

      {/* Gold Radial Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(201, 163, 92, 0.15) 0%, transparent 50%)",
        }}
      />

      <div className="lux-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Ornament */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-12"
          >
            <svg
              width="100"
              height="50"
              viewBox="0 0 100 50"
              fill="none"
              className="opacity-50"
            >
              <path
                d="M0 25 L40 25 M60 25 L100 25"
                stroke="var(--lux-gold)"
                strokeWidth="1"
              />
              <circle
                cx="50"
                cy="25"
                r="8"
                stroke="var(--lux-gold)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M50 17 L53 25 L50 33 L47 25 Z"
                fill="var(--lux-gold)"
                fillOpacity="0.5"
              />
            </svg>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lux-eyebrow mb-8"
          >
            Begin Your Journey
          </motion.p>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lux-display mb-8"
          >
            Your Arabian
            <br />
            <span className="lux-shimmer">Escape Awaits</span>
          </motion.h2>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lux-divider mx-auto mb-10"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lux-heading-md mb-12"
            style={{ color: "var(--lux-muted)" }}
          >
            Stay. Celebrate. Belong.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/book" className="lux-btn-primary">
              Reserve Your Experience
            </Link>
            <Link href="/contact" className="lux-btn-secondary">
              Contact Concierge
            </Link>
          </motion.div>

          {/* Bottom Ornament */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex justify-center mt-20"
          >
            <div className="lux-ornament">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z"
                  fill="var(--lux-gold)"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
