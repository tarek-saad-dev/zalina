"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const bookingOptions = [
  {
    image: "/assets/Moments to Remember.png",
    title: "Wedding Packages",
    description: "Comprehensive wedding planning and execution",
  },
  {
    image: "/assets/Cultural Performances.png",
    title: "Corporate Events",
    description: "Professional business gathering solutions",
  },
  {
    image: "/assets/Starlit.png",
    title: "Private Celebrations",
    description: "Intimate moments for special occasions",
  },
];

export function BookingConnection() {
  return (
    <section className="zones-section" style={{ background: "var(--zones-surface)" }}>
      <div className="zones-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className="zones-label uppercase tracking-widest mb-3 block"
            style={{ color: "var(--zones-gold)" }}
          >
            Get Started
          </span>
          <h2 className="zones-section-title">Booking Connection</h2>
        </div>

        {/* 3 Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {bookingOptions.map((option, index) => (
            <div
              key={option.title}
              className="flex flex-col overflow-hidden zones-hover-lift"
              style={{
                width: "320px",
                height: "260px",
                background: "var(--zones-surface-alt)",
                border: "1px solid var(--zones-border)",
                borderRadius: "16px",
              }}
            >
              {/* Image Top */}
              <div className="relative w-full h-[140px] overflow-hidden">
                <Image
                  src={option.image}
                  alt={option.title}
                  fill
                  className="object-cover zones-img-hover"
                />
              </div>

              {/* Content Bottom */}
              <div className="flex flex-col justify-center p-5 flex-1">
                <h3 className="zones-card-title mb-2">{option.title}</h3>
                <p className="zones-body mb-4">{option.description}</p>
                <Link
                  href="#"
                  className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center text-sm font-medium w-fit"
                  style={{ height: "32px", paddingInline: "16px" }}
                >
                  Inquire
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
