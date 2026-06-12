"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function WeddingShowcase() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "90vh" }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/wedding.png"
          alt="Luxury Wedding Ceremony at Zalina - Ancient Egyptian Heritage Resort by Lagoon at Sunset"
          fill
          className="object-cover"
          quality={100}
        />
      </div>

      {/* Twilight Cinematic Overlay - Warm Gold & Deep Blue */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(10, 8, 20, 0.92) 0%,
              rgba(10, 8, 20, 0.75) 35%,
              rgba(10, 8, 20, 0.4) 60%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Warm Sunset Glow Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 60%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Blue Hour Atmosphere Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(25, 25, 60, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 lux-container h-full min-h-[90vh] flex items-center">
        <div className="max-w-2xl py-20">
          {/* Decorative Ornament - Romantic Wedding Symbol */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <svg
              width="100"
              height="60"
              viewBox="0 0 100 60"
              fill="none"
              className="opacity-70"
            >
              {/* Arch shape inspired by Zalina logo */}
              <path
                d="M10 60 L10 30 Q10 5 50 5 Q90 5 90 30 L90 60"
                stroke="var(--lux-gold)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M25 60 L25 35 Q25 15 50 15 Q75 15 75 35 L75 60"
                stroke="var(--lux-gold)"
                strokeWidth="0.5"
                fill="none"
              />
              {/* Lotus flower symbol at top */}
              <circle cx="50" cy="5" r="4" fill="var(--lux-gold)" fillOpacity="0.5" />
              {/* Base line */}
              <line x1="5" y1="60" x2="95" y2="60" stroke="var(--lux-gold)" strokeWidth="0.5" />
            </svg>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lux-eyebrow mb-6"
          >
            Weddings at Zalina
          </motion.p>

          {/* Main Heading - Emotional & Timeless */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lux-heading-xl mb-6"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            Your Forever
            <br />
            <span style={{ color: "var(--lux-gold)" }}>Starts Here</span>
          </motion.h2>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lux-divider mb-8"
            style={{ transformOrigin: "left" }}
          />

          {/* Description - Luxury Wedding Experience */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lux-body-lg mb-10 max-w-lg"
            style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}
          >
            Exchange vows beneath ancient skies by a tranquil lagoon illuminated 
            by golden lanterns. Where pharaonic heritage meets world-class luxury, 
            creating an unforgettable destination wedding experience.
          </motion.p>

          {/* Premium Wedding Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-5 mb-12"
          >
            {[
              { label: "Lagoon Ceremony", icon: "🌅" },
              { label: "Ancient Egyptian Venue", icon: "🏛️" },
              { label: "Bespoke Planning", icon: "✨" },
              { label: "World-Class Catering", icon: "🥂" },
            ].map((feature) => (
              <span
                key={feature.label}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                style={{ 
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                }}
              >
                <span>{feature.icon}</span>
                <span style={{ fontFamily: "var(--font-display, serif)" }}>
                  {feature.label}
                </span>
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              href="/weddings" 
              className="lux-btn-primary"
              style={{ 
                background: "linear-gradient(135deg, rgba(212,175,55,0.9), rgba(180,140,40,0.9))",
                border: "none",
              }}
            >
              Explore Weddings
            </Link>
            <Link 
              href="/contact" 
              className="lux-btn-secondary"
              style={{ borderColor: "rgba(212,175,55,0.5)" }}
            >
              Request Consultation
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, var(--lux-bg) 100%)",
        }}
      />
    </section>
  );
}
