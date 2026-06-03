"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-12"
      style={{
        background: "rgba(20, 15, 12, 0.92)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mobile-container h-full">
        <nav className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg tracking-wider"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--exp-gold)",
              fontWeight: 500,
            }}
          >
            Zalina
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {["Experiences", "Dining", "Stay"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs tracking-wide transition-colors duration-200 hover:text-[var(--exp-gold)]"
                style={{ color: "var(--exp-text-secondary)" }}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Book Now Button */}
            <Link
              href="/book"
              className="flex items-center justify-center text-xs font-medium transition-all duration-200"
              style={{
                width: "78px",
                height: "28px",
                background: "var(--exp-gold)",
                color: "#1A120B",
                borderRadius: "999px",
              }}
            >
              Book Now
            </Link>

            {/* Language Switch */}
            <button
              className="p-1.5 transition-colors duration-200 hover:text-[var(--exp-gold)]"
              style={{ color: "var(--exp-text-secondary)" }}
              aria-label="Change language"
            >
              <Globe size={16} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1.5 transition-colors duration-200 hover:text-[var(--exp-gold)]"
              style={{ color: "var(--exp-text-secondary)" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="absolute top-12 left-0 right-0 py-4 px-5 md:hidden"
          style={{
            background: "rgba(20, 15, 12, 0.98)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid var(--exp-border)",
          }}
        >
          <div className="flex flex-col gap-3">
            {["Home", "Experiences", "Dining", "Stay", "Contact"].map(
              (item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="text-sm py-2 transition-colors duration-200 hover:text-[var(--exp-gold)]"
                  style={{ color: "var(--exp-text-secondary)" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
