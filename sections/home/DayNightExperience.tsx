"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
const DAY_IMAGE = "/assets/day-experience.png";
const NIGHT_IMAGE = "/assets/night-experience.png";

export function DayNightExperience() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div className="flex flex-col lg:flex-row" style={{ height: "auto" }}>
        {/* Day Experience - Left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative w-full lg:w-1/2 h-[420px] lg:h-[500px] group"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={DAY_IMAGE}
              alt="Day Experience at Zalina"
              fill
              className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
          </div>

          {/* Warm Day Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  135deg,
                  rgba(201, 163, 92, 0.1) 0%,
                  rgba(5, 5, 5, 0.4) 50%,
                  rgba(5, 5, 5, 0.8) 100%
                )
              `,
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-10">
            <div className="max-w-md">
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-3"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(201, 163, 92, 0.2)",
                    border: "1px solid var(--lux-gold)",
                  }}
                >
                  <Sun size={20} style={{ color: "var(--lux-gold)" }} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lux-heading-lg mb-3"
                style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
              >
                Day Experience
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lux-body mb-5"
                style={{ fontSize: "0.9rem" }}
              >
                Bask in the golden warmth of Arabian sunshine. From serene
                morning rituals to leisurely afternoon gatherings.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link href="/experiences/day" className="lux-btn-secondary">
                  Explore Day
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div
            className="hidden lg:block absolute top-1/4 bottom-1/4 right-0 w-px"
            style={{
              background: "linear-gradient(180deg, transparent, var(--lux-gold), transparent)",
            }}
          />
        </motion.div>

        {/* Night Experience - Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full lg:w-1/2 h-[420px] lg:h-[500px] group"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={NIGHT_IMAGE}
              alt="Night Experience at Zalina"
              fill
              className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
          </div>

          {/* Cool Night Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  225deg,
                  rgba(30, 40, 80, 0.2) 0%,
                  rgba(5, 5, 5, 0.5) 50%,
                  rgba(5, 5, 5, 0.85) 100%
                )
              `,
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-10">
            <div className="max-w-md">
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-3"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(201, 163, 92, 0.2)",
                    border: "1px solid var(--lux-gold)",
                  }}
                >
                  <Moon size={20} style={{ color: "var(--lux-gold)" }} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="lux-heading-lg mb-3"
                style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
              >
                Night Experience
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="lux-body mb-5"
                style={{ fontSize: "0.9rem" }}
              >
                As stars emerge over the desert sky, the village transforms
                into an enchanting realm of pure magic.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link href="/experiences/night" className="lux-btn-primary">
                  Explore Night
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
