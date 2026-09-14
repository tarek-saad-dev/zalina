"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { motionConfig } from "@/lib/motion/motionConfig";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

interface NavItem {
  key: "home" | "about" | "experiences" | "zones" | "weddings" | "gallery";
  href: "/" | "/about" | "/experiences" | "/zones" | "/weddings" | "/gallery";
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "experiences", href: "/experiences" },
  { key: "zones", href: "/zones" },
  {
    key: "weddings",
    href: "/weddings",
    comingSoon: !FEATURE_FLAGS.WEDDINGS_ACTIVE,
  },
  { key: "gallery", href: "/gallery" },
];

/** Desktop height; mobile uses --zalina-nav-height via CSS. */
const NAV_HEIGHT = "var(--zalina-nav-height, 80px)";

export function LuxuryNavbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
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

  const switchLocale = (next: AppLocale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  const duration = reduceMotion ? 0 : motionConfig.duration.fast;
  const uiFont =
    locale === "ar"
      ? "var(--font-body-ar), 'Alexandria', sans-serif"
      : "var(--font-body)";

  return (
    <>
      <header
        className="zalina-navbar fixed top-0 left-0 right-0 z-[9999]"
        style={{
          height: NAV_HEIGHT,
          background: isScrolled
            ? "rgba(10, 9, 8, 0.58)"
            : "rgba(5, 5, 5, 0.06)",
          borderBottom: isScrolled
            ? "1px solid rgba(201, 163, 92, 0.14)"
            : "1px solid transparent",
          backdropFilter: isScrolled
            ? "blur(14px) saturate(140%)"
            : "blur(6px) saturate(120%)",
          WebkitBackdropFilter: isScrolled
            ? "blur(14px) saturate(140%)"
            : "blur(6px) saturate(120%)",
          boxShadow: isScrolled ? "0 8px 28px rgba(0,0,0,0.18)" : "none",
          transition:
            "background 420ms ease, border-color 420ms ease, box-shadow 420ms ease, backdrop-filter 420ms ease",
        }}
      >
        <div className="zalina-container h-full flex items-center justify-between gap-6">
          <Link
            href="/"
            className="relative flex-shrink-0 flex items-center"
            aria-label={t("homeAria")}
          >
            <Image
              src="/assets/zalina-logo-full.png"
              alt={t("logoAlt")}
              width={180}
              height={56}
              priority
              className="h-14 w-auto object-contain"
              style={{ height: 56, width: "auto" }}
            />
          </Link>

          <nav
            className="hidden lg:flex items-center"
            style={{ gap: "2.35rem" }}
            aria-label={t("primaryAria")}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              const label = t(`items.${item.key}`);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="zalina-nav-link relative py-1 transition-colors duration-300"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 400,
                    letterSpacing: locale === "ar" ? "0.01em" : "0.04em",
                    color: active
                      ? "var(--zalina-text)"
                      : "rgba(246, 240, 232, 0.58)",
                    fontFamily: uiFont,
                  }}
                >
                  {label}
                  {item.comingSoon && (
                    <span className="zalina-nav-soon">{tCommon("comingSoon")}</span>
                  )}
                  {active && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        bottom: -2,
                        width: 16,
                        height: 1,
                        background: "var(--zalina-gold)",
                        opacity: 0.75,
                      }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2.5" role="group" aria-label="Language">
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className="transition-colors duration-300"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color:
                    locale === "en"
                      ? "var(--zalina-text)"
                      : "rgba(246, 240, 232, 0.38)",
                  fontFamily: uiFont,
                }}
                aria-pressed={locale === "en"}
              >
                {tCommon("langEn")}
              </button>
              <span style={{ color: "rgba(246, 240, 232, 0.2)" }}>/</span>
              <button
                type="button"
                onClick={() => switchLocale("ar")}
                className="transition-colors duration-300"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color:
                    locale === "ar"
                      ? "var(--zalina-text)"
                      : "rgba(246, 240, 232, 0.38)",
                  fontFamily: uiFont,
                }}
                aria-pressed={locale === "ar"}
              >
                {tCommon("langAr")}
              </button>
            </div>
            <Link href="/book-now" className="zalina-nav-cta">
              {t("cta")}
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
            aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
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
            aria-label={t("menuAria")}
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
              <nav className="flex flex-col gap-6" aria-label={t("mobileAria")}>
                {navItems.map((item, index) => {
                  const active = isActive(item.href);
                  const label = t(`items.${item.key}`);
                  return (
                    <motion.div
                      key={item.key}
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
                        {label}
                        {item.comingSoon && (
                          <span className="zalina-nav-soon">
                            {tCommon("comingSoon")}
                          </span>
                        )}
                        {active && (
                          <span
                            className="absolute -bottom-1 left-0 rtl:left-auto rtl:right-0"
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
                  onClick={() => switchLocale("en")}
                  className="transition-colors duration-300"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color:
                      locale === "en"
                        ? "var(--zalina-text)"
                        : "rgba(246, 240, 232, 0.45)",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-pressed={locale === "en"}
                >
                  {tCommon("langEn")}
                </button>
                <span style={{ color: "rgba(246, 240, 232, 0.25)" }}>/</span>
                <button
                  type="button"
                  onClick={() => switchLocale("ar")}
                  className="transition-colors duration-300"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color:
                      locale === "ar"
                        ? "var(--zalina-text)"
                        : "rgba(246, 240, 232, 0.45)",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-pressed={locale === "ar"}
                >
                  {tCommon("langAr")}
                </button>
              </div>

              <Link
                href="/book-now"
                onClick={() => setIsMobileMenuOpen(false)}
                className="zalina-btn zalina-btn-primary mt-10 w-full sm:w-auto sm:self-start"
                style={{ minHeight: 52 }}
              >
                {t("cta")}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
