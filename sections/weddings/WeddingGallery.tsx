"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { GALLERY_MOMENTS } from "./weddings.data";

export function WeddingGallery() {
  const prefersReduced = useReducedMotion();
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "transparent",
        paddingTop: "72px",
        paddingBottom: "72px",
      }}
      aria-labelledby="wedding-gallery-title"
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
            SCENES MADE FOR MEMORY
          </span>
          <h2
            id="wedding-gallery-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Every Frame Deserves to Feel Timeless
          </h2>
        </motion.div>
      </div>

      {/* Gallery strip — horizontal scroll */}
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-5 md:px-8 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        role="region"
        aria-label="Wedding gallery"
      >
        {GALLERY_MOMENTS.map((moment, index) => (
          <motion.div
            key={moment.caption}
            className="group relative flex-shrink-0 snap-center rounded-xl overflow-hidden cursor-default"
            style={{
              width: "clamp(260px, 30vw, 340px)",
              height: "clamp(320px, 40vw, 420px)",
              border: "1px solid var(--zones-border)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}
            initial={!prefersReduced ? { opacity: 0, scale: 0.95 } : undefined}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
          >
            <Image
              src={moment.image}
              alt={`Zalina wedding scene: ${moment.caption}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="340px"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(180deg, transparent 48%, rgba(5,5,5,0.58) 100%)",
              }}
            />
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <span
                className="text-xs font-medium opacity-90 md:opacity-70 md:group-hover:opacity-100 transition-opacity duration-500"
                style={{ color: "var(--zones-text-light)" }}
              >
                {moment.caption}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
