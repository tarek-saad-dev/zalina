import { notFound } from "next/navigation";
import { getEventPreview } from "@/lib/api/events";
import { EventAnnouncementView } from "@/components/events/EventAnnouncement";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function Page({ params, searchParams }: { params: { locale: string; scope: string }; searchParams: { preview_token?: string } }) {
  if ((params.scope !== "card" && params.scope !== "banner") || !searchParams.preview_token) notFound();
  try {
    const result = await getEventPreview(params.scope, searchParams.preview_token, params.locale);
    if (!("type" in result) || result.is_preview !== true || result.preview_scope !== params.scope || result.type !== params.scope) notFound();
    return <main className="page-atmosphere min-h-screen"><EventAnnouncementView announcement={result} locale={params.locale} preview /></main>;
  } catch { notFound(); }
}
