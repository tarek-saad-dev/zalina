"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BOOKING_STEPS } from "./mockData";

interface BookingProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  return (
    <>
      {/* Desktop Stepper */}
      <div
        className="hidden md:block w-full"
        style={{
          background: "rgba(15,11,7,0.95)",
          borderBottom: "1px solid rgba(212,175,55,0.12)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            padding: "0 48px",
            height: "72px",
          }}
        >
          {BOOKING_STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step item */}
                <button
                  onClick={() => isCompleted && onStepClick?.(step.id)}
                  disabled={!isCompleted}
                  className="flex items-center gap-3 group transition-opacity duration-300"
                  style={{
                    cursor: isCompleted ? "pointer" : "default",
                    opacity: isUpcoming ? 0.38 : 1,
                  }}
                  aria-label={`Step ${step.id}: ${step.label}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Circle */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center transition-all duration-400"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: isActive
                        ? "1.5px solid rgba(212,175,55,0.9)"
                        : isCompleted
                        ? "1.5px solid rgba(212,175,55,0.5)"
                        : "1.5px solid rgba(248,242,231,0.18)",
                      background: isActive
                        ? "rgba(212,175,55,0.14)"
                        : isCompleted
                        ? "rgba(212,175,55,0.08)"
                        : "transparent",
                    }}
                  >
                    {isCompleted ? (
                      <Check size={13} color="rgba(212,175,55,0.85)" strokeWidth={2.5} />
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: isActive
                            ? "rgba(212,175,55,0.95)"
                            : "rgba(248,242,231,0.35)",
                        }}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      fontWeight: isActive ? 500 : 400,
                      letterSpacing: "0.06em",
                      color: isActive
                        ? "rgba(212,175,55,0.95)"
                        : isCompleted
                        ? "rgba(248,242,231,0.65)"
                        : "rgba(248,242,231,0.3)",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector line */}
                {index < BOOKING_STEPS.length - 1 && (
                  <div
                    className="flex-1 mx-4"
                    style={{ height: "1px", minWidth: "20px" }}
                  >
                    <div
                      style={{
                        height: "1px",
                        background: isCompleted
                          ? "linear-gradient(90deg, rgba(212,175,55,0.5), rgba(212,175,55,0.2))"
                          : "rgba(248,242,231,0.08)",
                        transition: "background 0.4s ease",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div
        className="md:hidden"
        style={{
          background: "rgba(15,11,7,0.95)",
          borderBottom: "1px solid rgba(212,175,55,0.12)",
          padding: "14px 20px",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.85)",
              fontWeight: 500,
            }}
          >
            Step {currentStep} of {BOOKING_STEPS.length}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "#F8F2E7",
              fontWeight: 500,
            }}
          >
            {BOOKING_STEPS[currentStep - 1]?.label}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "2px",
            background: "rgba(248,242,231,0.08)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${(currentStep / BOOKING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(212,175,55,0.7), rgba(212,175,55,1))",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Mobile step dots */}
        <div className="flex justify-center gap-2 mt-3">
          {BOOKING_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <div
                key={step.id}
                style={{
                  width: isActive ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: isActive
                    ? "rgba(212,175,55,0.9)"
                    : isCompleted
                    ? "rgba(212,175,55,0.45)"
                    : "rgba(248,242,231,0.12)",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
