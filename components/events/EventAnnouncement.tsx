import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { eventLandingPath, type EventAnnouncement, type EventEdition } from "@/lib/api/events";
import { isEventAnnouncement } from "@/lib/api/event-runtime";
import { eventMediaUrl } from "@/lib/api/event-media";
import { Link } from "@/i18n/navigation";

export function EventAnnouncementView({ announcement, locale, preview = false, edition = null }: { announcement: EventAnnouncement; locale: string; preview?: boolean; edition?: EventEdition | null }) {
  if (!isEventAnnouncement(announcement, preview)) return null;
  const path = preview ? null : eventLandingPath(announcement.landing_path, announcement.edition_slug);
  if (!preview && !path) return null;
  const ar = locale === "ar";
  const banner = announcement.type === "banner";
  const title = (ar ? announcement.title_ar : announcement.title_en) || (preview ? (ar ? "لا يوجد محتوى للمعاينة" : "No preview content") : "");
  const description = ar ? announcement.description_ar : announcement.description_en;
  const image = eventMediaUrl(announcement.image_url, preview);
  const details = !preview && edition && edition.slug === announcement.edition_slug && edition.event_edition_id === announcement.event_edition_id ? edition : null;
  const canBook = Boolean(details && details.availability_state === "booking_open" && details.public_sales_enabled && details.purchase_enabled && details.packages.some(p => p.is_active && p.is_purchasable));
  const formatDate = (value: string | null, options: Intl.DateTimeFormatOptions) => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { ...options, timeZone: "Africa/Cairo" }).format(new Date(value)) : null;
  const day = details ? formatDate(details.event_starts_at, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null;
  const start = details ? formatDate(details.event_starts_at, { hour: "numeric", minute: "2-digit" }) : null;
  const end = details ? formatDate(details.event_ends_at, { hour: "numeric", minute: "2-digit" }) : null;
  const status = details ? ({ sales_not_open: ar ? "قريبًا" : "Coming soon", booking_open: canBook ? (ar ? "الحجز متاح" : "Booking open") : (ar ? "الحجز غير متاح" : "Booking unavailable"), sold_out: ar ? "نفدت التذاكر" : "Sold out", sales_closed: ar ? "أُغلق الحجز" : "Sales closed" })[details.availability_state] : null;
  return <section data-event-announcement={announcement.type} className={`event-feature event-feature--${announcement.type}${image ? " event-feature--media" : ""}${preview ? " event-feature--preview" : ""}`} aria-label={ar ? "فعالية مميزة" : "Featured event"}>
    <div className="event-feature__badge"><Sparkles size={15} aria-hidden="true"/><span>{preview ? (ar ? "معاينة" : "Preview") : banner ? (ar ? "فعالية خاصة" : "Special event") : (ar ? "فعالية مميزة" : "Featured event")}</span></div>
    {image && <div className="event-feature__image"><img src={image} alt="" referrerPolicy="no-referrer" decoding="async" /></div>}
    <div className="event-feature__copy"><h2>{title}</h2>{status && <span className="event-feature__status">{status}</span>}{description && <p>{description}</p>}</div>
    <div className="event-feature__meta">
      {day && <div><CalendarDays size={18} aria-hidden="true"/><span>{day}{start && !banner && <small>{ar ? "من " : "From "}{start}</small>}</span></div>}
      {banner && start && <div><Clock3 size={17} aria-hidden="true"/><span>{start}{end ? ` – ${end}` : ""}</span></div>}
      {!preview && <div><MapPin size={18} aria-hidden="true"/><span>{ar ? "قرية زالينا العربية" : "Zalina Arabian Village"}<small>{ar ? "الأقصر، مصر" : "Luxor, Egypt"}</small></span></div>}
    </div>
    {!preview && path && <div className="event-feature__actions">
      {canBook && <Link href={path+"#event-packages"} className="event-feature__primary">{ar ? "احجز الآن" : "Book now"}<ArrowRight size={17} className="rtl:-scale-x-100" aria-hidden="true"/></Link>}
      <Link href={path} aria-label={ar ? "اكتشف الفعالية" : "Explore event"} className="event-feature__secondary">{ar ? "تفاصيل الفعالية" : "View event"}<ArrowUpRight size={15} className="rtl:-scale-x-100" aria-hidden="true"/></Link>
    </div>}
  </section>;
}
