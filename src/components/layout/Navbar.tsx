"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", active: true },
  { label: "The Village", href: "/village" },
  { label: "Experiences", href: "/experiences" },
  { label: "Occasions", href: "/occasions" },
  { label: "Gallery", href: "/gallery" },
  { label: "Dining", href: "/dining" },
  { label: "Stay", href: "/stay" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isScrolled
        ? "bg-[#0B0B0F]/90 backdrop-blur-xl border-b border-[#D4A95A]/10"
        : "bg-transparent"
        }`}
    >
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <nav className="flex items-center justify-between h-24 lg:h-32">
          {/* Logo - Very large brand lockup, no text */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-[320px] lg:h-[320px] xl:w-[380px] xl:h-[380px]">
              <Image
                src="/images/zalina-logo-full.png"
                alt="Zalina Arabian Village"
                fill
                className="object-contain transition-all duration-500 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation - Elegant spacing */}
          <div className="hidden lg:flex items-center gap-10 xl:gap-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative text-xs tracking-[0.2em] uppercase transition-all duration-300 ${item.active
                  ? "text-[#D4A95A]"
                  : "text-[#F5E9DA]/70 hover:text-[#F5E9DA]"
                  }`}
              >
                {item.label}
                {item.active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#D4A95A]" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button - Refined */}
          <div className="hidden lg:block">
            <Link
              href="/book"
              className="inline-flex items-center px-7 py-3.5 bg-[#D4A95A] text-[#0B0B0F] text-xs font-semibold tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:bg-[#E2BF7A] hover:shadow-[0_0_30px_rgba(212,169,90,0.25)]"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#F5E9DA] hover:text-[#D4A95A] transition-colors duration-300"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#0B0B0F]/98 backdrop-blur-xl border-b border-[#D4A95A]/10 transition-all duration-500 ease-out ${isMobileMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="px-6 sm:px-8 py-10 space-y-6">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-xs tracking-[0.2em] uppercase transition-all duration-300 ${item.active
                ? "text-[#D4A95A]"
                : "text-[#F5E9DA]/80 hover:text-[#F5E9DA] hover:pl-2"
                }`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-6 border-t border-[#D4A95A]/20">
            <Link
              href="/book"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center px-7 py-3.5 bg-[#D4A95A] text-[#0B0B0F] text-xs font-semibold tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:bg-[#E2BF7A]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
