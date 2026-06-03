"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Experiences", href: "/experiences" },
  { label: "Dining", href: "/dining" },
  { label: "Stay", href: "/stay" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export function Footer() {
  return (
    <footer
      className="py-10"
      style={{
        background: "var(--exp-bg-primary)",
        borderTop: "1px solid var(--exp-border)",
      }}
    >
      <div className="mobile-container">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-xl tracking-wider"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--exp-gold)",
              fontWeight: 500,
            }}
          >
            Zalina
          </Link>
          <p
            className="text-[10px] mt-1"
            style={{ color: "var(--exp-text-secondary)" }}
          >
            A Village for the Soul
          </p>
        </div>

        {/* Links Grid */}
        <nav className="flex flex-wrap justify-center gap-4 mb-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[10px] transition-colors duration-200 hover:text-[var(--exp-gold)]"
              style={{ color: "var(--exp-text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contact Information */}
        <div className="text-center mb-6">
          <p
            className="text-[10px] mb-1"
            style={{ color: "var(--exp-text-secondary)" }}
          >
            reservations@zalina.com
          </p>
          <p
            className="text-[10px]"
            style={{ color: "var(--exp-text-secondary)" }}
          >
            +971 4 123 4567
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-4 mb-6">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--exp-gold)]/10"
                style={{
                  border: "1px solid var(--exp-border)",
                }}
              >
                <Icon
                  size={14}
                  style={{ color: "var(--exp-gold)" }}
                  strokeWidth={1.5}
                />
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div
          className="w-full h-[1px] mb-4"
          style={{ background: "var(--exp-border)" }}
        />

        {/* Bottom Row */}
        <div className="flex flex-col items-center gap-3">
          {/* Language Switch */}
          <button
            className="text-[10px] flex items-center gap-1 transition-colors duration-200 hover:text-[var(--exp-gold)]"
            style={{ color: "var(--exp-text-secondary)" }}
          >
            <span>EN</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ opacity: 0.5 }}>AR</span>
          </button>

          {/* Copyright */}
          <p
            className="text-[9px]"
            style={{ color: "rgba(184, 163, 138, 0.5)" }}
          >
            © 2024 Zalina Arabian Village
          </p>
        </div>
      </div>
    </footer>
  );
}
