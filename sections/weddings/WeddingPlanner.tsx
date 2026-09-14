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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type {
  ApiBooking,
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
import { WeddingDatePicker } from "./WeddingDatePicker";

interface WeddingPlannerProps {
  packages: WeddingPackage[];
  selectedPackageId: number | null;
  /** `embedded` = form only, for use inside the booking popup. */
  variant?: "section" | "embedded";
  onChangeExperience?: () => void;
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

function scrollToPackages() {
  document.getElementById("packages")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function WeddingPlanner({
  packages,
  selectedPackageId,
  variant = "section",
  onChangeExperience,
}: WeddingPlannerProps) {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const embedded = variant === "embedded";
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
  const [heldBooking, setHeldBooking] = useState<ApiBooking | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);
  const guestsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPackageIdRef = useRef<number | null>(null);

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
    if (!selected) {
      prevPackageIdRef.current = null;
      return;
    }

    const packageChanged = prevPackageIdRef.current !== selected.id;
    prevPackageIdRef.current = selected.id;
    if (!packageChanged) return;

    setHeldBooking(null);
    setCheckoutError(null);
    setGuests((prev) => {
      const n = Number.parseInt(prev, 10);
      if (
        !prev ||
        !Number.isFinite(n) ||
        n < selected.minimum_guests ||
        n > selected.maximum_guests
      ) {
        return String(selected.minimum_guests);
      }
      return prev;
    });
  }, [selected]);

  useEffect(() => {
    setHeldBooking(null);
  }, [date, guestsNumber]);

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
      existingBooking: heldBooking,
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
      if (result.booking) setHeldBooking(result.booking);
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

  const selectedPriceLabel = selected
    ? (() => {
        const amount = parseMoney(selected.price_per_guest);
        return amount == null
          ? selected.price_per_guest
          : formatMoneyAmount(amount, selected.currency);
      })()
    : "";

  const premiumSpendLabel =
    availability?.premium_date_minimum_spend &&
    (availability.currency || selected?.currency)
      ? moneyLabel(
          availability.premium_date_minimum_spend,
          availability.currency || selected?.currency || ""
        )
      : null;

  return (
    <section
      id={embedded ? undefined : "plan"}
      className={embedded ? undefined : "scroll-mt-24"}
      aria-labelledby={embedded ? undefined : "wedding-plan-title"}
      style={
        embedded
          ? undefined
          : {
              paddingTop: "28px",
              paddingBottom: "96px",
            }
      }
    >
      <div className={embedded ? undefined : "zones-container"}>
        {!embedded ? (
          <motion.div
            className="max-w-2xl mb-8"
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
          </motion.div>
        ) : null}

        {packages.length === 0 ? (
          <p role="status" style={{ color: "rgba(248,242,231,0.65)" }}>
            {pickLocale(locale, WEDDING_COPY.planCatalogEmpty)}
          </p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {!selected ? (
              embedded ? null : (
              <motion.div
                key="invite"
                initial={
                  !prefersReduced ? { opacity: 0, y: 12 } : { opacity: 1 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  !prefersReduced
                    ? { opacity: 0, y: -8 }
                    : { opacity: 0 }
                }
                transition={{ duration: prefersReduced ? 0 : 0.35 }}
                className="p-6 sm:p-8"
                style={{
                  border: "1px solid rgba(212,175,55,0.22)",
                  borderRadius: "2px",
                  background:
                    "linear-gradient(165deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012))",
                  maxWidth: "40rem",
                }}
                role="status"
              >
                <div
                  className="flex gap-4 items-start"
                  style={{ color: "rgba(248,242,231,0.72)" }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: "18px",
                      height: "18px",
                      marginTop: "3px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      border: "1px solid rgba(212,175,55,0.65)",
                      boxShadow: "inset 0 0 0 3px rgba(212,175,55,0.15)",
                    }}
                  />
                  <p className="text-[15px] leading-relaxed m-0">
                    {pickLocale(locale, WEDDING_COPY.planInvite)}
                  </p>
                </div>
              </motion.div>
              )
            ) : (
              <motion.form
                key="planner"
                onSubmit={onSecure}
                className={`grid gap-6 items-start ${
                  embedded
                    ? "grid-cols-1"
                    : "lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)] lg:gap-8"
                }`}
                initial={
                  !prefersReduced ? { opacity: 0, y: 16 } : { opacity: 1 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  !prefersReduced
                    ? { opacity: 0, y: -8 }
                    : { opacity: 0 }
                }
                transition={{ duration: prefersReduced ? 0 : 0.4 }}
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
                  <div
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                    style={{
                      borderBottom: "1px solid rgba(212,175,55,0.18)",
                      paddingBottom: "20px",
                    }}
                  >
                    <div>
                      <p style={labelStyle}>
                        {pickLocale(locale, WEDDING_COPY.yourExperience)}
                      </p>
                      <p
                        className="m-0 mb-1"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.35rem",
                          color: "#F8F2E7",
                          fontWeight: 500,
                        }}
                      >
                        {localizedName(selected, locale)}
                      </p>
                      <p
                        className="m-0 text-[14px]"
                        style={{ color: "rgba(248,242,231,0.68)" }}
                      >
                        <span style={{ color: "var(--zones-gold)" }}>
                          {selectedPriceLabel}
                        </span>
                        {" "}
                        {pickLocale(locale, WEDDING_COPY.perGuest)}
                      </p>
                      <p
                        className="m-0 mt-1 text-[13px]"
                        style={{ color: "rgba(248,242,231,0.55)" }}
                      >
                        {selected.minimum_guests}–{selected.maximum_guests}{" "}
                        {pickLocale(locale, WEDDING_COPY.guestsRange)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onChangeExperience) onChangeExperience();
                        else scrollToPackages();
                      }}
                      className="self-start sm:self-auto text-[12px] tracking-[0.14em] uppercase px-0 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
                      style={{
                        color: "rgba(212,175,55,0.95)",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(212,175,55,0.35)",
                        borderRadius: 0,
                        cursor: "pointer",
                      }}
                    >
                      {pickLocale(locale, WEDDING_COPY.changeExperience)}
                    </button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wedding-date" style={labelStyle}>
                        {pickLocale(locale, WEDDING_COPY.planDate)}
                      </label>
                      <WeddingDatePicker
                        id="wedding-date"
                        value={date}
                        onChange={setDate}
                        locale={locale}
                        required
                        fieldStyle={fieldStyle}
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

                  <div
                    className="p-4 sm:p-5"
                    style={{
                      border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: "2px",
                      background: "rgba(0,0,0,0.22)",
                    }}
                  >
                    <div className="flex gap-3 items-start">
                      <span
                        aria-hidden
                        style={{
                          width: "8px",
                          height: "8px",
                          marginTop: "6px",
                          flexShrink: 0,
                          borderRadius: "50%",
                          background: "rgba(212,175,55,0.85)",
                          boxShadow: "0 0 0 3px rgba(212,175,55,0.15)",
                        }}
                      />
                      <div>
                        <p
                          className="m-0 mb-1 text-[11px] tracking-[0.18em] uppercase"
                          style={{ color: "rgba(212,175,55,0.95)" }}
                        >
                          {pickLocale(locale, WEDDING_COPY.premiumEyebrow)}
                        </p>
                        {premiumSpendLabel &&
                        availability?.is_premium_date ? (
                          <p
                            className="m-0 text-[13px] leading-relaxed"
                            style={{ color: "rgba(248,242,231,0.78)" }}
                          >
                            {pickLocale(
                              locale,
                              WEDDING_COPY.premiumContextualSpend
                            ).replace("{amount}", premiumSpendLabel)}
                          </p>
                        ) : (
                          <>
                            <p
                              className="m-0 mb-2 text-[13px]"
                              style={{ color: "rgba(248,242,231,0.72)" }}
                            >
                              {pickLocale(locale, WEDDING_COPY.premiumHeadline)}
                            </p>
                            <p
                              className="m-0 text-[13px] leading-relaxed"
                              style={{ color: "rgba(248,242,231,0.62)" }}
                            >
                              {pickLocale(locale, WEDDING_COPY.premiumBody)}{" "}
                              <span style={{ color: "rgba(212,175,55,0.85)" }}>
                                {pickLocale(
                                  locale,
                                  WEDDING_COPY.premiumFloorNote
                                )}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
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
                          <label
                            htmlFor="wedding-guest-name"
                            style={labelStyle}
                          >
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
                          <label
                            htmlFor="wedding-guest-email"
                            style={labelStyle}
                          >
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
                          <label
                            htmlFor="wedding-guest-phone"
                            style={labelStyle}
                          >
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
                  className={`p-6 sm:p-7 ${embedded ? "" : "lg:sticky lg:top-28"}`}
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
                          style={{ color: "rgba(232,214,170,0.95)" }}
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
                            pickLocale(locale, WEDDING_COPY.planUnavailable)}
                        </p>
                      )}

                      {availability.is_premium_date ? (
                        <p
                          className="inline-block text-[10px] tracking-[0.16em] uppercase px-2.5 py-1"
                          style={{
                            color: "#0c0906",
                            background: "rgba(212,175,55,0.9)",
                            borderRadius: "2px",
                          }}
                        >
                          {pickLocale(locale, WEDDING_COPY.planPremiumBadge)}
                        </p>
                      ) : null}

                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "rgba(248,242,231,0.7)" }}
                      >
                        {localizedName(selected, locale)}
                        {date ? ` · ${date}` : ""}
                        {guestsValid ? ` · ${guestsNumber}` : ""}
                      </p>

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
                                selected.price_per_guest ||
                                "",
                              availability.currency || selected.currency || ""
                            )}
                          </span>
                        </div>

                        {availability.available &&
                        availability.total_estimate ? (
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
                                availability.currency || selected.currency || ""
                              )}
                            </span>
                          </div>
                        ) : null}

                        {premiumSpendLabel &&
                        availability.is_premium_date ? (
                          <p
                            className="text-[12px] leading-relaxed"
                            style={{ color: "rgba(212,175,55,0.85)" }}
                          >
                            {pickLocale(
                              locale,
                              WEDDING_COPY.premiumContextualSpend
                            ).replace("{amount}", premiumSpendLabel)}
                          </p>
                        ) : availability.is_premium_date ? (
                          <p
                            className="text-[12px] leading-relaxed"
                            style={{ color: "rgba(212,175,55,0.85)" }}
                          >
                            {pickLocale(locale, WEDDING_COPY.premiumFloorNote)}
                          </p>
                        ) : null}
                      </div>
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
                        : heldBooking
                          ? locale === "ar"
                            ? "إعادة محاولة الدفع"
                            : "Retry payment"
                          : pickLocale(locale, WEDDING_COPY.planSecure)}
                    </button>
                  ) : null}
                </aside>
              </motion.form>
            )}
          </AnimatePresence>
        )}
      </div>

      <style jsx global>{`
        .wedding-plan-field:focus {
          border-color: rgba(212, 175, 55, 0.55) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
      `}</style>
    </section>
  );
}
