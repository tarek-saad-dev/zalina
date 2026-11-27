import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ApiError } from "@/lib/api/types";
import { getEventEdition, getEventPreview } from "@/lib/api/events";
import { isEventLanding } from "@/lib/api/event-runtime";
import { EventLanding } from "@/components/events/EventLanding";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };

export default async function EventPage({ params, searchParams }: { params: { locale: string; slug: string }; searchParams: { preview_token?: string | string[] } }) {
  setRequestLocale(params.locale);
  try {
    const isPreview = Object.prototype.hasOwnProperty.call(searchParams, "preview_token");
    const token = searchParams.preview_token;
    if (isPreview && (typeof token !== "string" || !token.trim())) notFound();
    const event = isPreview
      ? await getEventPreview("landing", token as string, params.locale)
      : await getEventEdition(params.slug, params.locale);
    if (!isEventLanding(event) || event.slug !== params.slug || event.availability_state === ("feature_disabled" as string)) notFound();
    if (isPreview && (!("is_preview" in event) || event.is_preview !== true || !("preview_scope" in event) || event.preview_scope !== "landing" || event.purchase_enabled !== false)) notFound();
    return <EventLanding key={`${params.locale}:${event.slug}:${isPreview}`} event={event} locale={params.locale} preview={isPreview} />;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || Boolean(searchParams.preview_token))) notFound();
    throw error;
  }
}
