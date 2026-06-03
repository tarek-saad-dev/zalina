"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Zones", href: "/zones" },
  { label: "Experiences", href: "/experiences" },
  { label: "Weddings", href: "/weddings" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <nav
        className="zones-container zones-glass zones-radius-lg h-[72px] flex items-center justify-between px-6"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl tracking-wider"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--zones-gold)",
            fontWeight: 500,
          }}
        >
          Zalina
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="zones-nav transition-colors duration-200 hover:text-[var(--zones-text-light)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/book"
            className="zones-btn-gold zones-radius-pill flex items-center justify-center text-sm font-medium"
            style={{ height: "40px", paddingInline: "22px" }}
          >
            Book Now
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 transition-colors duration-200"
            style={{ color: "var(--zones-text-secondary)" }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="lg:hidden zones-container mt-2 py-4 px-6 zones-glass zones-radius-lg"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="zones-nav py-2 transition-colors duration-200 hover:text-[var(--zones-text-light)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
