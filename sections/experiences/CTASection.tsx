"use client";

import React from "react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="section-spacing-mobile">
      <div className="mobile-container">
        <div
          className="relative flex flex-col items-center justify-center text-center p-6 overflow-hidden"
          style={{
            height: "220px",
            background:
              "linear-gradient(180deg, rgba(20, 15, 12, 0.98) 0%, rgba(33, 26, 22, 0.98) 100%)",
            borderRadius: "18px",
            border: "1px solid var(--exp-border)",
          }}
        >
          {/* Radial Gold Glow Background */}
          <div
            className="absolute inset-0 radial-gold-glow"
            style={{
              opacity: 0.4,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <span
              className="text-[10px] tracking-widest uppercase mb-3 block"
              style={{ color: "var(--exp-gold)" }}
            >
              Begin Your Journey
            </span>

            <h2
              className="text-lg font-medium mb-4"
              style={{
                color: "var(--exp-text-primary)",
                fontFamily: "var(--font-display)",
                lineHeight: "24px",
              }}
            >
              Choose Your Next
              <br />
              Signature Experience
            </h2>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/book"
                className="flex items-center justify-center text-xs font-medium transition-all duration-200 hover:opacity-90"
                style={{
                  height: "36px",
                  padding: "0 20px",
                  background: "var(--exp-gold)",
                  color: "#1A120B",
                  borderRadius: "999px",
                }}
              >
                Book Now
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-[var(--exp-gold)]/10"
                style={{
                  height: "36px",
                  padding: "0 20px",
                  background: "transparent",
                  color: "var(--exp-text-primary)",
                  borderRadius: "999px",
                  border: "1px solid var(--exp-border)",
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
