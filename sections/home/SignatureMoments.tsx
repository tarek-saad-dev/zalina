"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import {
  NEUTRAL_MEDIA_FALLBACK,
  type CatalogMediaCard,
} from "@/lib/media";
import { selectSignatureMomentCards } from "./signatureMomentsLayout";

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

/**
 * Editorial gallery rather than an automatically moving carousel:
 * - no off-screen or half-clipped cards, including in RTL
 * - captions never compete with detailed photography
 * - every card is fully readable, keyboard-accessible, and links to the catalog
 * - existing CMS media and copy remain the source of truth
 */
export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const isArabic = useLocale() === "ar";
  const Arrow = isArabic ? ArrowLeft : ArrowRight;
  const titleFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const bodyFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";

  const items = selectSignatureMomentCards(moments, {
    id: "neutral",
    title: t("fallbackTitle"),
    subtitle: t("fallbackSubtitle"),
    image: NEUTRAL_MEDIA_FALLBACK,
    alt: t("fallbackAlt"),
  });
  const featured = items[0];
  const remaining = items.slice(1);

  return (
    <section
      className="lux-section-compact relative isolate overflow-hidden"
      aria-labelledby="signature-moments-heading"
      style={{ background: "var(--lux-surface)" }}
    >
      <div className="lux-container">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <p className="lux-eyebrow mb-3">{t("eyebrow")}</p>
            <h2
              id="signature-moments-heading"
              className="lux-heading-lg"
              style={{ fontSize: isArabic ? "clamp(1.8rem,3vw,2.7rem)" : "clamp(2rem,3.6vw,3.25rem)" }}
            >
              {t("title")}
            </h2>
            <p
              className="mt-4 max-w-[530px] text-[13px] leading-[1.9] sm:text-[15px]"
              style={{ fontFamily: bodyFont, color: "rgba(246,240,232,0.65)" }}
            >
              {t("intro")}
            </p>
          </div>
          <Link
            href="/experiences"
            className="hidden shrink-0 items-center gap-3 rounded-full border px-5 py-3 text-[13px] font-medium transition-colors hover:border-[#C9A35C] hover:bg-[#C9A35C]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BC7D] md:inline-flex"
            style={{ color: "#E7D1A0", borderColor: "rgba(201,163,92,0.35)", fontFamily: bodyFont }}
          >
            {t("exploreAll")}
            <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className={remaining.length
          ? "grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-5"
          : "mx-auto max-w-[820px]"
        }>
          <Link
            href="/experiences"
            aria-label={t("cardAria", { title: featured.title })}
            className="group block min-w-0 rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BC7D]"
          >
            <article
              className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border transition-colors duration-300 group-hover:border-[rgba(217,185,108,0.58)] lg:min-h-[636px]"
              style={{
                borderColor: "rgba(201,163,92,0.2)",
                background: "#16130F",
                boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
              }}
            >
              <div className="relative h-[235px] w-full overflow-hidden sm:h-[310px] lg:h-[402px]">
                <CmsImage
                  src={featured.image}
                  alt={featured.alt || featured.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  priority
                  fadeIn={false}
                />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: "linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.2))",
                }} />
                <div
                  className="absolute start-5 top-5 flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold tracking-[0.12em] sm:start-6 sm:top-6"
                  style={{
                    background: "rgba(12,10,8,0.72)",
                    color: "#E9D5A7",
                    borderColor: "rgba(233,213,167,0.24)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Sparkles size={13} aria-hidden />
                  {t("feature")}
                </div>
              </div>

              <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
                <span className="mb-2 text-[11px] font-semibold tracking-[0.18em]" style={{ color: "#C9A35C" }}>
                  01 <span className="mx-1 opacity-50">/</span> {String(items.length).padStart(2, "0")}
                </span>
                <h3
                  className="text-[clamp(1.5rem,3vw,2rem)] leading-[1.45]"
                  style={{ fontFamily: titleFont, color: "#F7F1E8", fontWeight: isArabic ? 600 : 400 }}
                >
                  {featured.title}
                </h3>
                {featured.subtitle?.trim() && (
                  <p
                    className="mt-2 line-clamp-2 text-[13px] leading-[1.8] sm:text-sm"
                    style={{ fontFamily: bodyFont, color: "rgba(247,241,232,0.7)" }}
                  >
                    {featured.subtitle}
                  </p>
                )}
                <span
                  className="mt-auto inline-flex items-center gap-2.5 pt-5 text-[13px] font-semibold transition-colors group-hover:text-[#F3D9A5]"
                  style={{ fontFamily: bodyFont, color: "#D9BA76" }}
                >
                  {t("discover")} <Arrow size={16} aria-hidden="true" />
                </span>
              </div>
            </article>
          </Link>

          {remaining.length > 0 && (
            <div className="flex min-w-0 flex-col gap-4 lg:h-full lg:gap-5">
              {remaining.map((moment, index) => (
                <Link
                  key={moment.id}
                  href="/experiences"
                  aria-label={t("cardAria", { title: moment.title })}
                  className="group block min-w-0 flex-1 rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BC7D]"
                >
                  <article
                    className="flex h-full min-h-[166px] min-w-0 overflow-hidden rounded-[18px] border transition-colors duration-300 group-hover:border-[rgba(217,185,108,0.58)] sm:min-h-[185px]"
                    style={{
                      borderColor: "rgba(201,163,92,0.19)",
                      background: "#16130F",
                    }}
                  >
                    <div className="relative w-[36%] shrink-0 overflow-hidden sm:w-[39%] lg:w-[37%]">
                      <CmsImage
                        src={moment.image}
                        alt={moment.alt || moment.title}
                        fill
                        sizes="(max-width: 767px) 36vw, (max-width: 1023px) 40vw, 230px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        fadeIn={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-black/10" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
                      <span className="mb-1.5 text-[10px] font-semibold tracking-[0.14em]" style={{ color: "#C9A35C" }}>
                        {String(index + 2).padStart(2, "0")} <span className="mx-1 opacity-50">/</span> {String(items.length).padStart(2, "0")}
                      </span>
                      <h3
                        className="line-clamp-2 text-[clamp(1rem,1.5vw,1.35rem)] leading-[1.5]"
                        style={{ fontFamily: titleFont, color: "#F7F1E8", fontWeight: isArabic ? 600 : 400 }}
                      >
                        {moment.title}
                      </h3>
                      {moment.subtitle?.trim() && (
                        <p
                          className="mt-1.5 line-clamp-2 text-[12px] leading-[1.65] sm:text-[13px]"
                          style={{ fontFamily: bodyFont, color: "rgba(247,241,232,0.61)" }}
                        >
                          {moment.subtitle}
                        </p>
                      )}
                      <span
                        className="mt-auto inline-flex items-center gap-2 pt-2 text-[12px] font-semibold"
                        style={{ fontFamily: bodyFont, color: "#D9BA76" }}
                      >
                        {t("discover")} <Arrow size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-center md:hidden">
          <Link
            href="/experiences"
            className="inline-flex min-h-[48px] items-center gap-3 rounded-full border px-6 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BC7D]"
            style={{ color: "#E9D5A7", borderColor: "rgba(201,163,92,0.42)", fontFamily: bodyFont }}
          >
            {t("exploreAll")} <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
