import type { ApiLocale } from "@/lib/api";
import type { BookingLifecycleBucket } from "./bookingStatusModel";

type Copy = { en: string; ar: string };

function pick(locale: ApiLocale, copy: Copy): string {
  return locale === "ar" ? copy.ar : copy.en;
}

const STATUS_LABELS: Record<string, Copy> = {
  pending_payment: {
    en: "Awaiting payment confirmation",
    ar: "بانتظار تأكيد الدفع",
  },
  paid: {
    en: "Payment received — confirming reservation",
    ar: "تم استلام الدفع — جاري تأكيد الحجز",
  },
  confirmed: {
    en: "Reservation confirmed",
    ar: "تم تأكيد الحجز",
  },
  checked_in: {
    en: "Checked in",
    ar: "تم تسجيل الدخول",
  },
  checked_out: {
    en: "Checked out",
    ar: "تم تسجيل الخروج",
  },
  completed: {
    en: "Visit completed",
    ar: "اكتملت الزيارة",
  },
  no_show: {
    en: "Marked as no-show",
    ar: "لم يحضر الضيف",
  },
  failed: {
    en: "Payment unsuccessful",
    ar: "لم تنجح عملية الدفع",
  },
  cancelled: {
    en: "Booking cancelled",
    ar: "تم إلغاء الحجز",
  },
  expired: {
    en: "Reservation hold expired",
    ar: "انتهت صلاحية حجزك المؤقت",
  },
};

const PAYMENT_LABELS: Record<string, Copy> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  paid: { en: "Paid", ar: "مدفوع" },
  failed: { en: "Failed", ar: "فشل" },
  refunded: { en: "Refunded", ar: "تم الاسترداد" },
};

export function bookingStatusLabel(
  status: string | null | undefined,
  locale: ApiLocale
): string {
  const key = (status ?? "").toLowerCase();
  const copy = STATUS_LABELS[key];
  if (copy) return pick(locale, copy);
  return pick(locale, {
    en: "Reservation status updating",
    ar: "حالة الحجز قيد التحديث",
  });
}

export function paymentStatusLabel(
  status: string | null | undefined,
  locale: ApiLocale
): string {
  if (!status) return pick(locale, { en: "—", ar: "—" });
  const copy = PAYMENT_LABELS[status.toLowerCase()];
  if (copy) return pick(locale, copy);
  return status;
}

export function productTypeLabel(
  product: string | null | undefined,
  locale: ApiLocale
): string {
  if (product === "day_use") {
    return pick(locale, { en: "Day Use", ar: "استخدام يومي" });
  }
  if (product === "bubble_stay") {
    return pick(locale, { en: "Bubble Stay", ar: "إقامة الفقاعات" });
  }
  return pick(locale, { en: "Experience", ar: "تجربة" });
}

export function heroTitleForBucket(
  bucket: BookingLifecycleBucket,
  locale: ApiLocale
): string {
  switch (bucket) {
    case "waiting":
      return pick(locale, {
        en: "Confirming your reservation…",
        ar: "جاري تأكيد حجزك…",
      });
    case "confirmed_preparing_ticket":
      return pick(locale, {
        en: "Your reservation is confirmed",
        ar: "تم تأكيد حجزك",
      });
    case "confirmed_ready":
      return pick(locale, {
        en: "Your reservation is confirmed",
        ar: "تم تأكيد حجزك",
      });
    case "active_visit":
      return pick(locale, {
        en: "Your Zalina booking",
        ar: "حجزك في زالينا",
      });
    case "failed":
      return pick(locale, {
        en: "Payment was not completed",
        ar: "لم تكتمل عملية الدفع",
      });
    case "cancelled":
      return pick(locale, {
        en: "This booking was cancelled",
        ar: "تم إلغاء هذا الحجز",
      });
    case "expired":
      return pick(locale, {
        en: "Your reservation hold has expired",
        ar: "انتهت صلاحية حجزك المؤقت",
      });
    default:
      return pick(locale, {
        en: "Booking status",
        ar: "حالة الحجز",
      });
  }
}

export function heroSubtitleForBucket(
  bucket: BookingLifecycleBucket,
  locale: ApiLocale
): string {
  switch (bucket) {
    case "waiting":
      return pick(locale, {
        en: "Payment confirmation can take a moment. Please keep this page open.",
        ar: "قد يستغرق تأكيد الدفع لحظات. يُرجى إبقاء هذه الصفحة مفتوحة.",
      });
    case "confirmed_preparing_ticket":
      return pick(locale, {
        en: "Preparing your digital ticket…",
        ar: "جاري تجهيز تذكرتك الرقمية…",
      });
    case "confirmed_ready":
      return pick(locale, {
        en: "Present your booking code or QR at Smart Entry.",
        ar: "اعرض رمز الحجز أو رمز QR عند الدخول الذكي.",
      });
    case "active_visit":
      return pick(locale, {
        en: "Here are the details for your visit.",
        ar: "إليك تفاصيل زيارتك.",
      });
    case "failed":
      return pick(locale, {
        en: "You can retry payment for the same reservation while the hold remains active.",
        ar: "يمكنك إعادة محاولة الدفع لنفس الحجز طالما الحجز المؤقت ساري.",
      });
    case "cancelled":
      return pick(locale, {
        en: "This reservation is no longer active.",
        ar: "هذا الحجز لم يعد نشطًا.",
      });
    case "expired":
      return pick(locale, {
        en: "Please check availability again and start a new reservation.",
        ar: "يُرجى التحقق من التوفر مرة أخرى وبدء حجز جديد.",
      });
    default:
      return pick(locale, {
        en: "We’re updating the latest details for this reservation.",
        ar: "نقوم بتحديث أحدث تفاصيل هذا الحجز.",
      });
  }
}

export const statusCopy = {
  confirming: {
    en: "Confirming your reservation…",
    ar: "جاري تأكيد حجزك…",
  },
  preparingTicket: {
    en: "Your reservation is confirmed. Preparing your digital ticket…",
    ar: "تم تأكيد حجزك. جاري تجهيز تذكرتك الرقمية…",
  },
  networkTrouble: {
    en: "We’re having trouble refreshing your reservation status.",
    ar: "نواجه صعوبة في تحديث حالة حجزك.",
  },
  rateLimited: {
    en: "Please wait a moment before refreshing again.",
    ar: "يُرجى الانتظار قليلًا قبل التحديث مرة أخرى.",
  },
  notFound: {
    en: "We couldn’t find a booking with this reference.",
    ar: "تعذر العثور على حجز بهذا المرجع.",
  },
  referenceRequired: {
    en: "Booking reference required",
    ar: "مرجع الحجز مطلوب",
  },
  referenceRequiredBody: {
    en: "Open the link from your payment return, or start a new reservation from Book Now.",
    ar: "افتح الرابط بعد الدفع، أو ابدأ حجزًا جديدًا من صفحة الحجز.",
  },
  tryAgain: { en: "Try again", ar: "حاول مرة أخرى" },
  refresh: { en: "Refresh status", ar: "تحديث الحالة" },
  retryPayment: { en: "Retry Payment", ar: "إعادة محاولة الدفع" },
  startNew: { en: "Start a new reservation", ar: "بدء حجز جديد" },
  viewTicket: { en: "View Ticket", ar: "عرض التذكرة" },
  backHome: { en: "Back to Home", ar: "العودة للرئيسية" },
  bookAnother: {
    en: "Book Another Experience",
    ar: "احجز تجربة أخرى",
  },
  bookingCode: { en: "Booking Code", ar: "رمز الحجز" },
  bookingReference: { en: "Booking reference", ar: "مرجع الحجز" },
  total: { en: "Total", ar: "الإجمالي" },
  guests: { en: "Guests", ar: "الضيوف" },
  valid: { en: "Valid", ar: "ساري" },
  payment: { en: "Payment", ar: "الدفع" },
  emailNotice: {
    en: "A confirmation with your ticket details will also be sent by email when available.",
    ar: "سيتم إرسال تأكيد بتفاصيل تذكرتك عبر البريد الإلكتروني عند التوفر.",
  },
  qrLabel: {
    en: "Smart Entry QR for this booking",
    ar: "رمز QR للدخول الذكي لهذا الحجز",
  },
  preparingPayment: {
    en: "Preparing secure payment…",
    ar: "جاري تجهيز الدفع الآمن…",
  },
};

export function t(locale: ApiLocale, key: keyof typeof statusCopy): string {
  return pick(locale, statusCopy[key]);
}
