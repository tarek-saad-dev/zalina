"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, createEventBooking, initiatePayment, type ApiBooking } from "@/lib/api";
import { resolvePaymentGateway } from "@/components/book-now/paymentGateway";
import { savePendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import { getEventAvailability } from "@/lib/events/api";
import {
  bookingHoldDeadline,
  buildEventBookingPayload,
  estimateEventTotal,
  eventGuestIsValid,
  findEventSelection,
  formatHoldRemaining,
  isBookingHoldExpired,
  securePaymentLink,
  validateEventGuest,
  type EventGuestDetails,
} from "@/lib/events/checkout";
import {
  formattedEventDate,
  formattedEventMoney,
  localized,
  type EventAvailability,
  type EventDetail,
  type EventLocale,
} from "@/lib/events/domain";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, CreditCard,
  LockKeyhole, Mail, MapPin, ShieldCheck, Ticket, UserRound, Users,
} from "lucide-react";

type WizardStep = "guest" | "review" | "payment" | "demo";
type AvailabilityState =
  | { kind: "loading" | "error"; data: null }
  | { kind: "ready"; data: EventAvailability };
type CheckoutMessage = {
  text: string;
  kind: "unavailable" | "validation" | "conflict" | "rate_limit" | "uncertain" | "payment" | "expired";
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};
type DemoScenario = "pending" | "confirmed" | "failed" | "expired";

const text = {
  en: {
    eyebrow: "PRIVATE EVENT BOOKING", title: "Reserve your occasion",
    selection: "Your experience", guest: "Guest details", review: "Review booking", payment: "Secure payment",
    demoTitle: "Preview complete — no booking was made",
    demoCopy: "This is a local frontend preview. No inventory was held, no card was charged and no valid ticket was issued.",
    demoStatus: "Preview booking status screen states", demoPending: "Awaiting payment", demoConfirmed: "Confirmed (preview)", demoFailed: "Payment failed", demoExpired: "Hold expired",
    demoTicket: "Digital ticket and QR appear only when the real backend confirms payment and returns a valid booking code.",
    demoTag: "DEVELOPMENT PREVIEW — FICTIONAL PRICES, NO PAYMENT",
    back: "Back to event", edit: "Change package or date", date: "Date & time", package: "Package", qty: "Quantity",
    guests: "Guests", total: "Current estimate", serverTotal: "Confirmed reservation total", name: "Full name", email: "Email address",
    phone: "Phone number", required: "Please enter valid guest details.", terms: "Your details are used for this reservation and its confirmation.",
    next: "Review reservation", previous: "Back to details", create: "Secure reservation", pay: "Continue to secure payment",
    creating: "Securing your reservation…", paying: "Preparing payment…", held: "Your temporary reservation is ready.",
    live: "Availability checked live; the server determines the final amount.",
    noSelection: "Please choose an available event date and package again.",
    noAvailability: "We could not confirm availability. Please retry, or choose another package.",
    sold: "These places have just sold out. Please select another package.",
    changed: "Availability or price changed. Please review the new total before continuing.",
    uncertain: "We could not verify if a reservation was created. Please do not submit again until the existing reservation has been checked.",
    createFailed: "We could not create your reservation. Review your details and try again.",
    rateLimit: "Too many requests. Please wait before retrying.",
    validation: "Please review the highlighted details.",
    paymentFailed: "Payment could not be started. Your existing reservation is saved; retry payment without making another booking.",
    invalidLink: "The payment provider returned an invalid or insecure link.",
    expired: "Your temporary reservation has expired. Please start a new booking.",
    hold: "Time left to complete payment", check: "Recheck availability",
    retryPay: "Retry payment", viewBooking: "View booking status", openRecovery: "Find your existing reservation",
    notePayment: "Payment is handled on the provider's secure page. We never collect card details here.",
    noPrices: "No price is available until stock can be checked.",
    reference: "Booking reference",
    reviewDisclaimer: "By continuing, you request a temporary hold at the amount confirmed by the booking server. Payment is a separate step.",
    demoContinue: "Finish preview (no payment)",
    validationName: "Enter your full name (2–120 characters).",
    validationEmail: "Enter a valid email address.",
    validationPhone: "Enter a valid phone number.",
    contactSupport: "If you already paid, use your booking reference to check your booking rather than paying twice.",
  },
  ar: {
    eyebrow: "حجز المناسبات الخاصة", title: "احجز مناسبتك",
    selection: "تفاصيل التجربة", guest: "بيانات الضيف", review: "مراجعة الحجز", payment: "الدفع الآمن",
    demoTitle: "اكتملت المعاينة — لم يتم إنشاء حجز",
    demoCopy: "دي معاينة للواجهة في بيئة التطوير فقط. لم يتم حجز أي أماكن أو تحصيل أي مبلغ أو إصدار تذكرة حقيقية.",
    demoStatus: "استعرض حالات شاشة الحجز", demoPending: "بانتظار الدفع", demoConfirmed: "مؤكد (معاينة)", demoFailed: "فشل الدفع", demoExpired: "انتهاء الحجز المؤقت",
    demoTicket: "تظهر التذكرة الرقمية ورمز QR فقط بعد تأكيد الدفع من الباك إند وإرسال كود حجز صالح.",
    demoTag: "معاينة تطوير — أسعار تجريبية دون دفع",
    back: "الرجوع للمناسبة", edit: "تغيير الباقة أو الموعد", date: "الميعاد", package: "الباقة", qty: "العدد",
    guests: "الضيوف", total: "الإجمالي التقديري", serverTotal: "إجمالي الحجز المعتمد", name: "الاسم بالكامل", email: "البريد الإلكتروني",
    phone: "رقم التليفون", required: "من فضلك اكتب بيانات صحيحة.", terms: "سنستخدم البيانات لإتمام الحجز وإرسال التأكيد.",
    next: "مراجعة الحجز", previous: "الرجوع للبيانات", create: "تأكيد الحجز المؤقت", pay: "متابعة الدفع الآمن",
    creating: "جارٍ تأمين حجزك…", paying: "جارٍ تجهيز الدفع…", held: "تم تأمين حجز مؤقت.",
    live: "يتم التحقق من التوافر، والسيرفر هو المسؤول عن السعر النهائي.",
    noSelection: "اختار ميعاد وباقة متاحين مرة تانية.",
    noAvailability: "تعذر تأكيد التوافر. جرّب مرة أخرى أو اختار باقة تانية.",
    sold: "الأماكن المطلوبة خلصت. اختار باقة تانية.",
    changed: "اتغير التوافر أو السعر. راجع الإجمالي الجديد قبل المتابعة.",
    uncertain: "مش قادرين نتأكد إذا تم إنشاء الحجز. ما تعيدش الطلب قبل التأكد من الحجز السابق.",
    createFailed: "تعذر إنشاء الحجز. راجع بياناتك وحاول مرة تانية.",
    rateLimit: "عدد المحاولات كبير. حاول بعد شوية.",
    validation: "راجع البيانات المطلوبة.",
    paymentFailed: "تعذر بدء الدفع. حجزك الحالي محفوظ وتقدر تعيد الدفع من غير إنشاء حجز جديد.",
    invalidLink: "رابط الدفع اللي وصلنا غير صالح أو غير آمن.",
    expired: "انتهت مدة الحجز المؤقت. ابدأ حجز جديد.",
    hold: "الوقت المتبقي لإتمام الدفع", check: "تحديث التوافر",
    retryPay: "إعادة محاولة الدفع", viewBooking: "عرض حالة الحجز", openRecovery: "استعلام عن حجز سابق",
    notePayment: "الدفع بيتم على صفحة بوابة الدفع الآمنة. مش بنجمع بيانات الكارت هنا.",
    noPrices: "السعر مش متاح قبل التأكد من التوافر.",
    reference: "مرجع الحجز",
    reviewDisclaimer: "بالمتابعة، أنت بتطلب حجز مؤقت بالسعر اللي السيرفر بيعتمده. الدفع هيكون في خطوة منفصلة.",
    demoContinue: "إنهاء المعاينة (بدون دفع)",
    validationName: "ادخل الاسم بالكامل من حرفين إلى 120.",
    validationEmail: "اكتب بريد إلكتروني صحيح.",
    validationPhone: "اكتب رقم تليفون صحيح.",
    contactSupport: "لو دفعت بالفعل استخدم مرجع الحجز لمعرفة حالته، ومتدفعش مرتين.",
  },
} as const;

function errorFromCreate(err: unknown, locale: EventLocale): CheckoutMessage {
  const t = text[locale];
  if (err instanceof ApiError) {
    if (err.status === 409) return { text: t.sold, kind: "conflict", requestId: err.requestId };
    if (err.status === 422 || err.status === 400) {
      return { text: t.validation, kind: "validation", fieldErrors: err.errors, requestId: err.requestId };
    }
    if (err.status === 429) return { text: t.rateLimit, kind: "rate_limit", requestId: err.requestId };
    if (err.status >= 500 || err.status === 0) return { text: t.uncertain, kind: "uncertain", requestId: err.requestId };
    return { text: t.createFailed, kind: "validation", requestId: err.requestId };
  }
  return { text: t.uncertain, kind: "uncertain" };
}

function errorFromPayment(err: unknown, locale: EventLocale): CheckoutMessage {
  const t = text[locale];
  if (err instanceof ApiError) {
    if (err.status === 422) return { text: t.expired, kind: "expired", requestId: err.requestId };
    if (err.status === 429) return { text: t.rateLimit, kind: "rate_limit", requestId: err.requestId };
    return { text: t.paymentFailed, kind: "payment", requestId: err.requestId };
  }
  return { text: t.paymentFailed, kind: "payment" };
}

function Field({
  id, label, value, type, autocomplete, invalid, error, onChange,
}: {
  id: string; label: string; value: string; type: string; autocomplete: string;
  invalid?: boolean; error?: string; onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-[#F6F0E8]">{label} <span aria-hidden="true" className="text-[#E1BE82]">*</span></label>
      <input id={id} type={type} value={value} required
        onChange={(event) => onChange(event.currentTarget.value)}
        autoComplete={autocomplete} aria-invalid={invalid || undefined}
        aria-describedby={invalid && error ? id + "-error" : undefined}
        className="min-h-[52px] w-full rounded-sm border border-[#C9A35C]/30 bg-[#080706] px-4 text-sm text-[#F6F0E8] outline-none transition-colors placeholder:text-[#C4BEB6]/60 focus:border-[#C9A35C] focus-visible:ring-1 focus-visible:ring-[#C9A35C]"
      />
      {invalid && error ? <p id={id + "-error"} role="alert" className="mt-1 text-xs text-[#E1BE82]">{error}</p> : null}
    </div>
  );
}

export function EventCheckout({
  event, locale, isDemo, occurrenceId, packageId, quantity,
}: {
  event: EventDetail;
  locale: EventLocale;
  isDemo: boolean;
  occurrenceId: number | null;
  packageId: number | null;
  quantity: number | null;
}) {
  const t = text[locale];
  const router = useRouter();
  const [guest, setGuest] = useState<EventGuestDetails>({ name: "", email: "", phone: "" });
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState<WizardStep>("guest");
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: "loading", data: null });
  const [refresh, setRefresh] = useState(0);
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [message, setMessage] = useState<CheckoutMessage | null>(null);
  const [busy, setBusy] = useState<"create" | "pay" | null>(null);
  const [now, setNow] = useState(0);
  const [demoScenario, setDemoScenario] = useState<DemoScenario>("pending");
  const busyRef = useRef(false);
  const createAttemptedRef = useRef(false);

  const initial = useMemo(
    () => findEventSelection(event, occurrenceId, packageId, quantity),
    [event, occurrenceId, packageId, quantity]
  );
  const selected = initial.ok ? initial.selection : null;
  const linkBack = `/events/${event.slug}#event-packages`;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    setNow(Date.now());
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected || booking || step === "demo") return;
    const controller = new AbortController();
    const fetchNow = () => {
      setAvailability({ kind: "loading", data: null });
      void getEventAvailability(event.slug, selected.occurrence.id, locale, isDemo, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setAvailability({ kind: "ready", data: result });
        })
        .catch(() => {
          if (!controller.signal.aborted) setAvailability({ kind: "error", data: null });
        });
    };
    fetchNow();
    return () => controller.abort();
  }, [event.slug, selected?.occurrence.id, locale, isDemo, refresh, booking, step === "demo"]);

  const availabilityData = availability.kind === "ready" ? availability.data : null;
  const verified = selected
    ? findEventSelection(event, selected.occurrence.id, selected.package.id, selected.quantity, availabilityData)
    : initial;
  const selectionOK = initial.ok && availability.kind === "ready" && verified.ok;
  const estimatedTotal = selected ? estimateEventTotal(availabilityData, selected) : null;
  const currency = selected
    ? availabilityData?.packages.find(p => p.package_id === selected.package.id)?.currency ?? selected.package.currency
    : event.currency;

  const holdDeadline = booking ? bookingHoldDeadline(booking) : null;
  const expired = booking ? isBookingHoldExpired(booking, now || Date.now()) : false;
  const remaining = formatHoldRemaining(holdDeadline, now || Date.now());
  const guestErrors = validateEventGuest(guest);
  const guestValid = eventGuestIsValid(guest);
  const canEdit = !booking && !busy && !createAttemptedRef.current;
  const submitBlocked = busy !== null || busyRef.current;

  const setField = useCallback((key: keyof EventGuestDetails, value: string) => {
    setGuest(prev => ({ ...prev, [key]: value }));
  }, []);

  const proceedReview = (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    setTouched(true);
    if (!guestValid || !selectionOK || !selected || !estimatedTotal) return;
    setMessage(null);
    setStep("review");
  };

  const reserve = async () => {
    if (!selected || !guestValid || !selectionOK || submitBlocked || createAttemptedRef.current) return;
    busyRef.current = true;
    setBusy("create");
    setMessage(null);
    try {
      // Revalidate stock and estimate immediately before creating a hold.
      const live = await getEventAvailability(event.slug, selected.occurrence.id, locale, isDemo);
      const isCurrent = findEventSelection(event, selected.occurrence.id, selected.package.id, selected.quantity, live);
      const liveEstimate = estimateEventTotal(live, selected);
      if (!isCurrent.ok || !liveEstimate) {
        setAvailability({ kind: "ready", data: live });
        setMessage({ text: t.sold, kind: "conflict" });
        setStep("guest");
        return;
      }
      if (liveEstimate !== estimatedTotal) {
        setAvailability({ kind: "ready", data: live });
        setMessage({ text: t.changed, kind: "conflict" });
        return;
      }

      if (isDemo) {
        setStep("demo");
        return;
      }

      // No client-side prices, totals or payment outcome are passed to Laravel.
      createAttemptedRef.current = true;
      const payload = buildEventBookingPayload(selected, guest);
      const next = await createEventBooking(payload, locale);
      if (!next.booking_reference || next.product_type !== "event" || !next.total) {
        setMessage({ text: t.uncertain, kind: "uncertain" });
        return;
      }
      savePendingPaymentBooking(next); // reference/code only; NO PII or payment URL.
      setBooking(next);
      setStep("payment");
    } catch (err) {
      const mapped = errorFromCreate(err, locale);
      setMessage(mapped);
      if (mapped.kind === "conflict" || mapped.kind === "validation" || mapped.kind === "rate_limit") {
        createAttemptedRef.current = false;
        setRefresh(x => x + 1);
      }
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const pay = async () => {
    if (!booking || submitBlocked || expired) return;
    busyRef.current = true;
    setBusy("pay");
    setMessage(null);
    try {
      const session = await initiatePayment(booking.booking_reference, resolvePaymentGateway(), locale);
      const url = securePaymentLink(session.payment_url);
      if (!url) {
        setMessage({ text: t.invalidLink, kind: "payment" });
        return;
      }
      savePendingPaymentBooking(booking);
      window.location.assign(url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Backend may signal already paid: public booking status is authoritative.
        router.push(`/booking/${encodeURIComponent(booking.booking_reference)}`);
        return;
      }
      setMessage(errorFromPayment(err, locale));
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const renderError = message ? (
    <div role="alert" className="rounded-sm border border-[#C9A35C]/45 bg-[#25190E] p-5 text-sm leading-relaxed text-[#F6F0E8]">
      {message.text}
      {message.fieldErrors ? (
        <ul className="mt-2 list-inside list-disc space-y-1">
          {Object.entries(message.fieldErrors).flatMap(([key, items]) => items.map((value, index) => (
            <li key={key + index}>{key}: {value}</li>
          )))}
        </ul>
      ) : null}
      {message.requestId ? <p className="mt-2 text-xs text-[#C4BEB6]">Support ID: {message.requestId}</p> : null}
      {message.kind === "uncertain" ? (
        <Link href="/booking" className="mt-4 inline-flex min-h-10 items-center border-b border-[#C9A35C] text-[#E1BE82]">{t.openRecovery}</Link>
      ) : null}
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-24 pt-36 text-[#F6F0E8] sm:px-8 sm:pt-44 lg:px-12">
      <div className="mx-auto max-w-[1160px]">
        <Link href={linkBack} className="inline-flex min-h-11 items-center gap-2 text-sm text-[#C4BEB6] transition-colors hover:text-[#C9A35C]">
          {locale === "ar" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />} {t.back}
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-[#C9A35C]">{t.eyebrow}</p>
        <h1 className="mt-3 text-[clamp(2.5rem,5vw,4.7rem)] leading-tight">{t.title}</h1>
        {isDemo ? (
          <p className="mt-5 w-fit border border-amber-600/60 bg-amber-950/20 px-4 py-2 text-xs font-semibold text-[#E1BE82]">{t.demoTag}</p>
        ) : null}

        <nav aria-label={locale === "ar" ? "خطوات الحجز" : "Booking steps"} className="mt-10 flex flex-wrap items-center gap-2 border-b border-[#C9A35C]/25 pb-6">
          {[["guest", t.guest], ["review", t.review], ["payment", t.payment]] .map(([id, label], index) => (
            <span key={id} aria-current={step === id ? "step" : undefined}
              className={`flex min-h-9 items-center gap-2 rounded-sm border px-3 text-xs ${(step === id || (step === "demo" && id === "payment"))
                ? "border-[#C9A35C] text-[#E1BE82]" : "border-[#C9A35C]/20 text-[#C4BEB6]"}`}>
              <span className="text-[#C9A35C]">{index + 1}</span> {label}
            </span>
          ))}
        </nav>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="order-2 rounded-sm border border-[#C9A35C]/25 bg-[#0C0A08] p-5 sm:p-8 lg:order-1">
            {!selected ? (
              <div className="space-y-5">
                <p role="alert" className="text-[#E1BE82]">{t.noSelection}</p>
                <Link href={linkBack} className="inline-flex min-h-11 items-center border border-[#C9A35C] px-6 text-sm text-[#E1BE82]">{t.edit}</Link>
              </div>
            ) : step === "guest" ? (
              <form onSubmit={proceedReview} noValidate className="space-y-6">
                <h2 className="text-2xl">{t.guest}</h2>
                <p className="text-sm text-[#C4BEB6]">{t.terms}</p>
                <Field id="event-guest-name" label={t.name} type="text" autocomplete="name" value={guest.name} onChange={v => setField("name", v)}
                  invalid={touched && Boolean(guestErrors.name)} error={t.validationName} />
                <Field id="event-guest-email" label={t.email} type="email" autocomplete="email" value={guest.email} onChange={v => setField("email", v)}
                  invalid={touched && Boolean(guestErrors.email)} error={t.validationEmail} />
                <Field id="event-guest-phone" label={t.phone} type="tel" autocomplete="tel" value={guest.phone} onChange={v => setField("phone", v)}
                  invalid={touched && Boolean(guestErrors.phone)} error={t.validationPhone} />
                {!guestValid && touched ? <p role="alert" className="text-xs text-[#E1BE82]">{t.required}</p> : null}
                {renderError}
                {availability.kind === "error" ? (
                  <div role="alert" className="text-sm text-[#E1BE82]">
                    {t.noAvailability}
                    <button type="button" onClick={() => setRefresh(v => v + 1)} className="ms-4 min-h-10 border-b border-[#C9A35C]">{t.check}</button>
                  </div>
                ) : availability.kind === "loading" ? <p role="status" className="text-sm text-[#C4BEB6]">{t.check}</p> : null}
                {availability.kind === "ready" && !selectionOK ? <p role="alert" className="text-sm text-[#E1BE82]">{t.sold}</p> : null}
                <button type="submit" disabled={!selectionOK || !guestValid || !canEdit}
                  className="flex min-h-[52px] w-full items-center justify-center rounded-sm bg-[#C9A35C] px-6 text-sm font-semibold text-[#050505] transition-colors hover:bg-[#E1BE82] disabled:cursor-not-allowed disabled:opacity-40">
                  {t.next}
                </button>
              </form>
            ) : step === "review" ? (
              <div className="space-y-7">
                <h2 className="text-2xl">{t.review}</h2>
                <p className="text-sm leading-relaxed text-[#C4BEB6]">{t.reviewDisclaimer}</p>
                <dl className="space-y-3 border-y border-[#C9A35C]/20 py-5 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#C4BEB6]">{t.name}</dt><dd className="text-end">{guest.name.trim()}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#C4BEB6]">{t.email}</dt><dd className="break-all text-end">{guest.email.trim()}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#C4BEB6]">{t.phone}</dt><dd className="text-end">{guest.phone.trim()}</dd></div>
                </dl>
                {renderError}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" disabled={!canEdit} onClick={() => { setMessage(null); setStep("guest"); }}
                    className="min-h-[50px] flex-1 border border-[#C9A35C]/40 px-5 text-sm text-[#E1BE82] disabled:opacity-40">{t.previous}</button>
                  <button type="button" onClick={() => { void reserve(); }} disabled={!canEdit || !selectionOK || !estimatedTotal}
                    className="min-h-[50px] flex-[1.4] rounded-sm bg-[#C9A35C] px-5 text-sm font-semibold text-[#050505] disabled:opacity-40">
                    {busy === "create" ? t.creating : isDemo ? t.demoContinue : t.create}
                  </button>
                </div>
              </div>
            ) : step === "payment" && booking ? (
              <div className="space-y-7">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-6 w-6 text-[#C9A35C]" aria-hidden="true" />
                  <div><h2 className="text-2xl">{t.held}</h2><p className="mt-2 text-sm text-[#C4BEB6]">{t.contactSupport}</p></div>
                </div>
                <div className="border-y border-[#C9A35C]/20 py-5">
                  <p className="text-xs text-[#C4BEB6]">{t.reference}</p>
                  <p className="mt-1 break-all text-lg font-semibold tracking-[0.08em] text-[#E1BE82]">{booking.booking_reference}</p>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm text-[#C4BEB6]">{t.serverTotal}</p>
                  <p className="text-2xl text-[#E1BE82]">{formattedEventMoney(booking.total, booking.currency ?? currency, locale)}</p>
                </div>
                {remaining ? (
                  <div role="timer" aria-live="off" className="flex items-center justify-between gap-4 rounded-sm border border-[#C9A35C]/30 bg-[#15110d] p-4">
                    <span className="flex items-center gap-2 text-sm text-[#C4BEB6]"><Clock3 size={17} aria-hidden="true" />{t.hold}</span>
                    <strong className="font-mono text-xl text-[#E1BE82]">{remaining}</strong>
                  </div>
                ) : null}
                {expired ? <p role="alert" className="text-sm text-[#E1BE82]">{t.expired}</p> : null}
                {renderError}
                <p className="flex items-start gap-2 text-xs leading-relaxed text-[#C4BEB6]">
                  <LockKeyhole size={16} className="mt-0.5 shrink-0 text-[#C9A35C]" aria-hidden="true" /> {t.notePayment}
                </p>
                <button type="button" onClick={() => { void pay(); }} disabled={expired || busy !== null}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-sm bg-[#C9A35C] px-6 text-sm font-semibold text-[#050505] disabled:opacity-40">
                  <CreditCard size={17} aria-hidden="true" />{busy === "pay" ? t.paying : message?.kind === "payment" ? t.retryPay : t.pay}
                </button>
                <Link href={`/booking/${encodeURIComponent(booking.booking_reference)}`}
                  className="flex min-h-12 w-full items-center justify-center border border-[#C9A35C]/35 text-sm text-[#E1BE82]">{t.viewBooking}</Link>
              </div>
            ) : step === "demo" ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-6 w-6 text-[#C9A35C]" aria-hidden="true" />
                  <div><h2 className="text-2xl">{t.demoTitle}</h2><p className="mt-3 text-sm leading-relaxed text-[#C4BEB6]">{t.demoCopy}</p></div>
                </div>
                <h3 className="text-sm text-[#E1BE82]">{t.demoStatus}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["pending", "confirmed", "failed", "expired"] as const).map((scenario) => (
                    <button key={scenario} type="button" onClick={() => setDemoScenario(scenario)} aria-pressed={demoScenario === scenario}
                      className={`min-h-[44px] border px-3 text-xs ${demoScenario === scenario ? "border-[#C9A35C] bg-[#C9A35C]/15 text-[#F6F0E8]" : "border-[#C9A35C]/20 text-[#C4BEB6]"}`}>
                      {scenario === "pending" ? t.demoPending : scenario === "confirmed" ? t.demoConfirmed : scenario === "failed" ? t.demoFailed : t.demoExpired}
                    </button>
                  ))}
                </div>
                <p role="status" className="rounded-sm border border-[#C9A35C]/35 bg-[#15110d] p-6 text-center text-xl text-[#E1BE82]">
                  {demoScenario === "pending" ? t.demoPending : demoScenario === "confirmed" ? t.demoConfirmed : demoScenario === "failed" ? t.demoFailed : t.demoExpired}
                  <span className="mt-3 block text-xs text-[#C4BEB6]">{t.demoTag}</span>
                </p>
                <div className="flex items-start gap-3 text-sm leading-relaxed text-[#C4BEB6]"><Ticket size={19} className="mt-0.5 shrink-0 text-[#C9A35C]" />{t.demoTicket}</div>
              </div>
            ) : null}
          </section>

          <aside className="order-1 rounded-sm border border-[#C9A35C]/25 bg-[#100e0b] p-5 sm:p-7 lg:order-2 lg:sticky lg:top-28" aria-label={t.selection}>
            <h2 className="text-xl">{t.selection}</h2>
            <p className="mt-4 text-lg text-[#E1BE82]">{localized(event, "title", locale)}</p>
            {selected ? (
              <dl className="mt-6 space-y-4">
                <div className="flex items-start gap-3"><CalendarDays size={17} className="mt-1 shrink-0 text-[#C9A35C]" aria-hidden="true" />
                  <div><dt className="text-xs text-[#C4BEB6]">{t.date}</dt><dd className="mt-1 text-sm">{formattedEventDate(selected.occurrence.starts_at, locale)}</dd></div></div>
                <div className="flex items-start gap-3"><Ticket size={17} className="mt-1 shrink-0 text-[#C9A35C]" aria-hidden="true" />
                  <div><dt className="text-xs text-[#C4BEB6]">{t.package}</dt><dd className="mt-1 text-sm">{localized(selected.package, "name", locale)}</dd></div></div>
                <div className="flex items-start gap-3"><Users size={17} className="mt-1 shrink-0 text-[#C9A35C]" aria-hidden="true" />
                  <div><dt className="text-xs text-[#C4BEB6]">{t.guests}</dt><dd className="mt-1 text-sm">{selected.guests} · {t.qty}: {selected.quantity}</dd></div></div>
                <div className="border-t border-[#C9A35C]/20 pt-5">
                  <dt className="text-xs text-[#C4BEB6]">{booking ? t.serverTotal : t.total}</dt>
                  <dd className="mt-2 text-xl text-[#E1BE82]">
                    {booking
                      ? formattedEventMoney(booking.total, booking.currency ?? currency, locale)
                      : estimatedTotal ? formattedEventMoney(estimatedTotal, currency, locale) : t.noPrices}
                  </dd>
                </div>
              </dl>
            ) : <p className="mt-4 text-sm text-[#C4BEB6]">{t.noSelection}</p>}
            {!booking && step !== "demo" ? (
              <Link href={linkBack} className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-[#C9A35C] text-xs text-[#E1BE82]">
                <ArrowLeft size={15} aria-hidden="true" />{t.edit}
              </Link>
            ) : null}
            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-[#C4BEB6]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#C9A35C]" aria-hidden="true" /> {t.live}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
