import { eventLandingPath, type EventAnnouncement } from "@/lib/api/events";
import { Link } from "@/i18n/navigation";

export function EventAnnouncementView({ announcement, locale, preview = false }: { announcement: EventAnnouncement; locale: string; preview?: boolean }) {
  const path = eventLandingPath(announcement.landing_path, announcement.edition_slug);
  if (!path) return null;
  const ar = locale === "ar";
  return <section className="mx-auto max-w-6xl px-6 py-10"><div className={`rounded-2xl border border-[#d4af37]/30 bg-[#201b13] p-6 text-[#f8f2e7] ${announcement.type === "banner" ? "md:flex md:items-center md:justify-between" : "md:max-w-xl"}`}>
    <div>{preview && <p className="text-sm text-[#d4af37]">{ar ? "معاينة" : "Preview"}</p>}<h2 className="text-2xl">{ar ? announcement.title_ar : announcement.title_en}</h2><p className="mt-3 opacity-80">{ar ? announcement.description_ar : announcement.description_en}</p></div>
    {!preview && <Link className="mt-4 inline-block text-[#d4af37] underline" href={path}>{ar ? "اكتشف الفعالية" : "Explore event"}</Link>}
  </div></section>;
}
