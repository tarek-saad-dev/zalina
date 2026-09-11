"use client";

import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 550;
const MAX_VISIBLE_MS = 2200;

export function InitialPageLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const hide = () => {
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      hideTimer = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => setVisible(false), 380);
      }, wait);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    const fallbackTimer = setTimeout(hide, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", hide);
      clearTimeout(fallbackTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] transition-opacity duration-[380ms] ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.5em] text-[#D4AF37]/70">
          Luxor · Egypt
        </div>

        <div
          className="mt-4 text-[clamp(42px,8vw,76px)] font-light tracking-[0.12em] text-[#F8F5ED]"
          style={{ fontFamily: "var(--font-display, 'Cormorant Garamond', serif)" }}
        >
          ZALINA
        </div>

        <div className="mt-7 h-px w-36 overflow-hidden bg-white/10">
          <div className="h-full w-1/2 animate-[zalina-loader_1.1s_ease-in-out_infinite] bg-[#D4AF37]" />
        </div>

        <div className="mt-4 text-[9px] uppercase tracking-[0.34em] text-white/40">
          Arabian Village
        </div>
      </div>

      <style jsx>{`
        @keyframes zalina-loader {
          0% {
            transform: translateX(-110%);
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(210%);
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div :global(.animate-\[zalina-loader_1\.1s_ease-in-out_infinite\]) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
