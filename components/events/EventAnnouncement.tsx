import { eventLandingPath, type EventAnnouncement } from "@/lib/api/events";
import { eventMediaUrl } from "@/lib/api/event-media";
import { Link } from "@/i18n/navigation";

export function EventAnnouncementView({ announcement, locale, preview = false }: { announcement: EventAnnouncement; locale: string; preview?: boolean }) {
  const path = eventLandingPath(announcement.landing_path, announcement.edition_slug);
  if (!preview && (!path || (announcement.type !== "card" && announcement.type !== "banner") || typeof announcement.title_en !== "string" || typeof announcement.title_ar !== "string")) return null;
  const ar = locale === "ar";
  return <section className="mx-auto max-w-6xl px-6 py-10"><div className={`rounded-2xl border border-[#d4af37]/30 bg-[#201b13] p-6 text-[#f8f2e7] ${announcement.type === "banner" ? "md:flex md:items-center md:justify-between" : "md:max-w-xl"}`}>
    <div>{eventMediaUrl(announcement.image_url, preview) && <img src={eventMediaUrl(announcement.image_url, preview)!} alt="" referrerPolicy="no-referrer" className="mb-4 max-h-72 w-full rounded-xl object-cover" />}{preview && <p className="text-sm text-[#d4af37]">{ar ? "معاينة" : "Preview"}</p>}<h2 className="text-2xl">{(ar ? announcement.title_ar : announcement.title_en) || (preview ? (ar ? "لا يوجد محتوى للمعاينة" : "No preview content") : "")}</h2><p className="mt-3 opacity-80">{ar ? announcement.description_ar : announcement.description_en}</p></div>
    {!preview && path && <Link className="mt-4 inline-block text-[#d4af37] underline" href={path}>{ar ? "اكتشف الفعالية" : "Explore event"}</Link>}
  </div></section>;
}
