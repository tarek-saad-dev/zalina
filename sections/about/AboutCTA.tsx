"use client";

import React from "react";
import Link from "next/link";

export function AboutCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12">
      <div
        className="relative w-full h-[220px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #CDA25E 0%, #8C5B32 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Subtle Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15L15 0z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
          {/* Heading */}
          <h2
            className="text-3xl lg:text-4xl font-semibold mb-6"
            style={{
              color: "#221816",
              fontFamily: "var(--font-display)",
            }}
          >
            Begin Your Zalina Journey
          </h2>

          {/* CTA Button */}
          <Link
            href="/book"
            className="inline-flex items-center justify-center font-medium text-base transition-all duration-300 hover:shadow-xl"
            style={{
              height: "56px",
              padding: "0 36px",
              borderRadius: "999px",
              background: "#E8D0A6",
              color: "#221816",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            Book Your Experience
          </Link>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/20 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/20 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/20 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/20 rounded-br-lg" />
      </div>
    </section>
  );
}
