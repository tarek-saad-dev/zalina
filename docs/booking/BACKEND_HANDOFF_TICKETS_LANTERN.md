# Zalina — Booking Tickets & Lantern Add-on | Backend Handoff v1

**Scope:** Day Use (existing), Observatory Experience (new bundle), Cabin Stay (guest-facing rename of Bubble Stay), optional Lantern add-on. **Frontend branch:** `codex/issue-15`. **Issue:** #15. All examples are **contracts to implement**, not claims about a live API.

## 1. Critical compatibility guardrails

- Production frontend currently uses V2 `GET /api/v1/day-use`, `POST /api/v1/bookings`, `POST /api/v1/bookings/{reference}/pay`, and booking/status/QR lookup. Preserve those exact routes and Paymob integration.
- Existing Day Use booking payload is `{product_type: "day_use",day_use_product_id,visit_date,guests,guest_name,guest_email,guest_phone}`. **Do not make any new field required** for this existing product. Server controls all totals. Keep `day_use_product_id` numeric, not slug or guessed ID.
- Existing V2 explicitly blocks old V1 booking fields `add_ons`, `experiences`, `accommodation_id`, `check_in_date`, `check_out_date`. Do **not** reintroduce `add_ons` into the V2 payload. New optional field specified below: `ticket_add_ons`.
- Existing Cabin/Bubble Stay uses `product_type: "bubble_stay"`, date/capacity/inventory checks, and `price_per_night`. **Keep internal enum and existing booking records unchanged** while migrating guest-facing labels. Cabin Stay stays Coming Soon in frontend until actual per-guest pricing support and availability is confirmed.
- No fake static prices, hardcoded Observatory product IDs, double Day Use charge, automatic selection of Lantern or changes to already-paid bookings.

## 2. GET /api/v1/day-use — extend existing catalog (non-breaking)

Support optional `ticket_category` and `included_features` on active catalog rows. If the field is absent, frontend treats the row as ordinary Day Use only. For Observatory, send the explicit category. Example:

```json
{
  "data": [
    {"id": 100, "slug": "day-use", "ticket_category": "day_use", "name_en": "Day Use", "name_ar": "الاستخدام اليومي", "description_en": "...", "description_ar": "...", "price_per_guest": "<configured amount>", "currency": "EGP", "is_active": true},
    {"id": 101, "slug": "observatory-experience", "ticket_category": "observatory_experience", "name_en": "Observatory Experience", "name_ar": "تجربة المرصد", "description_en": "...", "description_ar": "...", "price_per_guest": "<configured amount>", "currency": "EGP", "is_active": true,
     "included_features": [{"name_en": "Day Use access", "name_ar": "يشمل الاستخدام اليومي"}]}
  ]
}
```

**Note:** example IDs, currency, and labels above are placeholders. Replace with real configured data. The exact Observatory benefits **beyond Day Use** must be supplied and approved by the business team, not invented in frontend. The Observatory `price_per_guest` is the **all-in bundle price**. Buying Observatory means *one* Day Use-family booking with `day_use_product_id=101`, **not** a separate Day Use booking, and without adding Day Use price twice.

**Availability:** only advertise `is_active=true` once real booking/guest-limit/date rules are enforced. Backend must reject mismatched/disabled product IDs on create, with HTTP 422. Apply same min date restriction as existing website (currently 2026-12-01; eventually ideally driven by API).

## 3. GET /api/v1/ticket-add-ons — NEW public bookable catalog

**Important:** `GET /api/v1/add-ons` is currently CMS/marketing content and is **not** accepted as a booking line. Implement a separate endpoint with explicit checkout capability; do not expose Lantern as payable until the entire create→pay→confirmation path is complete.

```json
{
  "data": [
    {"id": 201, "code": "lantern", "name_en": "Lantern Add-on", "name_ar": "إضافة الفانوس", "price_per_guest": "<configured amount>", "currency": "EGP", "is_active": true, "checkout_enabled": true,
      "supported_tickets": ["day_use", "observatory_experience", "cabin_stay"]}
  ]
}
```

- Required fields for a bookable Lantern: positive numeric `id`, exact `code: lantern`, bilingual names, numeric `price_per_guest >= 0`, `currency`, `is_active: true`, **`checkout_enabled: true`**, nonempty `supported_tickets` with canonical ticket codes.
- Frontend fetches without authentication via Next.js API proxy, uses `cache: no-store` and fails closed on 404/timeouts/malformed responses: UI remains visible but not selectable.
- `currency` must match chosen base ticket; never mix currencies in displayed estimate or backend total. CMS owners manage availability and prices; inactive add-ons are invisible to booking submissions.
- Lantern is optional, never preselected. **Quantity equals the number of ticket guests** (per-guest add-on). If guest count changes, the quantity changes at submit time. The same per-guest add-on is never double-charged per ticket, per guest, or per night.

## 4. POST /api/v1/bookings — additive optional V2 field

Legacy Day Use without Lantern **must remain byte-shape compatible**:

```json
{"product_type":"day_use","day_use_product_id":100,"visit_date":"2026-12-20","guests":2,"guest_name":"Example Guest","guest_email":"guest@example.com","guest_phone":"+201000000000"}
```

Observatory with Lantern (same `product_type: day_use`, different catalog product ID):

```json
{"product_type":"day_use","day_use_product_id":101,"visit_date":"2026-12-20","guests":2,"guest_name":"Example Guest","guest_email":"guest@example.com","guest_phone":"+201000000000","ticket_add_ons":[{"id":201,"quantity":2}]}
```

- `ticket_add_ons` is entirely optional and only sent if the user explicitly selects a **backend-enabled** Lantern catalog row.
- Validate row exists, active, checkout-enabled, allowed for the selected ticket category, correct visit date/availability, correct currency, positive guest count, non-duplicated ID, and `quantity === guests`. Reject invalid data with HTTP 422 and field-level `errors.ticket_add_ons` (or `ticket_add_ons.0.id` / `.quantity`).
- Use atomic DB transactions and locks; never trust submitted price, add-on title, currency or the frontend estimate. Calculate `ticket_total = price_per_guest * guests`; `lantern_total = configured_lantern_price_per_guest * guests`; `grand_total = ticket_total + lantern_total` plus only explicitly configured taxes/fees. Store price/currency snapshots in booking line items so old receipts are immutable after catalog price changes.
- `POST /bookings` still returns existing `booking_reference`, `booking_code`, `status`, `total`, `currency`, expiry timestamps and ticket/booking metadata. **Total is server-authoritative**, frontend compares it to the estimate.
- If you decide to add Lantern to Cabin Stay later, carry `ticket_add_ons` through the existing Bubble Stay payload with the same validation; frontend does not enable Cabin until price and availability contracts are agreed.

## 5. Cabin Stay (formerly Bubble Stay): open decision / required upgrade

Current production Bubble Stay contract prices per physical accommodation **per night**, while requested new customer-facing tickets are **per guest**. This is a business-logic change, not just a rename. Do not silently multiply `price_per_night` by guests.

Backend team must provide: (a) the canonical rate basis, e.g. `price_per_guest_per_night` versus one stay-wide `price_per_guest`, (b) expected number-of-nights multiplier, (c) rules for multiple cabins and age-specific guests if any, (d) capacity/inventory availability, (e) taxes/fees and `currency`. Return explicit pricing unit and itemized quote, and retain `bubble_stay` for backward-compatible records/routes until an agreed migration. Only then remove the Cabin Stay Coming Soon guard and expose booking.

## 6. Customer confirmation / tickets / admin

- Preserve `POST /bookings/{reference}/pay` + Paymob, webhook idempotency, statuses and one booking-level QR/Booking Pass ticket. No duplicated tickets/payments when Observatory includes Day Use.
- Booking/status/receipt/ticket lookup responses should include customer-facing `ticket_category`, selected ticket title, per-guest unit price, guest count, `ticket_add_ons` itemized qty/unit/total, and final total; avoid exposing guest PII on unauthenticated lookup.
- Dashboard: manage Day Use/Observatory active products, prices, bilingual features, cutoff/availability; manage Lantern price, active/checkout flag, supported ticket types. Save historical price snapshots on each booking.
- Incremental rollout: deploy backend support with `checkout_enabled=false`, verify create/pay/ticket in non-production, then set `checkout_enabled=true` and publish active Observatory product. **No real production booking/payment as a test**.

## 7. Acceptance test checklist — required before launch

1. Existing Day Use booking without add-on remains exact V2 shape and produces one paid booking and QR.
2. Observatory product explicitly categorized and active: lists only in Observatory, not ordinary Day Use; price equals all-in per-guest bundle; includes Day Use; one booking/charge/QR.
3. Inactive/missing Observatory catalog: visible Coming Soon, no payable CTA.
4. Lantern endpoint down/404/disabled, incorrect currency, bad price, wrong ticket or checkout_enabled=false: no add-on selection; no `ticket_add_ons` sent.
5. Lantern enabled and selected: price per guest × guests; adjust guests after selecting and verify quantity/total updated; unset -> field absent.
6. Server rejects invalid or forged add-on IDs, quantities, category/currency mismatch with 422 and does not create a hold/payment.
7. API total, booking reference, hold expiry, payment retry/idempotency, booking-status polling, QR/receipt and cancellation are unchanged.
8. Confirm AR/EN strings, RTL/mobile/desktop, accessibility, and no false 'paid' state.
9. Cabin Stay stays unavailable until per-guest pricing and inventory rules are agreed, implemented and tested.

## 8. Frontend integration map

- Catalog normalization: `lib/api/adapters.ts`, `lib/api/booking-types.ts`, `components/book-now/ticketProducts.ts`.
- Bookable Lantern API: `lib/api/ticket-add-ons.ts`, `components/book-now/useTicketAddOns.ts`.
- Selector and quantity/payload: `components/book-now/bookingSelectors.ts`, `components/book-now/useBookingState.ts`, `components/book-now/StepLanternAddOn.tsx`.
- Core Day Use checkout and payment pipeline intentionally reused: `components/book-now/useBookingCheckout.ts`, `bookingCheckoutRunner.ts`, `lib/api/bookings.ts`.
- New tests: `components/book-now/__tests__/ticket-options.test.ts`.
