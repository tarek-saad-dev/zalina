"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Zones", href: "/zones" },
  { label: "Weddings", href: "/weddings" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function LuxuryNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "AR">("EN");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out"
        style={{
          height: "80px",
          background: isScrolled
            ? "rgba(20,20,22,0.15)"
            : "rgba(20,20,22,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: isScrolled ? "blur(24px) saturate(200%)" : "blur(20px) saturate(180%)",
          WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(200%)" : "blur(20px) saturate(180%)",
        }}
      >
        {/* Blue Glow Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(52,120,255,0.18) 0%, transparent 70%)",
            height: "2px",
          }}
        />

        {/* Container */}
        <div
          className="h-full mx-auto flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            paddingInline: "40px",
          }}
        >
          {/* Logo Left */}
          <Link
            href="/"
            className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
          >
            {/* <span
              className="text-2xl font-medium tracking-wider"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #F7E6C7 0%, #D8B27B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Zalina
            </span> */}
            <img src="/assets/zalina-logo-full.png" alt="Zalina" className="h-30" />
          </Link>

          {/* Navigation Center */}
          <nav className="hidden lg:flex items-center" style={{ gap: "38px" }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative transition-colors duration-300 ease-out"
                  style={{
                    fontSize: "15px",
                    fontWeight: 400,
                    color: active
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.78)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                    }
                  }}
                >
                  {item.label}
                  {/* Active Gold Underline */}
                  {active && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                      style={{
                        width: "28px",
                        height: "2px",
                        background:
                          "linear-gradient(90deg, #E3C18D, #F6E8C5)",
                        borderRadius: "1px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Language + CTA */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Language Switch */}


            {/* Book Now Button */}
            <Link
              href="/book-now"
              className="inline-flex items-center justify-center font-medium transition-all duration-300"
              style={{
                height: "48px",
                paddingInline: "30px",
                borderRadius: "999px",
                border: "1px solid rgba(230,196,144,0.45)",
                background: "rgba(255,255,255,0.03)",
                color: "#F2E6D4",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                boxShadow:
                  "0 0 25px rgba(224,188,120,0.18), 0 0 60px rgba(224,188,120,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 0 35px rgba(224,188,120,0.28), 0 0 80px rgba(224,188,120,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 0 25px rgba(224,188,120,0.18), 0 0 60px rgba(224,188,120,0.08)";
              }}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 transition-colors duration-300"
            style={{ color: "rgba(255,255,255,0.78)" }}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[9998] transition-all duration-500 ${isMobileMenuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,22,0.98) 0%, rgba(14,14,18,0.98) 100%)",
          backdropFilter: "blur(20px)",
          top: "80px",
        }}
      >
        <div
          className={`flex flex-col items-center justify-center h-full px-8 transition-all duration-500 ${isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
            }`}
        >
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col items-center gap-8 mb-12">
            {navItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative transition-all duration-300"
                  style={{
                    fontSize: "24px",
                    fontWeight: 400,
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.78)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.05em",
                    transitionDelay: isMobileMenuOpen ? `${index * 75}ms` : "0ms",
                  }}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                      style={{
                        width: "40px",
                        height: "2px",
                        background:
                          "linear-gradient(90deg, #E3C18D, #F6E8C5)",
                        borderRadius: "1px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Language Switch */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setLanguage("EN")}
              className="transition-colors duration-300"
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: language === "EN" ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-body)",
              }}
            >
              EN
            </button>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <button
              onClick={() => setLanguage("AR")}
              className="transition-colors duration-300"
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: language === "AR" ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-body)",
              }}
            >
              AR
            </button>
          </div>

          {/* Mobile Book Now Button */}
          <Link
            href="/book-now"
            className="inline-flex items-center justify-center font-medium transition-all duration-300"
            style={{
              height: "56px",
              paddingInline: "40px",
              borderRadius: "999px",
              border: "1px solid rgba(230,196,144,0.45)",
              background: "rgba(255,255,255,0.03)",
              color: "#F2E6D4",
              fontSize: "16px",
              fontFamily: "var(--font-body)",
              boxShadow:
                "0 0 25px rgba(224,188,120,0.18), 0 0 60px rgba(224,188,120,0.08)",
            }}
          >
            Book Now
          </Link>
        </div>
      </div>

    </>
  );
}
