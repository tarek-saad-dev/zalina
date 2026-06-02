"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface SecondaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  size?: "default" | "large";
}

export function SecondaryButton({
  children,
  href,
  onClick,
  className,
  showArrow = false,
  size = "default",
}: SecondaryButtonProps) {
  const sizeClasses = {
    default: "px-8 py-4 text-sm",
    large: "px-10 py-5 text-base",
  };

  const buttonContent = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  const baseClasses = cn(
    "group inline-flex items-center justify-center gap-2 font-medium tracking-wide",
    "bg-transparent text-text-primary border border-border-gold-soft rounded-button",
    "transition-all duration-300 ease-out",
    "hover:border-accent-gold hover:text-accent-gold hover:bg-accent-gold/5",
    "focus:outline-none focus:ring-2 focus:ring-accent-gold/30",
    sizeClasses[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {buttonContent}
    </button>
  );
}
