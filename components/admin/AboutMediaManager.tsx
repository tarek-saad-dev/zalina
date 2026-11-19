"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ABOUT_IMAGE_SLOTS, ABOUT_MEDIA_FALLBACKS,
  normalizeAboutMedia, type AboutImageSlot, type AboutMediaMap,
} from "@/lib/about/media";

type Status = "checking" | "connected" | "unauthorized" | "unavailable";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function readXsrfCookie(): string | undefined {
  const match = document.cookie.split("; ").find(item => item.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.slice("XSRF-TOKEN=".length)) : undefined;
}

/**
 * This page can preview local files without credentials, but it cannot publish
 * anything until Laravel's authenticated admin media API has been connected.
 */
export function AboutMediaManager({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const [status, setStatus] = useState<Status>("checking");
  const [published, setPublished] = useState<AboutMediaMap>({});
  const [files, setFiles] = useState<Partial<Record<AboutImageSlot, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<AboutImageSlot, string>>>({});
  const previewUrls = useRef<Partial<Record<AboutImageSlot, string>>>({});
  const [altAr, setAltAr] = useState<Partial<Record<AboutImageSlot, string>>>({});
  const [altEn, setAltEn] = useState<Partial<Record<AboutImageSlot, string>>>({});
  const [busy, setBusy] = useState<AboutImageSlot | null>(null);
  const [notice, setNotice] = useState("");

  async function load(): Promise<Status> {
    try {
      const response = await fetch("/api/about-media-admin", { credentials: "same-origin", cache: "no-store" });
      if (response.status === 401 || response.status === 403) { setStatus("unauthorized"); return "unauthorized"; }
      if (!response.ok) { setStatus("unavailable"); return "unavailable"; }
      const body = await response.json();
      const parsed = normalizeAboutMedia(body?.data);
      setPublished(parsed);
      setAltAr(Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, value?.alt_ar || ""])));
      setAltEn(Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, value?.alt_en || ""])));
      setStatus("connected");
      return "connected";
    } catch {
      setStatus("unavailable");
      return "unavailable";
    }
  }

  useEffect(() => {
    void load();
    return () => {
      Object.values(previewUrls.current).forEach(url => { if (url) URL.revokeObjectURL(url); });
    };
  }, []);

  function chooseFile(slot: AboutImageSlot, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      setNotice(ar ? "اختار صورة JPG أو PNG أو WebP بحجم لا يزيد عن 10 ميجابايت." : "Choose a JPG, PNG or WebP image under 10 MB.");
      event.target.value = "";
      return;
    }
    const previous = previewUrls.current[slot];
    if (previous) URL.revokeObjectURL(previous);
    const url = URL.createObjectURL(file);
    previewUrls.current[slot] = url;
    setFiles(current => ({ ...current, [slot]: file }));
    setPreviews(current => ({ ...current, [slot]: url }));
    setNotice(ar ? "تم اختيار الصورة. دي معاينة محلية لحد ما تضغط نشر." : "Image selected. This is a local preview until you publish.");
  }

  async function save(slot: AboutImageSlot) {
    const file = files[slot];
    if (!file || status !== "connected" || busy) return;
    setBusy(slot);
    setNotice("");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("alt_ar", altAr[slot] || "");
      form.append("alt_en", altEn[slot] || "");
      const token = readXsrfCookie();
      const response = await fetch("/api/about-media-admin/" + encodeURIComponent(slot), {
        method: "PUT",
        credentials: "same-origin",
        headers: token ? { "X-XSRF-TOKEN": token } : undefined,
        body: form,
      });
      if (response.status === 401 || response.status === 403) {
        setStatus("unauthorized");
        throw new Error(ar ? "صلاحية الإدارة غير متاحة. سجل الدخول أولًا." : "Admin access required. Please sign in.");
      }
      if (!response.ok) {
        const message = await response.json().catch(() => null);
        throw new Error(message?.message || (ar ? "تعذر نشر الصورة." : "Could not publish image."));
      }
      await load();
      const prev = previewUrls.current[slot];
      if (prev) URL.revokeObjectURL(prev);
      delete previewUrls.current[slot];
      setFiles(current => ({ ...current, [slot]: undefined }));
      setPreviews(current => ({ ...current, [slot]: undefined }));
      setNotice(ar ? "تم حفظ ونشر الصورة بنجاح." : "Image published successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : (ar ? "حدث خطأ أثناء النشر." : "Publishing failed."));
    } finally {
      setBusy(null);
    }
  }

  async function reset(slot: AboutImageSlot) {
    if (status !== "connected" || busy || !window.confirm(ar ? "ترجع الصورة الافتراضية للمكان ده؟" : "Restore the default image for this slot?")) return;
    setBusy(slot);
    try {
      const token = readXsrfCookie();
      const response = await fetch("/api/about-media-admin/" + encodeURIComponent(slot), {
        method: "DELETE", credentials: "same-origin", headers: token ? { "X-XSRF-TOKEN": token } : undefined,
      });
      if (!response.ok) throw new Error(ar ? "تعذر استرجاع الصورة." : "Could not restore image.");
      await load();
      const oldPreview = previewUrls.current[slot];
      if (oldPreview) URL.revokeObjectURL(oldPreview);
      delete previewUrls.current[slot];
      setFiles(current => ({ ...current, [slot]: undefined }));
      setPreviews(current => ({ ...current, [slot]: undefined }));
      setNotice(ar ? "تم استرجاع الصورة الافتراضية." : "Default image restored.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-[#080807] px-4 pb-20 pt-32 text-[#F9F0DF] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-[#D4AF37]/25 pb-7">
          <p className="mb-2 text-xs font-semibold tracking-wider text-[#D4AF37]">
            {ar ? "إدارة محتوى زالينا" : "ZALINA CONTENT MANAGEMENT"}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" style={{ fontFamily: ar ? "var(--font-body-ar), sans-serif" : "var(--font-display), serif" }}>
            {ar ? "صور صفحة «عن زالينا»" : "About page images"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#F9F0DF]/65">
            {ar ? "اختار المكان، ارفع صورتك الحقيقية، وشوف المعاينة قبل النشر. كل مكان مستقل عن الباقي."
              : "Choose a location, select your real photo and preview it before publishing. Every photo slot is independent."}
          </p>
        </div>
        <div role="status" className="mb-7 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] p-4 text-sm leading-7">
          {status === "checking"
            ? (ar ? "جاري فحص اتصال إدارة الصور..." : "Checking media management access...")
            : status === "connected"
              ? (ar ? "اتصال الإدارة متاح. يمكنك نشر الصور." : "Admin media access is available. You can publish images.")
              : status === "unauthorized"
                ? (ar ? "النشر محتاج تسجيل دخول مدير بصلاحية إدارة الصور. تقدر تختار الصور وتعاينها هنا مؤقتًا." : "Publishing requires an authenticated admin session. Local previews still work.")
                : (ar ? "واجهة رفع الصور جاهزة للمعاينة، لكن حفظ الصور على الموقع منتظر ربط API فريق الـ Backend. الصور اللي تختارها هنا لا تُنشر تلقائيًا." : "Local preview is ready. Publishing awaits the secure backend API; choosing a file does not publish it.")}
        </div>
        {notice && <div role="status" className="mb-5 rounded-lg border border-white/20 p-3 text-sm">{notice}</div>}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ABOUT_IMAGE_SLOTS.map(slot => {
            const src = previews[slot.id] || published[slot.id]?.src || ABOUT_MEDIA_FALLBACKS[slot.id];
            const isWorking = busy === slot.id;
            return (
              <section key={slot.id} className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#15120E]">
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={ar ? slot.ar : slot.en} className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 start-3 rounded-full border border-white/25 bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-lg">
                    {slot.ratio}
                  </span>
                  {previews[slot.id] && <span className="absolute top-3 start-3 rounded-full bg-[#D4AF37] px-3 py-1 text-xs text-black">
                    {ar ? "معاينة فقط" : "LOCAL PREVIEW"}
                  </span>}
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <h2 className="text-lg font-semibold">{ar ? slot.ar : slot.en}</h2>
                    <p className="mt-1 font-mono text-xs text-[#D4AF37]/75">{slot.id}</p>
                  </div>
                  <div>
                    <label htmlFor={"upload-" + slot.id} className="mb-1 block text-xs text-[#F9F0DF]/65">
                      {ar ? "اختار صورة JPG / PNG / WebP — حتى 10MB" : "Select JPG / PNG / WebP — up to 10MB"}
                    </label>
                    <input
                      id={"upload-" + slot.id}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={event => chooseFile(slot.id, event)}
                      className="block w-full cursor-pointer rounded-lg border border-white/15 bg-white/5 p-2 text-xs file:me-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#D4AF37]/20 file:px-3 file:py-2 file:text-[#F9F0DF]"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs text-[#F9F0DF]/70">
                      {ar ? "وصف الصورة بالعربي" : "Arabic alt"}
                      <input value={altAr[slot.id] || ""} onChange={e => setAltAr(current => ({...current,[slot.id]:e.target.value}))}
                        maxLength={180} dir="rtl" className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-[#F9F0DF]/70">
                      {ar ? "وصف الصورة بالإنجليزي" : "English alt"}
                      <input value={altEn[slot.id] || ""} onChange={e => setAltEn(current => ({...current,[slot.id]:e.target.value}))}
                        maxLength={180} dir="ltr" className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-white" />
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={status !== "connected" || !files[slot.id] || !!busy}
                      onClick={() => void save(slot.id)}
                      className="min-h-11 flex-1 rounded-lg bg-[#D4AF37] px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35">
                      {isWorking ? (ar ? "جاري النشر..." : "Publishing...") : (ar ? "نشر الصورة" : "Publish image")}
                    </button>
                    <button type="button" disabled={status !== "connected" || !!busy}
                      onClick={() => void reset(slot.id)}
                      className="min-h-11 rounded-lg border border-white/20 px-4 text-xs text-white/70 disabled:opacity-35">
                      {ar ? "استرجاع" : "Restore"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
