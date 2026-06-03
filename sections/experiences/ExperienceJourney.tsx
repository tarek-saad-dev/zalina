"use client";

import React from "react";

const steps = [
  { number: "1", title: "Choose", description: "Browse & select" },
  { number: "2", title: "Customize", description: "Personalize details" },
  { number: "3", title: "Add-ons", description: "Enhance experience" },
  { number: "4", title: "Confirm", description: "Secure booking" },
  { number: "5", title: "Enjoy", description: "Live the moment" },
];

export function ExperienceJourney() {
  return (
    <section className="section-spacing-mobile">
      <div className="mobile-container">
        {/* Section Header */}
        <span
          className="text-[10px] tracking-widest uppercase mb-2 block text-center"
          style={{ color: "var(--exp-gold)" }}
        >
          How It Works
        </span>
        <h2 className="exp-section-heading text-center mb-6">
          Experience Journey
        </h2>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div
            className="absolute top-8 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, var(--exp-gold) 0%, var(--exp-gold) 100%)",
              opacity: 0.3,
            }}
          />

          {/* Steps */}
          <div className="flex justify-between items-start relative">
            {steps.map((step, index) => {
              const isActive = index === 0;
              return (
                <div key={index} className="flex flex-col items-center">
                  {/* Card */}
                  <div
                    className="flex flex-col items-center justify-center p-2 mb-2"
                    style={{
                      width: "60px",
                      height: "120px",
                      background: isActive
                        ? "var(--exp-champagne)"
                        : "var(--exp-bg-card)",
                      borderRadius: "10px",
                      border: isActive
                        ? "none"
                        : "1px solid var(--exp-border)",
                    }}
                  >
                    {/* Number */}
                    <span
                      className="text-lg font-semibold mb-1"
                      style={{
                        color: isActive ? "#1A120B" : "var(--exp-gold)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {step.number}
                    </span>

                    {/* Title */}
                    <span
                      className="text-[9px] font-medium text-center mb-1"
                      style={{
                        color: isActive
                          ? "#1A120B"
                          : "var(--exp-text-primary)",
                      }}
                    >
                      {step.title}
                    </span>

                    {/* Description */}
                    <span
                      className="text-[8px] text-center"
                      style={{
                        color: isActive
                          ? "rgba(26, 18, 11, 0.7)"
                          : "var(--exp-text-secondary)",
                        lineHeight: "10px",
                      }}
                    >
                      {step.description}
                    </span>
                  </div>

                  {/* Dot on line */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isActive
                        ? "var(--exp-gold)"
                        : "var(--exp-bg-surface)",
                      border: isActive
                        ? "none"
                        : "1px solid var(--exp-border)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
