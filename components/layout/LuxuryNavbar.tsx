"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { motionConfig } from "@/lib/motion/motionConfig";

interface NavItem {
  label: string;
  href: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Zones", href: "/zones" },
  {
    label: "Weddings",
    href: "/weddings",
    comingSoon: !FEATURE_FLAGS.WEDDINGS_ACTIVE,
  },
  { label: "Gallery", href: "/gallery" },
];

/** Desktop height; mobile uses --zalina-nav-height (72px) via CSS. */
const NAV_HEIGHT = "var(--zalina-nav-height, 80px)";

export function LuxuryNavbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "AR">("EN");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const duration = reduceMotion ? 0 : motionConfig.duration.fast;

  return (
    <>
      <header
        className="zalina-navbar fixed top-0 left-0 right-0 z-[9999]"
        style={{
          height: NAV_HEIGHT,
          background: isScrolled
            ? "rgba(10, 9, 8, 0.72)"
            : "rgba(5, 5, 5, 0.12)",
          borderBottom: isScrolled
            ? "1px solid var(--zalina-border)"
            : "1px solid rgba(246, 240, 232, 0.06)",
          backdropFilter: isScrolled
            ? "blur(18px) saturate(160%)"
            : "blur(10px) saturate(140%)",
          WebkitBackdropFilter: isScrolled
            ? "blur(18px) saturate(160%)"
            : "blur(10px) saturate(140%)",
          boxShadow: isScrolled ? "0 12px 40px rgba(0,0,0,0.28)" : "none",
          transition:
            "background 420ms ease, border-color 420ms ease, box-shadow 420ms ease, backdrop-filter 420ms ease",
        }}
      >
        <div className="zalina-container h-full flex items-center justify-between gap-4">
          <Link
            href="/"
            className="relative flex-shrink-0 flex items-center"
            aria-label="Zalina Arabian Village home"
          >
            <Image
              src="/assets/zalina-logo-full.png"
              alt="Zalina Arabian Village"
              width={180}
              height={56}
              priority
              className="h-14 w-auto object-contain"
              style={{ height: 56, width: "auto" }}
            />
          </Link>

          <nav
            className="hidden lg:flex items-center"
            style={{ gap: "1.75rem" }}
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="zalina-nav-link relative py-1 transition-colors duration-300"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    color: active
                      ? "var(--zalina-text)"
                      : "rgba(246, 240, 232, 0.72)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.label}
                  {item.comingSoon && (
                    <span className="zalina-nav-soon">Soon</span>
                  )}
                  {active && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        bottom: -2,
                        width: 22,
                        height: 1,
                        background: "var(--zalina-gold)",
                        opacity: 0.9,
                      }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/book-now" className="zalina-nav-cta">
              Book Now
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="lg:hidden inline-flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              color: "var(--zalina-text)",
              marginInlineEnd: -6,
            }}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="zalina-mobile-menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="zalina-mobile-menu"
            key="mobile-menu"
            className="lg:hidden fixed inset-0 z-[9998] flex flex-col"
            style={{
              top: NAV_HEIGHT,
              background: "var(--zalina-surface)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <motion.div
              className="zalina-container flex flex-1 flex-col justify-center py-10"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
              transition={{
                duration: reduceMotion ? 0 : motionConfig.duration.normal,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <nav className="flex flex-col gap-6" aria-label="Mobile">
                {navItems.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : 0.04 + index * 0.05,
                        duration: reduceMotion ? 0 : motionConfig.duration.normal,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="relative inline-flex items-baseline gap-3"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1.625rem, 6vw, 2rem)",
                          lineHeight: 1.15,
                          color: active
                            ? "var(--zalina-text)"
                            : "rgba(246, 240, 232, 0.78)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item.label}
                        {item.comingSoon && (
                          <span className="zalina-nav-soon">Soon</span>
                        )}
                        {active && (
                          <span
                            className="absolute -bottom-1 left-0"
                            style={{
                              width: 36,
                              height: 1,
                              background: "var(--zalina-gold)",
                            }}
                            aria-hidden
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-12 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage("EN")}
                  className="transition-colors duration-300"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color:
                      language === "EN"
                        ? "var(--zalina-text)"
                        : "rgba(246, 240, 232, 0.45)",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-pressed={language === "EN"}
                >
                  EN
                </button>
                <span style={{ color: "rgba(246, 240, 232, 0.25)" }}>/</span>
                <button
                  type="button"
                  onClick={() => setLanguage("AR")}
                  className="transition-colors duration-300"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color:
                      language === "AR"
                        ? "var(--zalina-text)"
                        : "rgba(246, 240, 232, 0.45)",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-pressed={language === "AR"}
                >
                  AR
                </button>
              </div>

              <Link
                href="/book-now"
                onClick={() => setIsMobileMenuOpen(false)}
                className="zalina-btn zalina-btn-primary mt-10 w-full sm:w-auto sm:self-start"
                style={{ minHeight: 52 }}
              >
                Book Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
