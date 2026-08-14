"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SIGNATURE_FEATURES } from "./weddings.data";

import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

export function SignatureExperience() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "transparent" }}
      aria-labelledby="signature-experience-title"
    >
      {/* Subtle backlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(200,155,82,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="zones-container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="block text-[11px] font-medium tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            SIGNATURE EXPERIENCE
          </span>
          <h2
            id="signature-experience-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            The Signature Zalina Wedding
          </h2>
        </motion.div>

        {/* Split cinematic layout */}
        <motion.div
          className="flex flex-col lg:flex-row items-stretch gap-0 rounded-2xl overflow-hidden"
          style={{
            background: "var(--zones-surface-alt)",
            borderTop: "2px solid rgba(200,155,82,0.3)",
            borderLeft: "1px solid rgba(200,155,82,0.15)",
            borderRight: "1px solid rgba(200,155,82,0.15)",
            borderBottom: "1px solid rgba(200,155,82,0.15)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,155,82,0.06)",
          }}
          initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Image — Left */}
          <div className="relative w-full lg:w-[57%] h-[300px] sm:h-[380px] lg:h-auto lg:min-h-[560px] overflow-hidden group">
            <Image
              src={NEUTRAL_MEDIA_FALLBACK}
              alt="Zalina courtyard at night — lantern-lit pathways with heritage architecture perfect for wedding ceremonies"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
            {/* Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(90deg, transparent 60%, rgba(29,35,48,0.5) 100%)",
              }}
            />
            {/* Floating mini-card */}
            <div
              className="absolute bottom-6 left-6 px-5 py-3 rounded-xl"
              style={{
                background: "rgba(18,18,20,0.85)",
                border: "1px solid rgba(200,155,82,0.3)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <span
                className="block text-xs font-medium mb-0.5"
                style={{ color: "var(--zones-gold)" }}
              >
                From vows to starlight
              </span>
              <span
                className="block text-[11px]"
                style={{ color: "var(--zones-text-muted)" }}
              >
                A complete celebration journey
              </span>
            </div>
          </div>

          {/* Content Panel — Right */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:w-[43%] relative">
            {/* Glass effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(135deg, rgba(9,12,20,0.95) 0%, rgba(29,35,48,0.9) 100%)",
              }}
            />

            <div className="relative z-10">
              <p
                className="zones-body mb-7"
                style={{ fontSize: "15px", lineHeight: "1.8" }}
              >
                A complete wedding atmosphere shaped around arrival, ceremony,
                dining, celebration, and memory — with every detail designed to
                feel cinematic, warm, and deeply personal.
              </p>

              {/* Feature bullets */}
              <div className="space-y-3 mb-8">
                {SIGNATURE_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--zones-gold)" }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--zones-text-secondary)" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gold line accent */}
              <div
                className="mb-8"
                aria-hidden="true"
                style={{
                  width: "60px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, var(--zones-gold), transparent)",
                }}
              />

              <Link
                href="/book-now"
                className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
                style={{ height: "42px", paddingInline: "26px" }}
              >
                Plan This Experience
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
