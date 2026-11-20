"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import { NEUTRAL_MEDIA_FALLBACK, type CatalogMediaCard } from "@/lib/media";
import { getSignaturePanels } from "./signaturePanelsData";

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

/**
 * All-visible editorial portrait wall.
 *
 * Each real CMS experience gets a full-height image panel, with no carousel,
 * autoplay, hidden cards or invented display content. On narrow screens panels
 * wrap into readable rows instead of shrinking into five illegible columns.
 *
 * The original 3D coverflow remains in
 * archive/signature-moments-ui-v1-2026-11-20 and the reusable v1 pattern PR.
 */
export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const items = getSignaturePanels(moments, {
    id: "neutral",
    title: t("fallbackTitle"),
    subtitle: t("fallbackSubtitle"),
    image: NEUTRAL_MEDIA_FALLBACK,
    alt: t("fallbackAlt"),
    href: "/experiences",
  });

  const gridStyle = {
    "--signature-panel-cols": Math.min(5, items.length),
  } as CSSProperties;

  return (
    <section
      className="signature-panels-section relative isolate"
      aria-labelledby="signature-moments-heading"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="signature-panels-container">
        <header className="signature-panels-intro">
          <p className="signature-panels-eyebrow">{t("eyebrow")}</p>
          <h2 id="signature-moments-heading" className="signature-panels-heading">
            {t("title")}
          </h2>
        </header>

        <div className="signature-panels-grid" style={gridStyle} data-panel-count={items.length}>
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={item.href || "/experiences"}
              className="signature-panel"
              aria-label={t("cardAria", { title: item.title })}
            >
              <span className="signature-panel-header">
                <span className="signature-panel-title">{item.title}</span>
                <span className="signature-panel-kicker">{t("eyebrow")}</span>
              </span>

              <span className="signature-panel-image">
                <CmsImage
                  src={item.image}
                  alt={item.alt || item.title}
                  fill
                  sizes="(max-width: 389px) 100vw, (max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
                  className="object-cover"
                  priority={index === 0}
                  fadeIn={false}
                />
                <span className="signature-panel-image-tint" aria-hidden="true" />
              </span>

              <span className="signature-panel-footer">
                <span className="signature-panel-caption">
                  {item.subtitle?.trim() || t("fallbackSubtitle")}
                </span>
                <span className="signature-panel-discover" aria-hidden="true">
                  {t("discover")}
                  <span className="signature-panel-chevron">{isArabic ? "←" : "→"}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
