"use client";

import { motion } from "framer-motion";
import { LUXURY_TAGS } from "./mockData";

export function BookingHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-end"
      style={{
        height: "clamp(280px, 45vh, 520px)",
        background:
          "linear-gradient(160deg, #0a0806 0%, #130e08 40%, #0d0b07 70%, #050403 100%)",
      }}
    >
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 50%, transparent 75%)",
        }}
      />

      {/* Top atmospheric gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "40%",
          background:
            "linear-gradient(180deg, rgba(5,4,3,0.7) 0%, transparent 100%)",
        }}
      />

      {/* Ornamental horizontal line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 50%, transparent 100%)",
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Hero content */}
      <div
        className="relative z-10 pb-10 pt-20 px-6 md:px-12"
        style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}
      >
        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.85)",
            fontWeight: 500,
          }}
        >
          Zalina Arabian Village
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4.5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#F8F2E7",
            letterSpacing: "-0.01em",
            marginBottom: "14px",
          }}
        >
          Book Your Zalina Experience
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(13px, 1.4vw, 16px)",
            color: "rgba(248,242,231,0.60)",
            lineHeight: 1.65,
            maxWidth: "520px",
            marginBottom: "22px",
          }}
        >
          Choose your night, personalize the details, and let the village take
          care of the rest.
        </motion.p>

        {/* Luxury tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.32 }}
          className="flex flex-wrap gap-2"
        >
          {LUXURY_TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.75)",
                border: "1px solid rgba(212,175,55,0.22)",
                borderRadius: "4px",
                padding: "4px 10px",
                background: "rgba(212,175,55,0.05)",
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade into page */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "80px",
          background:
            "linear-gradient(180deg, transparent 0%, #050403 100%)",
        }}
      />
    </section>
  );
}
