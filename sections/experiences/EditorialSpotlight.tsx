"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Sparkles, Heart } from "lucide-react";

const highlights = [
  { icon: Star, text: "Award-winning culinary team" },
  { icon: Sparkles, text: "Bespoke atmosphere design" },
  { icon: Heart, text: "Personalized service excellence" },
];

export function EditorialSpotlight() {
  return (
    <section className="section-spacing-mobile">
      <div className="mobile-container">
        {/* Section Label */}
        <span
          className="text-[10px] tracking-widest uppercase mb-2 block text-center"
          style={{ color: "var(--exp-gold)" }}
        >
          Featured
        </span>
        <h2 className="exp-section-heading text-center mb-6">
          Signature Dinner Experience
        </h2>

        {/* Version 1: Dark Background - Image Left, Content Right */}
        <div
          className="flex gap-4 mb-6 p-4"
          style={{
            background: "var(--exp-bg-card)",
            border: "1px solid var(--exp-border)",
            borderRadius: "16px",
          }}
        >
          {/* Image */}
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{
              width: "150px",
              height: "220px",
              borderRadius: "12px",
            }}
          >
            <Image
              src="/images/exp-spotlight-1.jpg"
              alt="Signature dinner experience"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <h3
              className="text-sm font-semibold mb-2"
              style={{
                color: "var(--exp-text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              An Evening to Remember
            </h3>
            <p
              className="text-[11px] mb-3"
              style={{
                color: "var(--exp-text-secondary)",
                lineHeight: "16px",
              }}
            >
              Indulge in a curated dining experience where every detail speaks of
              luxury and Arabian heritage.
            </p>

            {/* Premium Highlights */}
            <div className="space-y-2 mb-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon
                      size={12}
                      style={{ color: "var(--exp-gold)" }}
                      strokeWidth={1.5}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--exp-text-secondary)" }}
                    >
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="#"
              className="inline-flex items-center justify-center text-[11px] font-medium transition-all duration-200 hover:opacity-90 mt-auto"
              style={{
                height: "32px",
                padding: "0 16px",
                background: "var(--exp-gold)",
                color: "#1A120B",
                borderRadius: "999px",
                width: "fit-content",
              }}
            >
              Reserve Now
            </Link>
          </div>
        </div>

        {/* Version 2: Champagne Card */}
        <div className="flex gap-4">
          {/* Image */}
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{
              width: "150px",
              height: "220px",
              borderRadius: "12px",
            }}
          >
            <Image
              src="/images/exp-spotlight-2.jpg"
              alt="Exclusive dining setting"
              fill
              className="object-cover"
            />
          </div>

          {/* Champagne Content Card */}
          <div
            className="flex flex-col justify-center p-5"
            style={{
              background: "#E5D1AD",
              borderRadius: "12px",
              flex: 1,
            }}
          >
            <span
              className="text-[10px] tracking-wider uppercase mb-2"
              style={{ color: "rgba(26, 18, 11, 0.7)" }}
            >
              Exclusive Offer
            </span>
            <h3
              className="text-sm font-semibold mb-2"
              style={{
                color: "#1A120B",
                fontFamily: "var(--font-display)",
              }}
            >
              Sunset & Dine Package
            </h3>
            <p
              className="text-[11px] mb-4"
              style={{
                color: "rgba(26, 18, 11, 0.8)",
                lineHeight: "16px",
              }}
            >
              Experience the magic of golden hour followed by an intimate dinner
              under the stars.
            </p>
            <Link
              href="#"
              className="inline-flex items-center justify-center text-[11px] font-medium transition-all duration-200 hover:bg-[#1A120B]/10 mt-auto"
              style={{
                height: "32px",
                padding: "0 16px",
                background: "#1A120B",
                color: "#E5D1AD",
                borderRadius: "999px",
                width: "fit-content",
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
