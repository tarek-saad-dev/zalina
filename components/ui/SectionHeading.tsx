"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  showDivider?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  description,
  align = "center",
  className,
  showDivider = true,
}: SectionHeadingProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("max-w-3xl", alignClasses[align], className)}>
      {subtitle && (
        <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-accent-gold mb-4">
          {subtitle}
        </span>
      )}
      
      {showDivider && (
        <div className="ornamental-divider mb-6">
          <div className="ornamental-divider-center" />
        </div>
      )}
      
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-tight leading-tight">
        {title}
      </h2>
      
      {description && (
        <p className="mt-6 text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
