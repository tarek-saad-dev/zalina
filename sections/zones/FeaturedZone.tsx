"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Sparkles, Heart, Crown } from "lucide-react";
import type { Zone } from "./zones.data";

const features = [
  { icon: Star, text: "Signature village atmosphere" },
  { icon: Sparkles, text: "Premium hospitality services" },
  { icon: Heart, text: "Dedicated guest coordination" },
  { icon: Crown, text: "Cinematic day-to-night setting" },
];

interface FeaturedZoneProps {
  zone?: Zone | null;
}

export function FeaturedZone({ zone }: FeaturedZoneProps) {
  const prefersReduced = useReducedMotion();

  if (!zone) return null;

  return (
    <section
      className="relative zones-section overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="featured-zone-title"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(200,155,82,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="zones-container relative z-10">
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
            PREMIUM VENUE
          </span>
          <h2
            id="featured-zone-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Featured Zone Spotlight
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col lg:flex-row items-stretch gap-0 rounded-2xl overflow-hidden"
          style={{
            background: "var(--zones-surface-alt)",
            borderTop: "2px solid rgba(200,155,82,0.35)",
            borderLeft: "1px solid rgba(200,155,82,0.15)",
            borderRight: "1px solid rgba(200,155,82,0.15)",
            borderBottom: "1px solid rgba(200,155,82,0.15)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,155,82,0.08)",
          }}
          initial={!prefersReduced ? { opacity: 0, y: 40 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col justify-center p-8 md:p-12 lg:w-[45%] relative">
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(135deg, rgba(23,27,35,0.95) 0%, rgba(29,35,48,0.9) 100%)",
              }}
            />

            <div className="relative z-10">
              <h3
                className="mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                  fontWeight: 500,
                  color: "var(--zones-text-light)",
                }}
              >
                {zone.title}
              </h3>
              <p className="zones-body mb-7" style={{ lineHeight: "1.8" }}>
                {zone.description}
              </p>

              <div className="space-y-3 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(200,155,82,0.1)",
                          border: "1px solid rgba(200,155,82,0.25)",
                        }}
                      >
                        <Icon
                          size={13}
                          style={{ color: "var(--zones-gold)" }}
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="zones-body text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/book-now"
                className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
                style={{ height: "42px", paddingInline: "26px" }}
              >
                {zone.isBookableOnline ? "Book This Zone" : "Inquire About This Zone"}
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:w-[55%] h-[300px] sm:h-[360px] lg:h-auto lg:min-h-[520px] overflow-hidden group">
            <Image
              src={zone.image}
              alt={`${zone.title} at Zalina Arabian Village`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(270deg, transparent 65%, rgba(29,35,48,0.45) 100%)",
              }}
            />

            <div
              className="absolute bottom-6 right-6 px-5 py-3 rounded-xl"
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
                {zone.mood}
              </span>
              <span
                className="block text-[11px]"
                style={{ color: "var(--zones-text-muted)" }}
              >
                {zone.bestFor}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
