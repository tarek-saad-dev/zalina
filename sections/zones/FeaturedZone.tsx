"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Sparkles, Heart } from "lucide-react";

const features = [
  { icon: Star, text: "Capacity for up to 300 guests" },
  { icon: Sparkles, text: "Premium catering services" },
  { icon: Heart, text: "Dedicated event coordination" },
];

export function FeaturedZone() {
  return (
    <section className="zones-section" style={{ background: "var(--zones-surface)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            Premium Venue
          </span>
          <h2 className="zones-section-title">Featured Zone Spotlight</h2>
        </div>

        {/* Large Showcase Card */}
        <div
          className="flex flex-col lg:flex-row overflow-hidden zones-hover-lift zones-shadow-luxury"
          style={{
            height: "480px",
            background: "var(--zones-surface-alt)",
            borderRadius: "20px",
            border: "1px solid var(--zones-border)",
          }}
        >
          {/* Content - 45% */}
          <div className="flex flex-col justify-center p-8 lg:w-[45%]">
            <h3
              className="text-3xl font-medium mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--zones-text-light)",
              }}
            >
              The Royal Wedding Court
            </h3>
            <p className="zones-body mb-6">
              Our most prestigious venue, designed for the most important day of
              your life. The Royal Wedding Court combines majestic Arabian
              architecture with modern luxury amenities.
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon
                      size={16}
                      style={{ color: "var(--zones-gold)" }}
                      strokeWidth={1.5}
                    />
                    <span className="zones-body">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href="#"
              className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit"
              style={{ height: "40px", paddingInline: "24px" }}
            >
              Book This Venue
            </Link>
          </div>

          {/* Image - 55% */}
          <div className="relative w-full lg:w-[55%] h-[250px] lg:h-full">
            <Image
              src="/assets/Moments to Remember.png"
              alt="Royal Wedding Court venue"
              fill
              className="object-cover zones-img-hover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
