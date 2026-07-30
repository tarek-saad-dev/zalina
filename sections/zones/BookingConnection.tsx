"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BOOKING_CARDS } from "./zones.data";

export function BookingConnection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section relative overflow-hidden"
      style={{ background: "var(--zones-surface)" }}
      aria-labelledby="booking-connection-title"
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
            GET STARTED
          </span>
          <h2
            id="booking-connection-title"
            className="zones-section-title"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Booking Connection
          </h2>
        </motion.div>

        {/* 3 Cinematic cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BOOKING_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              className="group flex flex-col overflow-hidden rounded-xl transition-all duration-500"
              style={{
                background: "var(--zones-surface-alt)",
                border: "1px solid var(--zones-border)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
              initial={!prefersReduced ? { opacity: 0, y: 30 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={
                !prefersReduced
                  ? {
                      y: -4,
                      boxShadow:
                        "0 0 30px rgba(200,155,82,0.08), 0 20px 50px rgba(0,0,0,0.4)",
                      borderColor: "rgba(200,155,82,0.3)",
                    }
                  : undefined
              }
            >
              {/* Image Top */}
              <div className="relative w-full h-[200px] overflow-hidden">
                <Image
                  src={card.image}
                  alt={`${card.title} at Zalina Arabian Village`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 50%, rgba(29,35,48,0.9) 100%)",
                  }}
                />
              </div>

              {/* Content Bottom */}
              <div className="flex flex-col p-6 flex-1">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "var(--zones-text-light)",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm mb-5 flex-1"
                  style={{
                    color: "var(--zones-text-muted)",
                    lineHeight: "1.6",
                  }}
                >
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                  style={{ height: "36px", paddingInline: "20px" }}
                >
                  {card.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
