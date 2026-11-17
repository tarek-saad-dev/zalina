import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LuxuryFooter } from "@/sections/home";
import { EventDetailView } from "@/components/events/EventDetailView";
import { EventsUnavailable } from "@/components/events/EventsCatalog";
import { getBookableEvent } from "@/lib/events/api";
import { localized, safeEventSlug } from "@/lib/events/domain";
import { localeFromParams } from "@/lib/i18n/metadata";

type Props = { params: { locale: string; slug: string } };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeFromParams(params.locale);
  if (!safeEventSlug(params.slug)) return { robots: { index: false, follow: false } };
  const result = await getBookableEvent(params.slug, locale);
  if (result.state !== "ready") return {
    title: locale === "ar" ? "مناسبات زالينا" : "Zalina Events",
    robots: { index: false, follow: false },
  };
  const event = result.event;
  const title = localized(event, "title", locale);
  const description = localized(event, "summary", locale);
  const pathname = `/events/${event.slug}`;
  return {
    title: `${title} | Zalina Arabian Village`,
    description,
    alternates: {
      canonical: `/${locale}${pathname}`,
      languages: { ar: `/ar${pathname}`, en: `/en${pathname}` },
    },
    robots: result.isDemo ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website", title, description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      images: event.cover_image_url ? [{ url: event.cover_image_url }] : undefined,
    },
  };
}

export default async function EventPage({ params }: Props) {
  setRequestLocale(params.locale);
  if (!safeEventSlug(params.slug)) notFound();
  const locale = localeFromParams(params.locale);
  const result = await getBookableEvent(params.slug, locale);
  if (result.state === "not_found") notFound();
  return (
    <>
      {result.state === "ready" ? (
        <EventDetailView event={result.event} locale={locale} isDemo={result.isDemo} />
      ) : (
        <EventsUnavailable />
      )}
      <LuxuryFooter />
    </>
  );
}
