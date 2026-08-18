"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ComingSoonOverlayProps {
  title?: string;
  subtitle?: string;
  /** "full" = full-page height (for dedicated pages), "section" = inline block */
  variant?: "full" | "section";
}

export function ComingSoonOverlay({
  title = "Weddings",
  subtitle = "Something extraordinary is being crafted for you.",
  variant = "full",
}: ComingSoonOverlayProps) {
  const isFullPage = variant === "full";

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: isFullPage ? "100vh" : "70vh",
        background: "var(--lux-bg, #0A0A0C)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 30% 70%, rgba(212,175,55,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 30%, rgba(180,140,60,0.03) 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle grid / texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Decorative corner accents */}
      <div
        className="absolute top-8 left-8 w-20 h-20 pointer-events-none"
        style={{
          borderTop: "1px solid rgba(212,175,55,0.15)",
          borderLeft: "1px solid rgba(212,175,55,0.15)",
        }}
      />
      <div
        className="absolute bottom-8 right-8 w-20 h-20 pointer-events-none"
        style={{
          borderBottom: "1px solid rgba(212,175,55,0.15)",
          borderRight: "1px solid rgba(212,175,55,0.15)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Ornamental arch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            fill="none"
            className="opacity-50"
          >
            <path
              d="M10 70 L10 35 Q10 5 60 5 Q110 5 110 35 L110 70"
              stroke="rgba(212,175,55,0.6)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M30 70 L30 40 Q30 18 60 18 Q90 18 90 40 L90 70"
              stroke="rgba(212,175,55,0.3)"
              strokeWidth="0.5"
              fill="none"
            />
            <circle
              cx="60"
              cy="5"
              r="3"
              fill="rgba(212,175,55,0.5)"
            />
          </svg>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "11px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.7)",
            marginBottom: "16px",
          }}
        >
          {title}
        </motion.p>

        {/* Coming Soon heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          style={{
            fontFamily: "var(--font-display, serif)",
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 300,
            color: "#F8F2E7",
            lineHeight: 1.1,
            marginBottom: "8px",
          }}
        >
          Coming{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.95), rgba(232,199,102,0.95))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Soon
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="mx-auto my-8"
          style={{
            width: "80px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
            transformOrigin: "center",
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          style={{
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "rgba(248,242,231,0.55)",
            lineHeight: 1.8,
            maxWidth: "440px",
            margin: "0 auto 40px",
          }}
        >
          {subtitle}
        </motion.p>

        {/* Pulsing dot accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex justify-center gap-2 mb-10"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block rounded-full"
              style={{
                width: "4px",
                height: "4px",
                background: "rgba(212,175,55,0.5)",
                animation: `comingSoonPulse 2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </motion.div>

        {/* Back to home */}
        {isFullPage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(248,242,231,0.45)",
                textDecoration: "none",
                padding: "12px 28px",
                border: "1px solid rgba(212,175,55,0.18)",
                borderRadius: "9999px",
                transition: "all 0.3s ease",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
                e.currentTarget.style.color = "rgba(248,242,231,0.75)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)";
                e.currentTarget.style.color = "rgba(248,242,231,0.45)";
              }}
            >
              Return to Home
            </Link>
          </motion.div>
        )}
      </div>

      {/* Keyframe animation for pulsing dots */}
      <style jsx global>{`
        @keyframes comingSoonPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
}
