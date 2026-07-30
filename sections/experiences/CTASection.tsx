"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BOOK_NOW_HREF, CONTACT_HREF } from "./data";
import { useExpMotion } from "./useExpMotion";

export function CTASection() {
  const { fadeUp, transition } = useExpMotion();

  return (
    <section
      className="exp-section relative overflow-hidden"
      style={{
        background: "transparent",
        paddingBottom: "clamp(4.5rem, 8vw, 7.5rem)",
      }}
      aria-labelledby="final-cta-heading"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/assets/Starlit.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.8) 0%, rgba(8,11,18,0.9) 45%, rgba(5,5,5,0.96) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(212,175,55,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="exp-container relative z-10">
        <motion.div
          className="exp-glass exp-pattern relative mx-auto max-w-3xl overflow-hidden rounded-sm px-6 py-12 text-center sm:px-10 sm:py-14 md:px-16 md:py-[4.5rem]"
          style={{
            boxShadow:
              "0 28px 70px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.08)",
            borderColor: "rgba(212,175,55,0.32)",
          }}
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0, 0.9)}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 65%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p className="exp-eyebrow mb-4 sm:mb-5">Begin Your Journey</p>

            <h2
              id="final-cta-heading"
              className="exp-section-heading-lg mb-8 sm:mb-10"
            >
              Choose Your Next Signature Experience
            </h2>

            <div className="flex w-full max-w-xs flex-col items-stretch justify-center gap-2.5 mx-auto sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:gap-3.5">
              <Link href={BOOK_NOW_HREF} className="exp-btn-primary">
                Book Now
              </Link>
              <Link href={CONTACT_HREF} className="exp-btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
