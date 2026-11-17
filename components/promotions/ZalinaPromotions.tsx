"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions/api";
import {
  localCampaignHref,
  selectCampaign,
  type PromotionCampaign,
  type PromotionLocale,
} from "@/lib/promotions/domain";

const DISMISS_PREFIX = "zalina.promotion.dismissed.";
const NAV_OFFSET = "calc(var(--zalina-nav-height, 80px) + env(safe-area-inset-top, 0px))";

function copyFor(campaign: PromotionCampaign, locale: PromotionLocale) {
  return locale === "ar"
    ? {
        title: campaign.title_ar,
        description: campaign.description_ar,
        eyebrow: campaign.eyebrow_ar,
        cta: campaign.cta_label_ar,
      }
    : {
        title: campaign.title_en,
        description: campaign.description_en,
        eyebrow: campaign.eyebrow_en,
        cta: campaign.cta_label_en,
      };
}

function isPersistentlyDismissed(id: string): boolean {
  try {
    const deadline = Number(window.localStorage.getItem(DISMISS_PREFIX + id));
    return Number.isFinite(deadline) && deadline > Date.now();
  } catch {
    return false;
  }
}

function CampaignTopBar({
  campaign,
  locale,
  onClose,
}: {
  campaign: PromotionCampaign;
  locale: PromotionLocale;
  onClose: () => void;
}) {
  const copy = copyFor(campaign, locale);
  const href = localCampaignHref(campaign.cta_href, locale);
  if (!href) return null;
  return (
    <>
      <div aria-hidden="true" className="h-[76px] sm:h-[56px]" />
      <aside
        aria-label={locale === "ar" ? "إعلان زالينا" : "Zalina announcement"}
        className="fixed inset-x-0 z-[9997] border-b border-[#C9A35C]/30 bg-[#15110D]/95 text-[#F6F0E8] shadow-[0_8px_26px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        style={{ top: NAV_OFFSET }}
      >
        <div className="mx-auto flex min-h-[76px] max-w-[1280px] flex-col items-center justify-center gap-1.5 px-12 py-2 sm:min-h-[56px] sm:flex-row sm:gap-5 sm:py-1">
          <div className="min-w-0 text-center sm:text-start">
            <p className="truncate text-[12px] font-medium text-[#F6F0E8] sm:text-[13px]">
              {copy.eyebrow ? (
                <span className="me-2 text-[#C9A35C]">{copy.eyebrow}</span>
              ) : null}
              {copy.title}
            </p>
          </div>
          <a
            href={href}
            className="inline-flex min-h-[32px] flex-shrink-0 items-center justify-center gap-1.5 border-b border-[#C9A35C] px-1 text-[11px] font-semibold tracking-wide text-[#E1BE82] transition-colors hover:text-[#F6F0E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A35C]"
          >
            {copy.cta}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "ar" ? "إغلاق الإعلان" : "Dismiss announcement"}
            className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[#C4BEB6] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A35C] sm:end-4"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}

function CampaignFloatingCard({
  campaign,
  locale,
  onClose,
}: {
  campaign: PromotionCampaign;
  locale: PromotionLocale;
  onClose: () => void;
}) {
  const copy = copyFor(campaign, locale);
  const href = localCampaignHref(campaign.cta_href, locale);
  if (!href) return null;
  return (
    <aside
      aria-label={locale === "ar" ? "عرض خاص من زالينا" : "Zalina featured event"}
      className="fixed end-4 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-sm border border-[#C9A35C]/35 bg-[#0A0908]/95 p-3 text-[#F6F0E8] shadow-[0_24px_65px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:end-6 sm:p-4"
      style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={locale === "ar" ? "إغلاق العرض" : "Dismiss offer"}
        className="absolute end-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-sm bg-[#050505]/80 text-[#C4BEB6] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A35C]"
      >
        <X size={17} aria-hidden="true" />
      </button>
      <div className="flex gap-3">
        {campaign.image_url ? (
          // CMS images can be on a storage host outside the Next image allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image_url}
            alt=""
            width={100}
            height={132}
            loading="lazy"
            className="hidden h-[132px] w-[100px] flex-shrink-0 rounded-sm object-cover sm:block"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 pt-1">
          <div className="pe-7">
            {copy.eyebrow ? (
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[#C9A35C]">
                {copy.eyebrow}
              </p>
            ) : null}
            <h2 className="text-[20px] font-normal leading-tight text-[#F6F0E8] sm:text-[22px]">
              {copy.title}
            </h2>
            {copy.description ? (
              <p className="mt-1.5 hidden line-clamp-2 text-xs leading-relaxed text-[#C4BEB6] sm:block">
                {copy.description}
              </p>
            ) : null}
          </div>
          <a
            href={href}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[2px] bg-[#C9A35C] px-3 py-2 text-center text-xs font-semibold text-[#050505] transition-colors hover:bg-[#E1BE82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1BE82]"
          >
            {copy.cta}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  );
}

/** Campaign chrome is owned by the locale layout, not individual marketing pages. */
export function ZalinaPromotions() {
  const locale = (useLocale() === "ar" ? "ar" : "en") as PromotionLocale;
  const pathname = usePathname() || "/";
  const routeKey = `${locale}:${pathname}`;
  const [feed, setFeed] = useState<{ key: string; campaigns: PromotionCampaign[] }>({
    key: "",
    campaigns: [],
  });
  const campaigns = feed.key === routeKey ? feed.campaigns : [];
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [clock, setClock] = useState(0);
  const [visibleFloatingId, setVisibleFloatingId] = useState<string | null>(null);
  const [scrolledIntoContent, setScrolledIntoContent] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await getActivePromotions(locale, pathname);
      if (!mounted) return;
      setDismissed((current) => {
        const next = new Set(current);
        result.forEach((campaign) => {
          if (isPersistentlyDismissed(campaign.id)) next.add(campaign.id);
        });
        return next;
      });
      setFeed({ key: `${locale}:${pathname}`, campaigns: result });
    };
    void load();
    // An admin switching a campaign off is reflected on already-open pages.
    const refresh = window.setInterval(() => { void load(); }, 30_000);
    return () => {
      mounted = false;
      window.clearInterval(refresh);
    };
  }, [locale, pathname]);

  const topBar = useMemo(
    () => selectCampaign(campaigns, "top_bar", dismissed, clock || Date.now()),
    [campaigns, dismissed, clock]
  );

  // No intrusive floating card on sensitive booking / payment / recovery flows.
  const inCheckout =
    /^\/events\/[^/]+\/book(?:\/|$)/.test(pathname) ||
    pathname.startsWith("/book-now") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment");

  // Event details and checkout contain conversion-critical controls. A floating
  // overlay must not obscure their price, package or payment CTA.
  const inEventDetail = /^\/events\/[^/]+$/.test(pathname);
  const floating = useMemo(
    () => (inCheckout || inEventDetail ? null : selectCampaign(campaigns, "floating_card", dismissed, clock || Date.now())),
    [campaigns, dismissed, clock, inCheckout, inEventDetail]
  );

  useEffect(() => {
    const checkPosition = () => {
      const threshold = Math.max(240, Math.round(window.innerHeight * 0.55));
      setScrolledIntoContent(window.scrollY >= threshold);
    };
    setScrolledIntoContent(false);
    checkPosition();
    window.addEventListener("scroll", checkPosition, { passive: true });
    return () => window.removeEventListener("scroll", checkPosition);
  }, [pathname]);

  const floatingId = floating?.id ?? null;
  const floatingDelay = floating?.display_delay_seconds ?? 0;
  useEffect(() => {
    setVisibleFloatingId(null);
    if (!floatingId) return;
    const timeout = window.setTimeout(
      () => setVisibleFloatingId(floatingId),
      floatingDelay * 1000
    );
    return () => window.clearTimeout(timeout);
  }, [floatingId, floatingDelay]);

  const dismiss = (campaign: PromotionCampaign) => {
    if (campaign.dismiss_for_hours > 0) {
      try {
        window.localStorage.setItem(
          DISMISS_PREFIX + campaign.id,
          String(Date.now() + campaign.dismiss_for_hours * 60 * 60 * 1000)
        );
      } catch {
        // Private browsing / denied storage: current visit still honors dismissal.
      }
    }
    setDismissed((current) => {
      const next = new Set(current);
      next.add(campaign.id);
      return next;
    });
  };

  return (
    <>
      {topBar && !inCheckout ? (
        <CampaignTopBar
          campaign={topBar}
          locale={locale}
          onClose={() => dismiss(topBar)}
        />
      ) : null}
      {floating && scrolledIntoContent && visibleFloatingId === floating.id ? (
        <CampaignFloatingCard
          campaign={floating}
          locale={locale}
          onClose={() => dismiss(floating)}
        />
      ) : null}
    </>
  );
}
