"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, CalendarX2 } from "lucide-react";

export default function EventNotFound() {
  const ar = useLocale() === "ar";
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#050505] px-5 pt-32 text-center text-[#F6F0E8]">
      <CalendarX2 size={46} className="mb-7 text-[#C9A35C]" aria-hidden="true" />
      <h1 className="text-[clamp(2rem,5vw,3.7rem)]">
        {ar ? "لم يتم العثور على المناسبة" : "We couldn't find this event"}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#C4BEB6]">
        {ar
          ? "قد يكون الرابط غير صحيح أو لم تعد المناسبة متاحة للنشر."
          : "The link may have changed, or the event is no longer published."}
      </p>
      <Link href="/events" className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 border border-[#C9A35C] px-6 text-sm text-[#E1BE82] hover:bg-[#C9A35C]/10">
        {ar ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowLeft size={17} aria-hidden="true" />}
        {ar ? "العودة إلى المناسبات" : "Back to all events"}
      </Link>
    </main>
  );
}
