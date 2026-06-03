"use client";

import React from "react";
import Image from "next/image";

export function AboutHero() {
  return (
    <section className="relative w-full h-[780px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/about-hero.jpg"
          alt="Zalina Arabian Village - Luxury Desert Hospitality"
          fill
          className="object-cover"
          priority
        />
        {/* Cinematic Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,15,0.15) 0%, rgba(10,10,15,0.75) 100%)",
          }}
        />
        {/* Subtle Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.4) 100%)",
          }}
        />
      </div>

      {/* Gold Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`gold-particle ${i % 3 === 0 ? "gold-particle-lg" : ""}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8">
          <span
            className="text-2xl tracking-[0.3em] uppercase"
            style={{ color: "#D9B073", fontFamily: "var(--font-display)" }}
          >
            Zalina
          </span>
        </div>

        {/* Hero Title */}
        <h1
          className="hero-title-about max-w-4xl mb-6"
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
        >
          More Than A Destination
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg mb-4 tracking-wide"
          style={{ color: "#E7C58E", fontFamily: "var(--font-display)" }}
        >
          A Village for the Soul
        </p>

        {/* Description */}
        <p
          className="body-text-about max-w-2xl"
          style={{ color: "rgba(214, 210, 203, 0.9)" }}
        >
          Where Arabian heritage meets contemporary luxury, creating timeless
          moments of connection and wonder
        </p>
      </div>
    </section>
  );
}
