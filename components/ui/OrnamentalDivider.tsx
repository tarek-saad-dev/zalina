"use client";

import { cn } from "@/lib/utils";

interface OrnamentalDividerProps {
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "gold" | "subtle";
}

export function OrnamentalDivider({
  className,
  size = "medium",
  variant = "default",
}: OrnamentalDividerProps) {
  const sizeClasses = {
    small: "w-16",
    medium: "w-24",
    large: "w-32",
  };

  const variantClasses = {
    default: "border-accent-gold/40",
    gold: "border-accent-gold",
    subtle: "border-border-subtle",
  };

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <div
        className={cn(
          "h-px bg-gradient-to-r from-transparent via-border-gold-soft to-transparent",
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          "w-2 h-2 rotate-45 border",
          variantClasses[variant]
        )}
      />
      <div
        className={cn(
          "h-px bg-gradient-to-r from-transparent via-border-gold-soft to-transparent",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function OrnamentalLine({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent",
        animated && "animate-pulse",
        className
      )}
    />
  );
}
