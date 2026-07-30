"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WEDDING_DETAILS } from "./weddings.data";

export function WeddingDetails() {
  const prefersReduced = useReducedMotion();

  const leftCol = WEDDING_DETAILS.slice(0, 4);
  const rightCol = WEDDING_DETAILS.slice(4);

  return (
    <section
      className="zones-section-md relative overflow-hidden"
      style={{ background: "var(--zones-bg)" }}
      aria-labelledby="wedding-details-title"
    >
      {/* Ornamental pattern */}
      <div
        className="absolute inset-0 pointer-events-none exp-pattern opacity-10"
        aria-hidden="true"
      />

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
            THE DETAILS
          </span>
          <h2
            id="wedding-details-title"
            className="zones-section-title mb-5"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Details That Make the Night
          </h2>
          <p
            className="zones-body mx-auto"
            style={{ maxWidth: "560px", fontSize: "15px", lineHeight: "1.8" }}
          >
            The difference lives in the details — light, movement, hospitality,
            timing, and atmosphere.
          </p>
        </motion.div>

        {/* Editorial two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[960px] mx-auto">
          {[leftCol, rightCol].map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col">
              {col.map((detail, i) => (
                <motion.div
                  key={detail.title}
                  className="group relative py-5 transition-colors duration-300"
                  style={{
                    borderBottom: "1px solid var(--zones-border)",
                  }}
                  initial={
                    !prefersReduced ? { opacity: 0, y: 20 } : undefined
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.5,
                    delay: (colIndex * 4 + i) * 0.06,
                  }}
                >
                  {/* Hover highlight */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    aria-hidden="true"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(200,155,82,0.03), transparent)",
                    }}
                  />

                  <div className="relative z-10 flex items-start gap-4 px-3">
                    {/* Gold dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: "var(--zones-gold)" }}
                      aria-hidden="true"
                    />
                    <div>
                      <h3
                        className="mb-1"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1rem",
                          fontWeight: 500,
                          color: "var(--zones-text-light)",
                        }}
                      >
                        {detail.title}
                      </h3>
                      <p
                        className="text-[13px] leading-relaxed"
                        style={{ color: "var(--zones-text-secondary)" }}
                      >
                        {detail.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
