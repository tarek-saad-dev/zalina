"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveBookingReference } from "./bookingRecovery";
import { BookingStatusError } from "./BookingStatusStates";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { t } from "./bookingStatusCopy";

/**
 * /booking entry — recovers reference from handoff storage when Paymob
 * returns to a generic landing without a path parameter.
 */
export function BookingRecoveryPage() {
  const router = useRouter();
  const locale = useBookingLocale();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const result = resolveBookingReference({ routeReference: null });
    if (result.reference) {
      router.replace(`/booking/${encodeURIComponent(result.reference)}`);
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="page-atmosphere" style={{ minHeight: "100vh" }}>
        <div style={{ padding: "64px 24px", textAlign: "center", color: "#F8F2E7" }}>
          …
        </div>
      </main>
    );
  }

  return (
    <main className="page-atmosphere" style={{ minHeight: "100vh" }}>
      <div
        className="mx-auto"
        style={{ maxWidth: "720px", padding: "64px 24px" }}
      >
        <BookingStatusError
          locale={locale}
          title={t(locale, "referenceRequired")}
          body={t(locale, "referenceRequiredBody")}
          secondaryHref="/book-now"
        />
      </div>
    </main>
  );
}
