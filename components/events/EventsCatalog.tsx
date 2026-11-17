"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import {
  formattedEventDate,
  formattedEventMoney,
  localized,
  type EventLocale,
  type EventSummary,
} from "@/lib/events/domain";

const copy = {
  en: {
    eyebrow: "SEASONAL MOMENTS",
    title: "Gather for something extraordinary.",
    subtitle: "Curated celebrations, exclusive evenings and unforgettable experiences at Zalina.",
    all: "All events", available: "Bookable", coming: "Coming soon",
    empty: "No events match this selection.",
    explore: "Discover the event",
    from: "From",
    preview: "DEVELOPMENT PREVIEW — FICTIONAL CONTENT",
    statuses: { open: "Reservations open", upcoming: "Coming soon", sold_out: "Sold out", closed: "Booking closed", cancelled: "Cancelled" },
  },
  ar: {
    eyebrow: "لحظات استثنائية",
    title: "احتفلوا بلحظات لا تُنسى.",
    subtitle: "مناسبات مختارة وأمسيات مميزة وتجارب فريدة في زالينا.",
    all: "كل المناسبات", available: "الحجز متاح", coming: "قريبًا",
    empty: "لا توجد مناسبات مطابقة لهذا الاختيار.",
    explore: "اكتشف المناسبة",
    from: "تبدأ من",
    preview: "معاينة تطوير — محتوى تجريبي غير حقيقي",
    statuses: { open: "الحجز متاح", upcoming: "قريبًا", sold_out: "اكتمل العدد", closed: "الحجز مغلق", cancelled: "أُلغيت المناسبة" },
  },
} as const;

type Filter = "all" | "open" | "upcoming";

function Cover({ url, alt }: { url: string | null; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#241d13] via-[#0e0c0a] to-[#050505]">
      {url ? (
        // CMS media hosts are outside next/image allowlist until agreed with Laravel.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.035]" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Sparkles aria-hidden="true" className="h-12 w-12 text-[#C9A35C]/40" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505]/75 to-transparent" />
    </div>
  );
}

export function EventsCatalog({ events, isDemo }: { events: EventSummary[]; isDemo: boolean }) {
  const locale = (useLocale() === "ar" ? "ar" : "en") as EventLocale;
  const t = copy[locale];
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => events.filter((event) => (
    filter === "all" || event.booking_status === filter
  )), [events, filter]);

  return (
    <main className="min-h-screen bg-[#050505] text-[#F6F0E8]">
      <section className="relative overflow-hidden border-b border-[#C9A35C]/15 bg-[#0A0908] pb-16 pt-40 sm:pb-20 sm:pt-48">
        <div className="pointer-events-none absolute end-[-12%] top-[4%] h-[380px] w-[380px] rounded-full bg-[#C9A35C]/[0.06] blur-[110px]" />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#C9A35C]">{t.eyebrow}</span>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,5.2rem)] font-normal leading-[1.08]">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.85] text-[#C4BEB6]">{t.subtitle}</p>
          {isDemo ? (
            <p className="mt-6 inline-flex border border-amber-600/50 bg-amber-900/20 px-3 py-2 text-xs font-semibold text-[#E1BE82]">
              {t.preview}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div role="group" aria-label={locale === "ar" ? "تصفية المناسبات" : "Filter events"} className="mb-10 flex flex-wrap items-center gap-2 border-b border-[#C9A35C]/15 pb-6">
          {(["all", "open", "upcoming"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`min-h-[44px] rounded-sm border px-5 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A35C] ${filter === value
                ? "border-[#C9A35C] bg-[#C9A35C] text-[#050505]"
                : "border-[#C9A35C]/25 text-[#F6F0E8]/80 hover:border-[#C9A35C]"}`}
            >
              {value === "all" ? t.all : value === "open" ? t.available : t.coming}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <CalendarDays className="mx-auto mb-5 h-10 w-10 text-[#C9A35C]/60" aria-hidden="true" />
            <p className="text-lg text-[#C4BEB6]">{t.empty}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group block overflow-hidden rounded-sm border border-[#C9A35C]/20 bg-[#0A0908] transition-colors duration-300 hover:border-[#C9A35C]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A35C]"
              >
                <Cover url={event.cover_image_url} alt={localized(event, "title", locale)} />
                <div className="p-6 sm:p-7">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9A35C]">{t.statuses[event.booking_status]}</span>
                  <h2 className="mt-3 text-[clamp(1.6rem,2.3vw,2.2rem)] leading-tight text-[#F6F0E8]">
                    {localized(event, "title", locale)}
                  </h2>
                  <p className="mt-3 line-clamp-2 min-h-[50px] text-sm leading-[1.8] text-[#C4BEB6]">
                    {localized(event, "summary", locale)}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-[#C4BEB6]">
                    <CalendarDays size={15} className="text-[#C9A35C]" aria-hidden="true" />
                    <time dateTime={event.starts_at || undefined}>{formattedEventDate(event.starts_at, locale)}</time>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#C9A35C]/15 pt-5">
                    <div>
                      {event.starting_price !== null ? (
                        <>
                          <p className="text-[11px] text-[#C4BEB6]">{t.from}</p>
                          <p className="text-xl font-medium text-[#E1BE82]">{formattedEventMoney(event.starting_price, event.currency, locale)}</p>
                        </>
                      ) : null}
                    </div>
                    <span className="inline-flex min-h-[40px] items-center gap-2 text-xs font-medium text-[#C9A35C]">
                      {t.explore} <ArrowUpRight aria-hidden="true" size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function EventsUnavailable() {
  const locale = (useLocale() === "ar" ? "ar" : "en") as EventLocale;
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#050505] px-6 pt-32 text-center text-[#F6F0E8]">
      <CalendarDays size={46} className="mb-6 text-[#C9A35C]" aria-hidden="true" />
      <h1 className="text-[clamp(2rem,5vw,3.5rem)]">
        {locale === "ar" ? "المناسبات غير متاحة مؤقتًا" : "Events are temporarily unavailable"}
      </h1>
      <p className="mt-4 max-w-lg text-[#C4BEB6]">
        {locale === "ar"
          ? "تعذر تحميل المناسبات الآن. من فضلك جرّب لاحقًا."
          : "We could not load the event catalogue. Please check back shortly."}
      </p>
      <Link href="/experiences" className="mt-8 inline-flex min-h-[48px] items-center border border-[#C9A35C] px-6 text-sm text-[#E1BE82]">
        {locale === "ar" ? "استكشف التجارب" : "Explore experiences"}
      </Link>
    </main>
  );
}
