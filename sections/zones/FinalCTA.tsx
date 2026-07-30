"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function FinalCTA() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-bg)" }}
      aria-labelledby="final-cta-title"
    >
      <div className="zones-container relative z-10">
        <motion.div
          className="relative overflow-hidden rounded-2xl flex flex-col items-center justify-center text-center px-6 py-14 md:py-16"
          style={{
            background: "rgba(23,27,35,0.8)",
            border: "1px solid rgba(200,155,82,0.2)",
            backdropFilter: "blur(12px)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.4), 0 0 60px rgba(200,155,82,0.05)",
          }}
          initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Background image layer */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Image
              src="/assets/night.png"
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(17,21,28,0.8) 0%, rgba(17,21,28,0.85) 100%)",
              }}
            />
          </div>

          {/* Warm amber glow behind panel */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(200,155,82,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Ornamental pattern */}
          <div
            className="absolute inset-0 pointer-events-none exp-pattern opacity-20"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 max-w-[620px]">
            <span
              className="block text-[11px] font-medium tracking-[0.28em] uppercase mb-5"
              style={{ color: "var(--zones-gold)" }}
            >
              BEGIN YOUR JOURNEY
            </span>

            <h2
              id="final-cta-title"
              className="mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 500,
                color: "var(--zones-text-light)",
                lineHeight: "1.2",
              }}
            >
              Find the Space That Matches Your Moment
            </h2>

            <p
              className="mb-6 mx-auto max-w-[500px]"
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "var(--zones-text-secondary)",
              }}
            >
              From intimate private gatherings to grand celebrations, Zalina offers
              a setting designed around your occasion.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book-now"
                className="zones-btn-gold zones-radius-pill flex items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11151c]"
                style={{ height: "44px", paddingInline: "28px" }}
              >
                Book a Consultation
              </Link>
              <Link
                href="#main-zones"
                className="flex items-center justify-center text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-[rgba(200,155,82,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11151c]"
                style={{
                  height: "44px",
                  paddingInline: "28px",
                  background: "transparent",
                  color: "var(--zones-text-light)",
                  borderRadius: "999px",
                  border: "1px solid var(--zones-border)",
                }}
              >
                View All Zones
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
