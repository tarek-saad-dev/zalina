"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function LuxuryHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "var(--lux-bg)" }}
    >
      {/* Layer 1: Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
      >
        <Image
          src="/assets/zalina-hero-bg.png"
          alt="Luxury Arabian Village at Night"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </motion.div>

      {/* Layer 2: Dark Cinematic Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(5, 5, 5, 0.4) 0%, 
              rgba(5, 5, 5, 0.2) 40%, 
              rgba(5, 5, 5, 0.3) 70%, 
              rgba(5, 5, 5, 0.95) 100%
            )
          `,
        }}
      />

      {/* Layer 3: Arabian Illustration Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.03 }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px]"
          fill="none"
          stroke="var(--lux-gold)"
          strokeWidth="0.5"
        >
          <circle cx="200" cy="200" r="180" />
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="120" />
          <path d="M200 20 L200 380 M20 200 L380 200" />
          <path d="M60 60 L340 340 M340 60 L60 340" />
          <path d="M200 50 Q250 100 200 150 Q150 100 200 50" />
          <path d="M200 250 Q250 300 200 350 Q150 300 200 250" />
          <path d="M50 200 Q100 250 150 200 Q100 150 50 200" />
          <path d="M250 200 Q300 250 350 200 Q300 150 250 200" />
        </svg>
      </div>

      {/* Layer 4: Palm Silhouettes */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30vh] pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              transparent 0%, 
              rgba(5, 5, 5, 0.8) 100%
            )
          `,
        }}
      />

      {/* Layer 5: Hero Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        style={{ opacity }}
      >
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lux-eyebrow mb-8"
          >
            Midnight Arabian Luxury
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lux-display mb-8"
          >
            Timeless Heritage.
            <br />
            <span className="lux-shimmer">Unforgettable Moments.</span>
          </motion.h1>

          {/* Luxury Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="lux-divider mx-auto mb-8"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="lux-body-lg max-w-xl mx-auto mb-12"
          >
            An immersive Arabian sanctuary where ancient traditions meet
            contemporary luxury. Experience the magic of desert nights and
            timeless hospitality.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/book" className="lux-btn-primary">
              Book Your Escape
            </Link>
            <Link href="/experiences" className="lux-btn-secondary">
              Explore Experiences
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="lux-eyebrow text-[10px]">Discover</span>
            <div className="lux-divider-vertical h-10" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
