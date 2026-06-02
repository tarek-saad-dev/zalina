"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  size?: "default" | "large";
}

export function PrimaryButton({
  children,
  href,
  onClick,
  className,
  showArrow = true,
  size = "default",
}: PrimaryButtonProps) {
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
    "bg-accent-gold text-bg-main rounded-button",
    "transition-all duration-300 ease-out",
    "hover:bg-accent-gold-hover hover:shadow-lg hover:-translate-y-0.5",
    "focus:outline-none focus:ring-2 focus:ring-accent-gold/50",
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
