# Zalina Events — Booking V2 + Payment + Ticket Backend Handoff

**Status:** PROPOSED contract implemented by the Next.js **frontend only** on `feat/events-promotions-phase1`. Laravel / CMS support is pending and NOT part of this PR. This document is intended for the separate backend and CMS development teams.

## Ownership and integration boundary

- Frontend: `/ar|en/events`, `/ar|en/events/{slug}`, `/ar|en/events/{slug}/book` (guest → review → hold → payment redirect), existing `/booking/{reference}` status/recovery and digital ticket screens, error/expired/failed states and safe local demo.
- Backend: authoritative event/package catalog, occurrence-level inventory, booking holds, server pricing, payment initiation/webhook reconciliation, confirmation, QR/ticket issuance and lifecycle.
- CMS: edit/publish events, occurrences/packages/media, sale windows, capacities, cancel/close, and promotion campaigns independently. CMS cannot directly mark an unpaid booking paid.
- **No production event payment is possible until the backend returns the exact DTOs documented here.**

## Existing API conventions (reuse, do not duplicate)

Existing frontend `lib/api/client.ts` expects `{ "success": true, "data": ... }`, and raises `ApiError` with HTTP status, field errors, message and `X-Request-Id`.
Keep the currently documented Booking V2 endpoints:
- `POST /api/v1/bookings`
- `POST /api/v1/bookings/{booking_reference}/pay`
- `GET /api/v1/bookings/{booking_reference}`
- `GET /api/v1/tickets/{booking_code}`

Do NOT create a second payment stack or add client-provided totals/Paymob callback URLs.

## 1. Create event booking/temporary hold

**`POST /api/v1/bookings`** with `Content-Type: application/json`, `Accept-Language: ar|en`.

```json
{
  "product_type": "event",
  "event_occurrence_id": 701,
  "items": [
    { "event_package_id": 901, "quantity": 2 }
  ],
  "guests": 4,
  "guest_name": "Example Guest",
  "guest_email": "example@example.com",
  "guest_phone": "+201001234567"
}
```

- `event_occurrence_id`: positive integer; must belong to a published event with open booking window.
- `items[]`: at least one line; positive package IDs, quantities within min/max, package belongs to event, no repeated ID (or reject duplicates).
- `guests`: derived from `SUM(quantity * guests_per_unit)`, independently validated server-side. `per_person` always uses guests_per_unit=1; `per_package` may be 2, 4, etc.
- Guest name 2–120 characters; email RFC-appropriate, max 254; phone supported international format, length and normalization.
- No `total`, `price`, `payment_url`, `return_url`, `accommodation_id`, `check_in`, `experiences` or add-ons are supplied by the frontend.
- Calculate actual price and apply promotions/taxes/server fees, validate inventory and create a time-bound hold inside a DB transaction with row locks or a robust atomic allocation.
- Booking creation must not charge the user. Empty/expired/closed event returns error, never a valid hold.
- Implement server-supported **Idempotency-Key** or equivalent for retry safety before launch. The current Next.js proxy `app/api/v1/[...path]/route.ts` forwards limited headers, so it must explicitly forward any future idempotency header safely; don't claim idempotency is already shipped.

### Expected successful create response

Existing envelope convention with `data` containing a booking:

```json
{
  "success": true,
  "data": {
    "booking_reference": "ZAL-EXAMPLE-001",
    "booking_code": "EXAMPLE-QR-CODE",
    "product_type": "event",
    "status": "pending_payment",
    "operational_status": null,
    "total": "4400.00",
    "currency": "EGP",
    "guests": 4,
    "hold_expires_at": "2026-12-01T10:15:00+02:00",
    "payment_expires_at": "2026-12-01T10:15:00+02:00",
    "valid_from": "2026-12-24T19:00:00+02:00",
    "valid_to": "2026-12-25T01:00:00+02:00",
    "checked_in_at": null,
    "checked_out_at": null,
    "created_at": "2026-12-01T10:00:00+02:00",
    "bubbles": [],
    "payment": { "status": "pending" },
    "tickets_count": 0,
    "tickets": [],
    "event_occurrence_id": 701,
    "event_slug": "christmas-night",
    "event_title_ar": "ليلة الكريسماس في زالينا",
    "event_title_en": "Christmas Night at Zalina",
    "event_items": [
      {
        "event_package_id": 901,
        "name_ar": "تجربة الثنائي",
        "name_en": "Couple Experience",
        "quantity": 2,
        "guests_per_unit": 2,
        "unit_price": "2200.00",
        "line_total": "4400.00"
      }
    ]
  }
}
```

The example references/ticket-code are **illustrative schema data, not real bookings**. In production use unpredictable unguessable references and tickets. `booking_code` is generated on server and is **not proof of payment** while the booking is still pending.

**Keep optional `event_*` snapshot fields available on both create and public lookup.** Existing frontend normalization tolerates them being absent, but the confirmation page cannot show the exact event/package without them.

Server-held amount is authoritative. Frontend shows this amount at the separate payment-confirmation stage before calling `/pay`. If it differs from catalog estimate, show the server amount and require the guest to click Continue to payment.

## 2. Payment initiation (reuse existing endpoint)

`POST /api/v1/bookings/{booking_reference}/pay`

```json
{ "gateway": "paymob" }
```

Backend returns `{ "success": true, "data": { "payment_url": "https://..." } }`.

- Reusing a valid pending booking should re-use or safely renew the same payment session without creating another booking or stock hold.
- Payment_url must be an HTTPS URL of an allowlisted payment provider (except explicit local-only dev mocks).
- Return from provider to `/{locale}/booking/{booking_reference}` (or `/{locale}/booking` as a fallback for session handoff).
- No frontend claim of payment success based solely on `/pay` or browser redirect.
- Backend must authenticate payment gateway webhook signature, process it idempotently, atomically transition to paid/confirmed, and issue QR ticket only after verified success.
- On failure, allow retry while hold is active. On expiry, release event allocation and block payment retries for that hold.
- Respect the existing frontend `NEXT_PUBLIC_PAYMENT_GATEWAY` configuration, which can explicitly be `mock` or `paymob`. Never infer payment success from this setting.

## 3. Booking status (reuse existing polling page)

`GET /api/v1/bookings/{booking_reference}`.

Public response should OMIT guest PII and payment details, and return booking fields/snapshots required by `ApiBooking`. The client understands these status transitions:

`pending_payment` → `paid` → `confirmed`
and error paths `failed`, `cancelled`, `expired`.

Status polling is implemented by the existing `BookingStatusPage`, which shows a ticket only after a confirmed/ticket-ready state. Preserve existing `day_use`, `bubble_stay` and `wedding` behavior.

## 4. Digital ticket / QR

`GET /api/v1/tickets/{booking_code}`. Existing booking-level QR model is **one booking → one booking_code → one ticket/QR**. If the business requires one per participant, that is a backend/UX contract change requiring a separate decision; do not silently issue attendee-specific QR codes.

Event lookup supports:
```json
{
  "booking_code": "EXAMPLE-QR-CODE",
  "booking_reference": "ZAL-EXAMPLE-001",
  "product_type": "event",
  "status": "confirmed",
  "payment_status": "paid",
  "guests": 4,
  "valid_from": "2026-12-24T19:00:00+02:00",
  "valid_to": "2026-12-25T01:00:00+02:00",
  "checked_in_at": null,
  "checked_out_at": null,
  "bubbles": [],
  "event_occurrence_id": 701,
  "event_slug": "christmas-night",
  "event_title_ar": "ليلة الكريسماس في زالينا",
  "event_title_en": "Christmas Night at Zalina",
  "event_items": [
    { "event_package_id": 901, "name_ar": "تجربة الثنائي", "name_en": "Couple Experience", "quantity": 2 }
  ],
  "total": "4400.00",
  "currency": "EGP"
}
```

Ticket lookup must be rate-limited and protect sensitive data. The public QR alone must NOT enable changes, purchases, refunds or access to unrelated personal data.

## 5. Errors, transaction safety and retry UX

| Endpoint | Code / case | Frontend behavior | Backend expectation |
|---|---|---|---|
| `/events/{slug}/availability` | unavailable/timeout | No CTA, retry check | No invented stock |
| `POST /bookings` | 409 inventory conflict | Show sold-out and refresh | No hold created |
| `POST /bookings` | 422 invalid guest/quantity/date | Show field errors | Structured `errors` |
| `POST /bookings` | 429 | Show rate-limit | Safe throttling |
| `POST /bookings` | network / 5xx ambiguous | **Do not auto-recreate**; explain uncertainty | Idempotency/recovery needed before production launch |
| `POST /bookings/{reference}/pay` | 409 already paid | Go to booking status | Avoid duplicate charge |
| `POST /bookings/{reference}/pay` | 422 expired | Show expired; block payment | Release capacity |
| `POST /bookings/{reference}/pay` | 429 / 5xx | Retry **same booking** | Initiate idempotently |
| `GET /bookings/{reference}` | paid not yet confirmed | Show waiting state | Wait for webhook |
| `GET /tickets/{code}` | not issued yet | Preparing ticket state | Don't create QR before confirmation |

Never promise/issue a real ticket from fixture states. Frontend demo shows explicit “NO BOOKING / NO PAYMENT” labels.

## 6. Frontend implementation inventory

- `lib/events/checkout.ts`: validation, price estimate, hold countdown and redirect security.
- `components/events/EventCheckout.tsx`: guest/review/pay states; demo previews; unknown-creation recovery.
- `app/[locale]/events/[slug]/book/page.tsx`: route and safe query binding.
- `lib/api/booking-types.ts`: event variant added to Booking V2 discriminated union.
- `lib/api/bookings.ts`: `createEventBooking`, reuses `postBooking()`.
- `lib/api/adapters.ts`: optional `event_*` fields and snapshots on booking/ticket normalization.
- `components/book-now/paymentHandoffStorage.ts`: event type accepted in safe PII-free session handoff.
- `components/booking-status/BookingDetails.tsx`, `DigitalTicket.tsx`, `bookingStatusCopy.ts`, `BookingStatusPage.tsx`: event details, QR and repeat booking paths.
- `components/promotions/ZalinaPromotions.tsx`: suppress all promotions during event checkout.
- `lib/events/checkout.test.ts`: pure domain checks, no live payments.

**Integration blockers:** Laravel implementation and live API E2E checks remain outside the frontend team's ownership. **Next release gate:** CI typecheck, tests, mobile/RTL and existing booking regression checks.
