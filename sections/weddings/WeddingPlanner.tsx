"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  ApiLocale,
  WeddingAvailability,
  WeddingPackage,
} from "@/lib/api";
import { ApiError, getWeddingAvailability } from "@/lib/api";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "@/components/book-now/bookingMedia";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { runWeddingCheckout } from "./weddingCheckoutRunner";

interface WeddingPlannerProps {
  packages: WeddingPackage[];
  selectedPackageId: number | null;
  onSelectPackageId: (id: number) => void;
}

function moneyLabel(value: string, currency: string): string {
  const amount = parseMoney(value);
  if (amount == null) return value ? `${currency} ${value}`.trim() : "—";
  return formatMoneyAmount(amount, currency);
}

function guestRangeCopy(
  locale: ApiLocale,
  min: number,
  max: number
): string {
  return pickLocale(locale, WEDDING_COPY.planGuestMinMax)
    .replace("{min}", String(min))
    .replace("{max}", String(max));
}

export function WeddingPlanner({
  packages,
  selectedPackageId,
  onSelectPackageId,
}: WeddingPlannerProps) {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const selected = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState<string>("");
  const [availability, setAvailability] = useState<WeddingAvailability | null>(
    null
  );
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);
  const guestsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guestsNumber = Number.parseInt(guests, 10);
  const guestsValid =
    Number.isFinite(guestsNumber) &&
    selected != null &&
    guestsNumber >= selected.minimum_guests &&
    guestsNumber <= selected.maximum_guests;

  const canCheck = selected != null && Boolean(date) && guestsValid;

  const showGuestDetails = availability?.available === true && canCheck;

  const runAvailability = useCallback(
    async (pkg: WeddingPackage, weddingDate: string, guestCount: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++requestSeq.current;

      setAvailLoading(true);
      setAvailError(null);

      try {
        const result = await getWeddingAvailability(
          {
            wedding_package_id: pkg.id,
            wedding_date: weddingDate,
            guests: guestCount,
          },
          locale,
          { signal: controller.signal }
        );
        if (seq !== requestSeq.current) return;
        setAvailability(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (seq !== requestSeq.current) return;
        setAvailability(null);
        if (err instanceof ApiError) {
          setAvailError(err.message);
        } else {
          setAvailError(
            locale === "ar"
              ? "تعذر التحقق من التوافر. حاولوا مرة أخرى."
              : "Unable to check availability. Please try again."
          );
        }
      } finally {
        if (seq === requestSeq.current) setAvailLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    if (!selected || !date || !guestsValid) {
      abortRef.current?.abort();
      setAvailability(null);
      setAvailLoading(false);
      setAvailError(null);
      return;
    }

    const immediate = () => {
      void runAvailability(selected, date, guestsNumber);
    };

    if (guestsDebounceRef.current) clearTimeout(guestsDebounceRef.current);
    guestsDebounceRef.current = setTimeout(immediate, 300);

    return () => {
      if (guestsDebounceRef.current) clearTimeout(guestsDebounceRef.current);
    };
  }, [selected, date, guestsValid, guestsNumber, runAvailability]);

  useEffect(() => {
    if (selected && !guests) {
      setGuests(String(selected.minimum_guests));
    }
  }, [selected, guests]);

  async function onSecure(e: FormEvent) {
    e.preventDefault();
    if (!selected || !date || !guestsValid || !availability?.available) return;
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setCheckoutError(
        locale === "ar"
          ? "يرجى إكمال بيانات التواصل."
          : "Please complete your contact details."
      );
      return;
    }

    setCheckoutBusy(true);
    setCheckoutError(null);

    const result = await runWeddingCheckout({
      locale,
      payload: {
        wedding_package_id: selected.id,
        wedding_date: date,
        guests: guestsNumber,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        guest_phone: guestPhone.trim(),
      },
    });

    if (!result.ok) {
      setCheckoutBusy(false);
      setCheckoutError(result.error.message);
      if (result.error.kind === "validation" || result.error.status === 422) {
        void runAvailability(selected, date, guestsNumber);
      }
      return;
    }
  }

  const fieldStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "2px",
    color: "#F8F2E7",
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "var(--font-body)",
    colorScheme: "dark",
    outline: "none",
    transition: "border-color 180ms ease, background 180ms ease",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(248,242,231,0.55)",
    marginBottom: "10px",
  };

  return (
    <section
      id="plan"
      className="zones-section scroll-mt-24"
      aria-labelledby="wedding-plan-title"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 28%)",
      }}
    >
      <div className="zones-container">
        <motion.div
          className="max-w-2xl mb-10"
          initial={!prefersReduced ? { opacity: 0, y: 18 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.planEyebrow)}
          </p>
          <h2
            id="wedding-plan-title"
            className="zones-section-title mb-4"
            style={{
              color: "#F8F2E7",
              fontSize: "clamp(1.75rem, 3.2vw, 2.35rem)",
              lineHeight: 1.15,
            }}
          >
            {pickLocale(locale, WEDDING_COPY.planHeadline)}
          </h2>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "rgba(248,242,231,0.68)" }}
          >
            {pickLocale(locale, WEDDING_COPY.planSelectPrompt)}
          </p>
        </motion.div>

        {packages.length === 0 ? (
          <p role="status" style={{ color: "rgba(248,242,231,0.65)" }}>
            {pickLocale(locale, WEDDING_COPY.planCatalogEmpty)}
          </p>
        ) : (
          <motion.form
            onSubmit={onSecure}
            className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)] lg:gap-8 items-start"
            initial={!prefersReduced ? { opacity: 0, y: 20 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div
              className="space-y-7 p-5 sm:p-7"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                background:
                  "linear-gradient(165deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",
              }}
            >
              <div>
                <p style={labelStyle} id="wedding-package-label">
                  {pickLocale(locale, WEDDING_COPY.planPackage)}
                </p>
                <div
                  className="grid gap-2.5 sm:grid-cols-3"
                  role="radiogroup"
                  aria-labelledby="wedding-package-label"
                >
                  {packages.map((pkg) => {
                    const active = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onSelectPackageId(pkg.id)}
                        className="text-start px-3.5 py-3.5 transition-colors"
                        style={{
                          borderRadius: "2px",
                          border: active
                            ? "1px solid rgba(212,175,55,0.72)"
                            : "1px solid rgba(255,255,255,0.12)",
                          background: active
                            ? "rgba(212,175,55,0.1)"
                            : "rgba(0,0,0,0.18)",
                          color: "#F8F2E7",
                          boxShadow: active
                            ? "inset 0 0 0 1px rgba(212,175,55,0.18)"
                            : undefined,
                        }}
                      >
                        <span
                          className="block text-[13px] sm:text-[14px] leading-snug"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 500,
                          }}
                        >
                          {localizedName(pkg, locale)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wedding-date" style={labelStyle}>
                      {pickLocale(locale, WEDDING_COPY.planDate)}
                    </label>
                    <input
                      id="wedding-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={fieldStyle}
                      required
                      className="wedding-plan-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="wedding-guests" style={labelStyle}>
                      {pickLocale(locale, WEDDING_COPY.planGuests)}
                    </label>
                    <input
                      id="wedding-guests"
                      type="number"
                      inputMode="numeric"
                      min={selected.minimum_guests}
                      max={selected.maximum_guests}
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      style={fieldStyle}
                      required
                      aria-describedby="wedding-guests-hint"
                      className="wedding-plan-field"
                    />
                    <p
                      id="wedding-guests-hint"
                      className="mt-2 text-[13px]"
                      style={{ color: "rgba(248,242,231,0.5)" }}
                    >
                      {guestRangeCopy(
                        locale,
                        selected.minimum_guests,
                        selected.maximum_guests
                      )}
                    </p>
                  </div>
                </div>
              ) : null}

              <div
                className="pt-1"
                style={{
                  borderTop: "1px solid rgba(212,175,55,0.22)",
                }}
              >
                <p
                  className="pt-4 text-[12px] leading-relaxed"
                  style={{ color: "rgba(248,242,231,0.58)" }}
                >
                  <span style={{ color: "rgba(212,175,55,0.9)" }}>
                    {pickLocale(locale, WEDDING_COPY.premiumEyebrow)}
                    {": "}
                  </span>
                  {pickLocale(locale, WEDDING_COPY.premiumBody)}{" "}
                  <span style={{ color: "rgba(212,175,55,0.8)" }}>
                    {pickLocale(locale, WEDDING_COPY.premiumFloorNote)}
                  </span>
                </p>
              </div>

              {showGuestDetails ? (
                <div
                  className="space-y-4 pt-2"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="pt-5 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: "var(--zones-gold)" }}
                  >
                    {pickLocale(locale, WEDDING_COPY.planDetailsEyebrow)}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="wedding-guest-name" style={labelStyle}>
                        {pickLocale(locale, WEDDING_COPY.planGuestName)}
                      </label>
                      <input
                        id="wedding-guest-name"
                        type="text"
                        autoComplete="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        style={fieldStyle}
                        required
                        className="wedding-plan-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="wedding-guest-email" style={labelStyle}>
                        {pickLocale(locale, WEDDING_COPY.planGuestEmail)}
                      </label>
                      <input
                        id="wedding-guest-email"
                        type="email"
                        autoComplete="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        style={fieldStyle}
                        required
                        className="wedding-plan-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="wedding-guest-phone" style={labelStyle}>
                        {pickLocale(locale, WEDDING_COPY.planGuestPhone)}
                      </label>
                      <input
                        id="wedding-guest-phone"
                        type="tel"
                        autoComplete="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        style={fieldStyle}
                        required
                        className="wedding-plan-field"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <aside
              className="p-6 sm:p-7 lg:sticky lg:top-28"
              style={{
                border: "1px solid rgba(212,175,55,0.28)",
                borderRadius: "2px",
                background:
                  "linear-gradient(180deg, rgba(36,28,16,0.55), rgba(10,8,6,0.72))",
              }}
              aria-live="polite"
            >
              <p
                className="text-[11px] tracking-[0.18em] uppercase mb-5"
                style={{ color: "var(--zones-gold)" }}
              >
                {pickLocale(locale, WEDDING_COPY.planSummary)}
              </p>

              {!canCheck && !availLoading ? (
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "rgba(248,242,231,0.62)" }}
                >
                  {pickLocale(locale, WEDDING_COPY.planSelectPrompt)}
                </p>
              ) : null}

              {availLoading ? (
                <p
                  className="text-[14px]"
                  style={{ color: "rgba(248,242,231,0.72)" }}
                >
                  {pickLocale(locale, WEDDING_COPY.planChecking)}
                </p>
              ) : null}

              {availError ? (
                <p
                  role="alert"
                  className="text-[14px] leading-relaxed"
                  style={{ color: "rgba(240,170,140,0.95)" }}
                >
                  {availError}
                </p>
              ) : null}

              {availability && !availLoading ? (
                <div className="space-y-4">
                  {availability.available ? (
                    <p
                      className="text-[15px] font-medium"
                      style={{ color: "rgba(180,220,170,0.95)" }}
                    >
                      {pickLocale(locale, WEDDING_COPY.planAvailable)}
                    </p>
                  ) : (
                    <p
                      role="status"
                      className="text-[14px] leading-relaxed"
                      style={{ color: "rgba(240,200,160,0.95)" }}
                    >
                      {availability.reason ||
                        (locale === "ar"
                          ? "هذا التاريخ غير متاح."
                          : "This date is unavailable.")}
                    </p>
                  )}

                  {availability.is_premium_date ? (
                    <p
                      className="inline-block text-[10px] tracking-[0.16em] uppercase px-2.5 py-1"
                      style={{
                        color: "#0c0906",
                        background: "rgba(212,175,55,0.9)",
                        borderRadius: "999px",
                      }}
                    >
                      {pickLocale(locale, WEDDING_COPY.planPremiumBadge)}
                    </p>
                  ) : null}

                  {selected ? (
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: "rgba(248,242,231,0.7)" }}
                    >
                      {localizedName(selected, locale)}
                      {date ? ` · ${date}` : ""}
                      {guestsValid ? ` · ${guestsNumber}` : ""}
                    </p>
                  ) : null}

                  <div
                    className="space-y-3 pt-1"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "16px",
                    }}
                  >
                    <div
                      className="flex justify-between gap-4 text-sm"
                      style={{ color: "rgba(248,242,231,0.68)" }}
                    >
                      <span>
                        {pickLocale(locale, WEDDING_COPY.planPricePerGuest)}
                      </span>
                      <span style={{ color: "#F8F2E7" }}>
                        {moneyLabel(
                          availability.price_per_guest ||
                            selected?.price_per_guest ||
                            "",
                          availability.currency || selected?.currency || ""
                        )}
                      </span>
                    </div>

                    {availability.available && availability.total_estimate ? (
                      <div className="flex justify-between items-end gap-4">
                        <span
                          className="text-sm"
                          style={{ color: "rgba(248,242,231,0.68)" }}
                        >
                          {pickLocale(locale, WEDDING_COPY.planEstimate)}
                        </span>
                        <span
                          style={{
                            color: "var(--zones-gold)",
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(1.45rem, 2.4vw, 1.75rem)",
                            lineHeight: 1,
                            fontWeight: 500,
                          }}
                        >
                          {moneyLabel(
                            availability.total_estimate,
                            availability.currency || selected?.currency || ""
                          )}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {availability.is_premium_date ? (
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(212,175,55,0.85)" }}
                    >
                      {pickLocale(locale, WEDDING_COPY.premiumFloorNote)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {checkoutError ? (
                <p
                  role="alert"
                  className="mt-4 text-[14px] leading-relaxed"
                  style={{ color: "rgba(240,170,140,0.95)" }}
                >
                  {checkoutError}
                </p>
              ) : null}

              {showGuestDetails ? (
                <button
                  type="submit"
                  className="zones-btn-gold zones-radius-pill inline-flex w-full items-center justify-center h-12 mt-7 px-7 text-[12px] font-medium tracking-[0.14em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)] disabled:opacity-60 disabled:pointer-events-none"
                  disabled={checkoutBusy}
                >
                  {checkoutBusy
                    ? pickLocale(locale, WEDDING_COPY.planSecuring)
                    : pickLocale(locale, WEDDING_COPY.planSecure)}
                </button>
              ) : null}
            </aside>
          </motion.form>
        )}
      </div>

      <style jsx global>{`
        .wedding-plan-field:focus {
          border-color: rgba(212, 175, 55, 0.55) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
        .wedding-plan-field::-webkit-calendar-picker-indicator {
          filter: invert(0.85) sepia(0.35) saturate(2.2) hue-rotate(5deg);
          cursor: pointer;
          opacity: 0.85;
        }
      `}</style>
    </section>
  );
}
