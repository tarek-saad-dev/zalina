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

  const canCheck =
    selected != null && Boolean(date) && guestsValid;

  const showGuestDetails =
    availability?.available === true && canCheck;

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

    // Package/date: immediate. Guest count: debounce.
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
    // Redirect in progress — keep busy state.
  }

  const fieldStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "4px",
    color: "#F8F2E7",
    padding: "12px 14px",
    fontSize: "15px",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "rgba(248,242,231,0.55)",
    marginBottom: "8px",
  };

  return (
    <section
      id="plan"
      className="zones-section scroll-mt-24"
      aria-labelledby="wedding-plan-title"
    >
      <div className="zones-container">
        <div className="max-w-2xl mb-8">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.planEyebrow)}
          </p>
          <h2
            id="wedding-plan-title"
            className="zones-section-title mb-4"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.planHeadline)}
          </h2>
        </div>

        <div
          className="mb-10 max-w-2xl"
          style={{
            borderTop: "1px solid rgba(212,175,55,0.25)",
            paddingTop: "20px",
          }}
        >
          <p
            className="text-[11px] tracking-[0.22em] uppercase mb-2"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.premiumEyebrow)}
          </p>
          <h3
            className="mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              color: "#F8F2E7",
              fontWeight: 400,
            }}
          >
            {pickLocale(locale, WEDDING_COPY.premiumHeadline)}
          </h3>
          <p
            className="text-[14px] leading-relaxed mb-2"
            style={{ color: "rgba(248,242,231,0.68)" }}
          >
            {pickLocale(locale, WEDDING_COPY.premiumBody)}
          </p>
          <p
            className="text-[13px]"
            style={{ color: "rgba(212,175,55,0.85)" }}
          >
            {pickLocale(locale, WEDDING_COPY.premiumFloorNote)}
          </p>
        </div>

        {packages.length === 0 ? (
          <p role="status" style={{ color: "rgba(248,242,231,0.65)" }}>
            {pickLocale(locale, WEDDING_COPY.planCatalogEmpty)}
          </p>
        ) : (
          <form
            onSubmit={onSecure}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="wedding-package" style={labelStyle}>
                  {pickLocale(locale, WEDDING_COPY.planPackage)}
                </label>
                <select
                  id="wedding-package"
                  value={selectedPackageId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (Number.isFinite(id)) onSelectPackageId(id);
                  }}
                  style={fieldStyle}
                  required
                >
                  <option value="" disabled>
                    —
                  </option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {localizedName(pkg, locale)}
                    </option>
                  ))}
                </select>
              </div>

              {selected ? (
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
                  />
                </div>
              ) : null}

              {selected && date ? (
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
                  />
                  <p
                    id="wedding-guests-hint"
                    className="mt-2 text-sm"
                    style={{ color: "rgba(248,242,231,0.55)" }}
                  >
                    {guestRangeCopy(
                      locale,
                      selected.minimum_guests,
                      selected.maximum_guests
                    )}
                  </p>
                </div>
              ) : null}

              {showGuestDetails ? (
                <div className="space-y-4 pt-2">
                  <div>
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
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <aside
              className="p-6"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.03)",
                alignSelf: "start",
              }}
              aria-live="polite"
            >
              <p
                className="text-[11px] tracking-[0.18em] uppercase mb-4"
                style={{ color: "var(--zones-gold)" }}
              >
                {pickLocale(locale, WEDDING_COPY.planSummary)}
              </p>

              {!canCheck && !availLoading ? (
                <p style={{ color: "rgba(248,242,231,0.6)", fontSize: "14px" }}>
                  {pickLocale(locale, WEDDING_COPY.planSelectPrompt)}
                </p>
              ) : null}

              {availLoading ? (
                <p style={{ color: "rgba(248,242,231,0.7)", fontSize: "14px" }}>
                  {pickLocale(locale, WEDDING_COPY.planChecking)}
                </p>
              ) : null}

              {availError ? (
                <p role="alert" style={{ color: "rgba(240,170,140,0.95)", fontSize: "14px" }}>
                  {availError}
                </p>
              ) : null}

              {availability && !availLoading ? (
                <div className="space-y-3">
                  {availability.available ? (
                    <p
                      style={{
                        color: "rgba(180,220,170,0.95)",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      {pickLocale(locale, WEDDING_COPY.planAvailable)}
                    </p>
                  ) : (
                    <p
                      role="status"
                      style={{ color: "rgba(240,200,160,0.95)", fontSize: "14px", lineHeight: 1.6 }}
                    >
                      {availability.reason ||
                        (locale === "ar"
                          ? "هذا التاريخ غير متاح."
                          : "This date is unavailable.")}
                    </p>
                  )}

                  {availability.is_premium_date ? (
                    <p
                      className="text-[11px] tracking-[0.14em] uppercase"
                      style={{ color: "var(--zones-gold)" }}
                    >
                      {pickLocale(locale, WEDDING_COPY.planPremiumBadge)}
                    </p>
                  ) : null}

                  {selected ? (
                    <p style={{ color: "rgba(248,242,231,0.7)", fontSize: "14px" }}>
                      {localizedName(selected, locale)}
                      {date ? ` · ${date}` : ""}
                      {guestsValid ? ` · ${guestsNumber}` : ""}
                    </p>
                  ) : null}

                  <div
                    className="flex justify-between gap-4 text-sm"
                    style={{ color: "rgba(248,242,231,0.7)" }}
                  >
                    <span>{pickLocale(locale, WEDDING_COPY.planPricePerGuest)}</span>
                    <span style={{ color: "#F8F2E7" }}>
                      {moneyLabel(
                        availability.price_per_guest || selected?.price_per_guest || "",
                        availability.currency || selected?.currency || ""
                      )}
                    </span>
                  </div>
                  {availability.available && availability.total_estimate ? (
                    <div
                      className="flex justify-between gap-4 text-sm"
                      style={{ color: "rgba(248,242,231,0.7)" }}
                    >
                      <span>{pickLocale(locale, WEDDING_COPY.planEstimate)}</span>
                      <span
                        style={{
                          color: "var(--zones-gold)",
                          fontFamily: "var(--font-display)",
                          fontSize: "1.35rem",
                        }}
                      >
                        {moneyLabel(
                          availability.total_estimate,
                          availability.currency || selected?.currency || ""
                        )}
                      </span>
                    </div>
                  ) : null}

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
                  className="mt-4"
                  style={{ color: "rgba(240,170,140,0.95)", fontSize: "14px" }}
                >
                  {checkoutError}
                </p>
              ) : null}

              {showGuestDetails ? (
                <button
                  type="submit"
                  className="zones-btn-gold w-full mt-6 justify-center"
                  disabled={checkoutBusy}
                >
                  {checkoutBusy
                    ? pickLocale(locale, WEDDING_COPY.planSecuring)
                    : pickLocale(locale, WEDDING_COPY.planSecure)}
                </button>
              ) : null}
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
