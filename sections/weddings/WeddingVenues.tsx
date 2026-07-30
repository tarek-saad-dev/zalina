"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { WEDDING_VENUES, getSafeWeddingVenueId } from "./weddings.data";
import type { WeddingVenueId } from "./weddings.data";

export function WeddingVenues() {
  const prefersReduced = useReducedMotion();
  const [activeVenue, setActiveVenue] = useState<WeddingVenueId>(
    "royal-wedding-court"
  );

  const handleVenueClick = (id: string) => {
    setActiveVenue(getSafeWeddingVenueId(id));
  };

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="wedding-venues-title"
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
            CHOOSE YOUR SETTING
          </span>
          <h2
            id="wedding-venues-title"
            className="zones-section-title mb-5"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Choose Your Wedding World
          </h2>
          <p
            className="zones-body mx-auto"
            style={{ maxWidth: "620px", fontSize: "15px", lineHeight: "1.8" }}
          >
            From grand open-air courts to intimate lounges and golden-hour
            pavilions, each Zalina setting is shaped around a different kind of
            celebration.
          </p>
        </motion.div>

        {/* Venue Cards — 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {WEDDING_VENUES.map((venue, index) => {
            const isActive = activeVenue === venue.id;
            return (
              <motion.div
                key={venue.id}
                initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <article
                  className="group relative rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    background: "var(--zones-surface-alt)",
                    border: isActive
                      ? "1px solid rgba(200,155,82,0.4)"
                      : "1px solid var(--zones-border)",
                    boxShadow: isActive
                      ? "0 0 42px rgba(200,155,82,0.09), 0 20px 60px rgba(0,0,0,0.4)"
                      : "0 12px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Image */}
                  <button
                    type="button"
                    onClick={() => handleVenueClick(venue.id)}
                    className="relative block w-full h-[210px] sm:h-[250px] lg:h-[280px] overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--zones-gold)]"
                    aria-pressed={isActive}
                    aria-label={`Select ${venue.title}`}
                  >
                    <Image
                      src={venue.image}
                      alt={`${venue.title} — ${venue.mood}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      aria-hidden="true"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 40%, rgba(17,21,28,0.8) 100%)",
                      }}
                    />
                    {/* Zone number badge */}
                    <div
                      className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{
                        background: "rgba(200,155,82,0.15)",
                        border: "1px solid rgba(200,155,82,0.4)",
                        color: "var(--zones-gold)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {venue.number}
                    </div>
                  </button>

                  {/* Content */}
                  <div className="p-6 md:p-7">
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
                        fontWeight: 500,
                        color: "var(--zones-text-light)",
                      }}
                    >
                      {venue.title}
                    </h3>
                    <p
                      className="zones-body mb-4"
                      style={{ lineHeight: "1.7" }}
                    >
                      {venue.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-col gap-1.5 mb-5">
                      {[
                        { label: "Capacity", value: venue.capacity },
                        { label: "Mood", value: venue.mood },
                        { label: "Best for", value: venue.bestFor },
                      ].map((meta) => (
                        <div key={meta.label} className="flex items-baseline gap-1.5 min-w-0">
                          <span
                            className="text-[10px] uppercase tracking-wider font-medium"
                            style={{ color: "var(--zones-gold)" }}
                          >
                            {meta.label}:
                          </span>
                          <span
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--zones-text-muted)" }}
                          >
                            {meta.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href="/zones"
                      className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-surface)]"
                      style={{ height: "36px", paddingInline: "20px" }}
                    >
                      Explore This Setting
                    </Link>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
