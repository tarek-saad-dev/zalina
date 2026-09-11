"use client";

import type { ApiLocale } from "@/lib/api";
import {
  getWeddingConciergeHref,
  isWeddingConciergeConfigured,
} from "@/lib/contact/weddingConcierge";

const GOLD = "rgba(212,175,55,0.92)";
const TEXT = "#F8F2E7";
const MUTED = "rgba(248,242,231,0.62)";

interface WeddingConciergeUpsellProps {
  locale: ApiLocale;
}

export function WeddingConciergeUpsell({ locale }: WeddingConciergeUpsellProps) {
  const href = getWeddingConciergeHref();
  const configured = isWeddingConciergeConfigured();

  const title =
    locale === "ar"
      ? "تم تأمين تاريخكم. الآن اجعلوه خاصاً بكم."
      : "Your Date Is Secured. Now Make It Yours.";
  const body =
    locale === "ar"
      ? "يمكن لمنسق حفلات الزفاف في زالينا تخصيص احتفالكم بالزهور الاستثنائية، والتصوير، والفيديو، والترفيه، وتأثيرات الاحتفال، وترقيات الضيافة الفاخرة."
      : "Our Wedding Concierge can now help personalize your celebration with bespoke florals, photography, film, entertainment, celebration effects and premium hospitality upgrades.";
  const cta =
    locale === "ar"
      ? "تحدث إلى منسق حفلات الزفاف"
      : "Speak to Our Wedding Concierge";

  return (
    <aside
      aria-label={title}
      style={{
        marginTop: "8px",
        padding: "22px 20px",
        borderRadius: "16px",
        border: "1px solid rgba(212,175,55,0.28)",
        background:
          "linear-gradient(160deg, rgba(28,22,14,0.92) 0%, rgba(12,9,6,0.96) 100%)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: GOLD,
          marginBottom: "8px",
        }}
      >
        {locale === "ar" ? "الخطوة التالية" : "Next step"}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(20px, 3vw, 26px)",
          fontWeight: 400,
          color: TEXT,
          marginBottom: "10px",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>
        {body}
      </p>
      {configured && href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-flex mt-5 items-center justify-center px-5 py-3 text-[12px] tracking-[0.14em] uppercase"
          style={{
            borderRadius: "999px",
            border: "1px solid rgba(212,175,55,0.55)",
            color: TEXT,
            background: "rgba(212,175,55,0.14)",
          }}
        >
          {cta}
        </a>
      ) : null}
    </aside>
  );
}
