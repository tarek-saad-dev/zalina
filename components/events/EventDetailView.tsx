import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import {
  formattedEventDate,
  formattedEventMoney,
  localized,
  type EventDetail,
  type EventLocale,
} from "@/lib/events/domain";
import { EventPackageSelector } from "./EventPackageSelector";

const copy = {
  en: {
    all: "All events", special: "ZALINA SPECIAL OCCASIONS",
    date: "Date & time", location: "Venue", from: "Packages from",
    details: "The experience", highlights: "An evening to remember",
    packages: "Explore packages", gallery: "A glimpse of the experience",
    conditions: "Important information",
    preview: "DEVELOPMENT PREVIEW — ALL EVENT CONTENT AND PRICES ARE FICTIONAL",
    statuses: { open: "Reservations now open", upcoming: "Reservations opening soon", sold_out: "Fully booked", closed: "Reservations closed", cancelled: "Event cancelled" },
  },
  ar: {
    all: "كل المناسبات", special: "مناسبات زالينا الخاصة",
    date: "التاريخ والوقت", location: "المكان", from: "تبدأ الباقات من",
    details: "عن المناسبة", highlights: "ليلة لا تُنسى",
    packages: "استكشف الباقات", gallery: "لمحة عن التجربة",
    conditions: "معلومات مهمة",
    preview: "معاينة تطوير — كافة تفاصيل وأسعار المناسبات تجريبية وغير حقيقية",
    statuses: { open: "الحجز متاح الآن", upcoming: "الحجز يفتح قريبًا", sold_out: "اكتمل العدد", closed: "الحجز مغلق", cancelled: "المناسبة ملغاة" },
  },
} as const;

export function EventDetailView({
  event, locale, isDemo,
}: { event: EventDetail; locale: EventLocale; isDemo: boolean }) {
  const t = copy[locale];
  const gallery = event.gallery_urls;
  const highlights = locale === "ar" ? event.highlights_ar : event.highlights_en;
  const terms = localized(event, "terms", locale);
  const title = localized(event, "title", locale);
  return (
    <main className="min-h-screen bg-[#050505] text-[#F6F0E8]">
      <section className="relative min-h-[650px] overflow-hidden bg-[#100d0a] pb-16 pt-36 sm:pb-20 sm:pt-44 lg:min-h-[740px]">
        {event.cover_image_url ? (
          // Explicit CMS URL; remote domain allowlist is defined by backend handoff.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(201,163,92,.17),transparent_60%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-[#050505]/35" />
        <div className="relative mx-auto flex min-h-[470px] max-w-[1280px] flex-col justify-end px-5 sm:px-8 lg:min-h-[510px] lg:px-12">
          <Link href="/events" className="mb-12 inline-flex w-fit min-h-[44px] items-center gap-2 text-xs text-[#F6F0E8]/80 hover:text-[#C9A35C]">
            {locale === "ar" ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowLeft size={17} aria-hidden="true" />}
            {t.all}
          </Link>
          {isDemo ? (
            <span className="mb-6 w-fit border border-[#E1BE82]/50 bg-[#16120D]/85 px-4 py-2 text-[11px] font-semibold text-[#E1BE82]">{t.preview}</span>
          ) : null}
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-[#E1BE82]">{t.special}</p>
          <h1 className="max-w-[850px] text-[clamp(2.8rem,7vw,6rem)] font-normal leading-[1.03] text-[#F6F0E8]">{title}</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-[#F6F0E8]/80">{localized(event, "summary", locale)}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-[36px] items-center border border-[#C9A35C]/50 bg-[#050505]/60 px-4 text-xs text-[#E1BE82]">{t.statuses[event.booking_status]}</span>
            {event.booking_status === "open" ? (
              <a href="#event-packages" className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-[#C9A35C] px-6 text-xs font-semibold text-[#050505] transition-colors hover:bg-[#E1BE82]">
                {t.packages}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-label={locale === "ar" ? "معلومات المناسبة" : "Event information"} className="border-y border-[#C9A35C]/20 bg-[#0A0908]">
        <div className="mx-auto grid max-w-[1280px] gap-7 px-5 py-9 sm:grid-cols-3 sm:px-8 lg:px-12">
          <div className="flex gap-3">
            <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-[#C9A35C]" aria-hidden="true" />
            <div>
              <p className="text-xs uppercase tracking-wide text-[#C4BEB6]">{t.date}</p>
              <p className="mt-2 text-sm text-[#F6F0E8]">{formattedEventDate(event.starts_at, locale)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#C9A35C]" aria-hidden="true" />
            <div>
              <p className="text-xs uppercase tracking-wide text-[#C4BEB6]">{t.location}</p>
              <p className="mt-2 text-sm text-[#F6F0E8]">{localized(event, "venue", locale) || "Zalina Arabian Village"}</p>
            </div>
          </div>
          {event.starting_price !== null ? (
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#C9A35C]" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#C4BEB6]">{t.from}</p>
                <p className="mt-2 text-lg text-[#E1BE82]">{formattedEventMoney(event.starting_price, event.currency, locale)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20 lg:px-12 lg:py-24">
        <article>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#C9A35C]">{t.details}</p>
          <h2 className="text-[clamp(2rem,4vw,3.4rem)]">{title}</h2>
          <p className="mt-6 whitespace-pre-line text-base leading-[1.95] text-[#C4BEB6]">
            {localized(event, "description", locale) || localized(event, "summary", locale)}
          </p>
        </article>
        {highlights.length > 0 ? (
          <aside className="border border-[#C9A35C]/20 bg-[#0A0908] p-7 sm:p-9">
            <h3 className="text-2xl text-[#F6F0E8]">{t.highlights}</h3>
            <ul className="mt-7 space-y-5">
              {highlights.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-[#C4BEB6]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A35C]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </section>

      {gallery.length > 0 ? (
        <section className="mx-auto max-w-[1280px] px-5 pb-10 sm:px-8 lg:px-12">
          <h2 className="mb-7 text-[clamp(1.8rem,3.5vw,2.8rem)]">{t.gallery}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {gallery.slice(0, 6).map((url, index) => (
              <div key={url + index} className="aspect-[4/3] overflow-hidden bg-[#16120d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${title} — ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="border-t border-[#C9A35C]/15">
        <EventPackageSelector event={event} isDemo={isDemo} />
      </div>
      {terms ? (
        <section className="mx-auto max-w-[1280px] border-t border-[#C9A35C]/15 px-5 pb-16 pt-10 sm:px-8 lg:px-12">
          <h2 className="text-xl text-[#E1BE82]">{t.conditions}</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-[1.85] text-[#C4BEB6]">{terms}</p>
        </section>
      ) : null}
    </main>
  );
}
