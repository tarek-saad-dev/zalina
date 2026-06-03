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
          src="/images/wedding-showcase.jpg"
          alt="Luxury Arabian Wedding at Zalina"
          fill
          className="object-cover"
          quality={100}
        />
      </div>

      {/* Cinematic Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(5, 5, 5, 0.9) 0%,
              rgba(5, 5, 5, 0.7) 40%,
              rgba(5, 5, 5, 0.3) 100%
            )
          `,
        }}
      />

      {/* Gold Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(201, 163, 92, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 lux-container h-full min-h-[90vh] flex items-center">
        <div className="max-w-2xl py-24">
          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="opacity-60"
            >
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="var(--lux-gold)"
                strokeWidth="1"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="var(--lux-gold)"
                strokeWidth="0.5"
              />
              <path
                d="M40 10 L40 70 M10 40 L70 40"
                stroke="var(--lux-gold)"
                strokeWidth="0.5"
              />
              <path
                d="M40 25 Q50 35 40 45 Q30 35 40 25"
                fill="var(--lux-gold)"
                fillOpacity="0.3"
              />
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

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lux-heading-xl mb-8"
          >
            Where Forever
            <br />
            <span className="lux-shimmer">Begins</span>
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

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lux-body-lg mb-10 max-w-lg"
          >
            Celebrate your love story in a setting of unparalleled beauty.
            From intimate ceremonies under ancient arches to grand receptions
            beneath the stars, Zalina transforms your wedding dreams into
            timeless reality.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-6 mb-12"
          >
            {["Bespoke Planning", "Exclusive Venues", "Luxury Catering", "Cultural Traditions"].map(
              (feature) => (
                <span
                  key={feature}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--lux-muted)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--lux-gold)" }}
                  />
                  {feature}
                </span>
              )
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/weddings" className="lux-btn-primary">
              Plan Your Wedding
            </Link>
            <Link href="/weddings/gallery" className="lux-btn-secondary">
              View Wedding Gallery
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
