"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BOOK_NOW_HREF } from "./data";
import { useExpMotion } from "./useExpMotion";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

export function ExclusiveOffer() {
  const { fadeUp, transition } = useExpMotion();

  return (
    <section
      className="exp-section"
      style={{ background: "transparent", paddingTop: 0 }}
      aria-labelledby="exclusive-offer-heading"
    >
      <div className="exp-container">
        <motion.div
          className="relative overflow-hidden rounded-sm"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
          style={{
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            border: "1px solid var(--exp-border)",
          }}
        >
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[240px] sm:min-h-[300px] md:min-h-[400px]">
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt="Guests enjoying the Sunset and Dine package at golden hour"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 55%, rgba(42,24,18,0.28) 100%)",
                }}
                aria-hidden="true"
              />
            </div>

            <div
              className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-9 md:p-11 lg:p-12"
              style={{
                background:
                  "linear-gradient(145deg, #c9a46a 0%, #a67c3d 45%, #8a6230 100%)",
              }}
            >
              <div
                className="exp-pattern absolute inset-0 opacity-50"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(248,243,232,0.2) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em]"
                  style={{ color: "rgba(26,18,8,0.68)" }}
                >
                  Exclusive Offer
                </p>

                <h2
                  id="exclusive-offer-heading"
                  className="mb-3 text-[1.75rem] leading-tight sm:mb-4 sm:text-3xl md:text-4xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#1a1208",
                    fontWeight: 500,
                  }}
                >
                  Sunset & Dine Package
                </h2>

                <p
                  className="mb-7 max-w-md text-sm leading-relaxed sm:mb-8 sm:text-[0.9375rem]"
                  style={{ color: "rgba(26,18,8,0.78)" }}
                >
                  Experience the magic of golden hour followed by an intimate
                  dinner beneath the stars.
                </p>

                <Link
                  href={BOOK_NOW_HREF}
                  className="inline-flex min-h-11 items-center justify-center px-6 text-xs font-semibold uppercase tracking-[0.12em] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1208] sm:min-h-12 sm:px-7"
                  style={{
                    background: "#1a1208",
                    color: "#e8c66a",
                    borderRadius: "2px",
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
