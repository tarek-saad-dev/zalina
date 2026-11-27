import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isEventAnnouncement } from "@/lib/api/event-runtime";
import { getEventPreview } from "@/lib/api/events";
import { EventAnnouncementView } from "@/components/events/EventAnnouncement";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function Page({ params, searchParams }: { params: { locale: string; scope: string }; searchParams: { preview_token?: string | string[] } }) {
  setRequestLocale(params.locale);
  const token = searchParams.preview_token;
  if ((params.scope !== "card" && params.scope !== "banner") || typeof token !== "string" || !token.trim()) notFound();
  try {
    const result = await getEventPreview(params.scope, token, params.locale);
    if (!result || !isEventAnnouncement(result, true) || !("type" in result) || result.is_preview !== true || result.preview_scope !== params.scope || result.type !== params.scope) notFound();
    return <main className="page-atmosphere min-h-screen event-feature-preview-stage"><EventAnnouncementView announcement={result} locale={params.locale} preview /></main>;
  } catch { notFound(); }
}
