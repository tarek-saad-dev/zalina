"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CELEBRATION_STYLES } from "./weddings.data";

export function CelebrationStyles() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="celebration-styles-title"
    >
      <div className="zones-container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="block text-[11px] font-medium tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            CELEBRATION STYLES
          </span>
          <h2
            id="celebration-styles-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Choose the Celebration That Feels Like You
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {CELEBRATION_STYLES.map((style, index) => (
            <motion.div
              key={style.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                background: "var(--zones-surface-alt)",
                border: "1px solid var(--zones-border)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
              initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={!prefersReduced ? { y: -4 } : undefined}
            >
              {/* Image */}
              <div className="relative h-[200px] sm:h-[180px] overflow-hidden">
                <Image
                  src={style.image}
                  alt={style.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(17,21,28,0.7) 100%)",
                  }}
                />
                {/* Gold label */}
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider"
                  style={{
                    background: "rgba(200,155,82,0.15)",
                    border: "1px solid rgba(200,155,82,0.35)",
                    color: "var(--zones-gold)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {style.id.replace("-", " ")}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    color: "var(--zones-text-light)",
                  }}
                >
                  {style.title}
                </h3>
                <p
                  className="text-sm mb-5 leading-relaxed"
                  style={{ color: "var(--zones-text-secondary)" }}
                >
                  {style.description}
                </p>
                <Link
                  href="/book-now"
                  className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                  style={{ height: "34px", paddingInline: "18px" }}
                >
                  {style.cta}
                </Link>
              </div>

              {/* Hover glow edge */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                aria-hidden="true"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(200,155,82,0.2), 0 0 40px rgba(200,155,82,0.06)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
