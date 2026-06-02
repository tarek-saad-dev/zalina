"use client";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "small" | "large" | "full";
}

const sizeClasses = {
  small: "max-w-4xl",
  default: "max-w-7xl",
  large: "max-w-[1440px]",
  full: "max-w-none",
};

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
