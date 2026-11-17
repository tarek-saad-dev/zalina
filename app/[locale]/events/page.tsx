import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LuxuryFooter } from "@/sections/home";
import { EventsCatalog, EventsUnavailable } from "@/components/events/EventsCatalog";
import { listBookableEvents } from "@/lib/events/api";
import { localeFromParams } from "@/lib/i18n/metadata";

type Props = { params: { locale: string } };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeFromParams(params.locale);
  const ar = locale === "ar";
  return {
    title: ar ? "المناسبات الخاصة | زالينا" : "Special Events | Zalina Arabian Village",
    description: ar
      ? "اكتشف المناسبات والأمسيات والباقات الخاصة في زالينا."
      : "Discover special events, seasonal celebrations and curated packages at Zalina.",
    alternates: {
      canonical: `/${locale}/events`,
      languages: { ar: "/ar/events", en: "/en/events" },
    },
    openGraph: { type: "website", locale: ar ? "ar_EG" : "en_US" },
  };
}

export default async function EventsPage({ params }: Props) {
  setRequestLocale(params.locale);
  const locale = localeFromParams(params.locale);
  const result = await listBookableEvents(locale);
  return (
    <>
      {result.state === "ready" ? (
        <EventsCatalog events={result.events} isDemo={result.isDemo} />
      ) : (
        <EventsUnavailable />
      )}
      <LuxuryFooter />
    </>
  );
}
