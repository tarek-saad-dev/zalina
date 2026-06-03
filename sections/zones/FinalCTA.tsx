"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="zones-section-md" style={{ background: "var(--zones-bg)" }}>
      <div className="zones-container">
        <div
          className="relative overflow-hidden zones-radius-xl flex flex-col items-center justify-center text-center p-8"
          style={{
            height: "320px",
            background: "var(--zones-surface)",
            border: "1px solid var(--zones-border)",
          }}
        >
          {/* Luxury Background Texture */}
          <div className="absolute inset-0">
            <Image
              src="/images/cta-texture.jpg"
              alt=""
              fill
              className="object-cover opacity-30"
            />
            {/* Dark Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(17,21,28,0.7) 0%, rgba(17,21,28,0.9) 100%)",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10" style={{ maxWidth: "600px" }}>
            <span
              className="zones-label uppercase tracking-widest mb-4 block"
              style={{ color: "var(--zones-gold)" }}
            >
              Begin Your Journey
            </span>

            <h2
              className="text-4xl font-medium mb-6"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--zones-text-light)",
                lineHeight: "48px",
              }}
            >
              Find the Space That
              <br />
              Matches Your Moment
            </h2>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/book"
                className="zones-btn-gold zones-radius-pill flex items-center justify-center text-sm font-medium"
                style={{ height: "44px", paddingInline: "28px" }}
              >
                Book a Consultation
              </Link>
              <Link
                href="/zones"
                className="flex items-center justify-center text-sm font-medium transition-all duration-200 hover:bg-white/10"
                style={{
                  height: "44px",
                  paddingInline: "28px",
                  background: "transparent",
                  color: "var(--zones-text-light)",
                  borderRadius: "999px",
                  border: "1px solid var(--zones-border)",
                }}
              >
                View All Zones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
