import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EventCheckout } from "@/components/events/EventCheckout";
import { EventsUnavailable } from "@/components/events/EventsCatalog";
import { LuxuryFooter } from "@/sections/home";
import { getBookableEvent } from "@/lib/events/api";
import { positiveInt } from "@/lib/events/checkout";
import { safeEventSlug } from "@/lib/events/domain";
import { localeFromParams } from "@/lib/i18n/metadata";

type Props = {
  params: { locale: string; slug: string };
  searchParams?: {
    occurrence_id?: string | string[];
    package_id?: string | string[];
    quantity?: string | string[];
  };
};
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Event Booking | Zalina Arabian Village",
    robots: { index: false, follow: false },
  };
}

function param(value: string | string[] | undefined): number | null {
  return positiveInt(typeof value === "string" ? value : null);
}

export default async function BookEventRoute({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  if (!safeEventSlug(params.slug)) notFound();
  const locale = localeFromParams(params.locale);
  const result = await getBookableEvent(params.slug, locale);
  if (result.state === "not_found") notFound();

  return (
    <>
      {result.state === "ready" ? (
        <EventCheckout
          event={result.event}
          locale={locale}
          isDemo={result.isDemo}
          occurrenceId={param(searchParams?.occurrence_id)}
          packageId={param(searchParams?.package_id)}
          quantity={param(searchParams?.quantity)}
        />
      ) : <EventsUnavailable />}
      <LuxuryFooter />
    </>
  );
}
