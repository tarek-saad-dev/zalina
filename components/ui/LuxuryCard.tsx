"use client";

import { cn } from "@/lib/utils";

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "small" | "medium" | "large";
}

const paddingClasses = {
  none: "",
  small: "p-4",
  medium: "p-6",
  large: "p-8",
};

export function LuxuryCard({
  children,
  className,
  hover = true,
  padding = "medium",
}: LuxuryCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-border-subtle rounded-card overflow-hidden",
        hover && "transition-all duration-500 hover:border-border-gold-soft hover:shadow-premium",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface LuxuryCardImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
}

export function LuxuryCardImage({
  src,
  alt,
  className,
  overlay = false,
}: LuxuryCardImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main/60 via-transparent to-transparent" />
      )}
    </div>
  );
}

interface LuxuryCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function LuxuryCardContent({ children, className }: LuxuryCardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
