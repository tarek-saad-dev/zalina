"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getValidZoneId } from "./zones.data";
import type { Zone } from "./zones.data";

interface MainZonesProps {
  zones: Zone[];
}

export function MainZones({ zones }: MainZonesProps) {
  const prefersReduced = useReducedMotion();
  const [activeZone, setActiveZone] = useState<string>(zones[0]?.id ?? "");

  const handleZoneClick = (id: string) => {
    setActiveZone(getValidZoneId(id, zones));
  };

  if (zones.length === 0) {
    return (
      <section
        className="zones-section relative overflow-hidden"
        style={{ background: "var(--zones-bg)" }}
        id="main-zones"
      >
        <div className="zones-container relative z-10 text-center py-20">
          <p className="zones-body">Zones are temporarily unavailable. Please try again shortly.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-bg)" }}
      id="main-zones"
      aria-labelledby="main-zones-title"
    >
      <div className="zones-container relative z-10">
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
            SIGNATURE SPACES
          </span>
          <h2
            id="main-zones-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Main Zones
          </h2>
        </motion.div>

        <div className="flex flex-col gap-10 md:gap-14">
          {zones.map((zone, index) => {
            const isReversed = index % 2 === 1;
            const isActive = activeZone === zone.id;

            return (
              <motion.div
                key={zone.id}
                className="relative"
                initial={!prefersReduced ? { opacity: 0, y: 50 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
              >
                <div
                  className="absolute -inset-4 rounded-3xl pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(200,155,82,0.05) 0%, transparent 70%)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleZoneClick(zone.id)}
                  className="w-full text-left group relative rounded-2xl overflow-hidden transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11151c]"
                  style={{
                    background: "var(--zones-surface)",
                    border: isActive
                      ? "1px solid rgba(200,155,82,0.45)"
                      : "1px solid var(--zones-border)",
                    boxShadow: isActive
                      ? "0 0 40px rgba(200,155,82,0.12), 0 20px 60px rgba(0,0,0,0.4)"
                      : "0 12px 40px rgba(0,0,0,0.3)",
                  }}
                  aria-pressed={isActive}
                >
                  <div
                    className={`flex flex-col ${
                      isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    }`}
                  >
                    <div className="relative w-full lg:w-[55%] h-[220px] sm:h-[260px] lg:h-[340px] overflow-hidden">
                      <Image
                        src={zone.image}
                        alt={`${zone.title} — ${zone.mood}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 55vw"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{
                          background: isReversed
                            ? "linear-gradient(270deg, rgba(23,27,35,0.5) 0%, transparent 55%)"
                            : "linear-gradient(90deg, rgba(23,27,35,0.5) 0%, transparent 55%)",
                        }}
                      />
                      <div
                        className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{
                          background: "rgba(200,155,82,0.15)",
                          border: "1px solid rgba(200,155,82,0.4)",
                          color: "var(--zones-gold)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 md:p-10 lg:w-[45%]">
                      <h3
                        className="mb-3"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
                          fontWeight: 500,
                          color: "var(--zones-text-light)",
                        }}
                      >
                        {zone.title}
                      </h3>
                      <p
                        className="zones-body mb-5"
                        style={{ lineHeight: "1.75" }}
                      >
                        {zone.description}
                      </p>

                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] uppercase tracking-wider font-medium"
                            style={{ color: "var(--zones-gold)" }}
                          >
                            Best for:
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--zones-text-muted)" }}
                          >
                            {zone.bestFor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] uppercase tracking-wider font-medium"
                            style={{ color: "var(--zones-gold)" }}
                          >
                            Mood:
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--zones-text-muted)" }}
                          >
                            {zone.mood}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/book-now"
                        onClick={(e) => e.stopPropagation()}
                        className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                        style={{ height: "36px", paddingInline: "20px" }}
                      >
                        {zone.isBookableOnline ? "Book Now" : "Inquire Now"}
                      </Link>
                    </div>
                  </div>
                </button>

                {index < zones.length - 1 && (
                  <div
                    className="mx-auto mt-10 md:mt-14"
                    aria-hidden="true"
                    style={{
                      width: "120px",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, var(--zones-gold), transparent)",
                      opacity: 0.3,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
