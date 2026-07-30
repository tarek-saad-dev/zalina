"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function EmotionalIntro() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-bg)" }}
      aria-labelledby="emotional-intro-title"
    >
      {/* Ornamental pattern */}
      <div
        className="absolute inset-0 pointer-events-none exp-pattern opacity-15"
        aria-hidden="true"
      />

      <div className="zones-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left — Image Collage */}
          <motion.div
            className="w-full lg:w-[48%] relative"
            initial={!prefersReduced ? { opacity: 0, x: -40 } : undefined}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Soft amber backlight */}
            <div
              className="absolute -inset-8 rounded-3xl pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(200,155,82,0.07) 0%, transparent 70%)",
              }}
            />

            {/* Main image */}
            <div
              className="relative aspect-[5/4] sm:aspect-[4/5] rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(200,155,82,0.2)",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(200,155,82,0.06)",
              }}
            >
              <Image
                src="/assets/night.png"
                alt="An intimate evening setting at Zalina with warm lantern light and palm silhouettes"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(5,5,5,0.4) 100%)",
                }}
              />
            </div>

            {/* Overlapping secondary image */}
            <div
              className="absolute -bottom-6 -right-4 w-[45%] aspect-[3/4] rounded-xl overflow-hidden hidden md:block"
              style={{
                border: "1px solid rgba(200,155,82,0.25)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <Image
                src="/assets/about2.png"
                alt="Heritage courtyard detail with golden architecture"
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          </motion.div>

          {/* Right — Text Content */}
          <motion.div
            className="w-full lg:w-[52%] lg:pl-2"
            initial={!prefersReduced ? { opacity: 0, x: 40 } : undefined}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <span
              className="block text-[11px] font-medium tracking-[0.28em] uppercase mb-4"
              style={{ color: "var(--zones-gold)" }}
            >
              NOT JUST A VENUE
            </span>
            <h2
              id="emotional-intro-title"
              className="zones-section-title mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              More Than a Wedding Venue
            </h2>
            <p
              className="zones-body mb-8"
              style={{ fontSize: "15px", lineHeight: "1.8", maxWidth: "520px" }}
            >
              Zalina is designed for couples who want more than a beautiful
              setting — they want a night with atmosphere, story, warmth, and
              unforgettable presence.
            </p>

            {/* Quote card */}
            <motion.blockquote
              className="relative p-6 md:p-8 rounded-xl"
              style={{
                background: "rgba(23,27,35,0.75)",
                border: "1px solid rgba(200,155,82,0.2)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
              initial={!prefersReduced ? { opacity: 0, y: 20 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              {/* Gold accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-px"
                aria-hidden="true"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,155,82,0.4), transparent)",
                }}
              />
              <p
                className="italic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                  lineHeight: "1.7",
                  color: "var(--zones-text-light)",
                }}
              >
                &ldquo;Every celebration is composed like a story — from the
                first lantern glow to the final dance beneath the stars.&rdquo;
              </p>
            </motion.blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
