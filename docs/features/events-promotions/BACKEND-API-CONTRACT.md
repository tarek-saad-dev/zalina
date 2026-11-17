# Unified Backend API Contract — Events & Promotions

**Audience:** Laravel API and CMS teams. **Contract state:** proposed by frontend PR #14; endpoint availability in Laravel is **not verified**.
**Canonical DTO sources:** `lib/promotions/domain.ts`, `lib/events/domain.ts`, `lib/api/booking-types.ts`. Long-form example payloads and constraints live in `EVENTS-API-HANDOFF.md`, `EVENT-BOOKING-API-HANDOFF.md` and `CMS-REQUIREMENTS.md`.

## 1. Ownership table / endpoint matrix

| HTTP method + path under /api/v1 | Auth | Response | Frontend consumer |
|---|---|---|---|
| GET `/promotions/active?path=/events` | Public | `PromotionCampaign[]` | `ZalinaPromotions` |
| GET `/events` | Public | `EventSummary[]` | `/events` |
| GET `/events/{slug}` | Public | `EventDetail` | `/events/{slug}` and checkout |
| GET `/events/{slug}/availability?occurrence_id=...` | Public | `EventAvailability` | package selector and checkout preflight |
| POST `/bookings` `product_type=event` | Public + throttling | `ApiBooking` | `EventCheckout` |
| POST `/bookings/{reference}/pay` | Existing booking permission | `{payment_url:string}` | checkout + status retry |
| GET `/bookings/{reference}` | Existing public reference policy | `ApiBooking` | booking status + polling |
| GET `/tickets/{booking_code}` | Existing protected ticket code policy | `BookingTicketLookup` | QR/ticket |
| /admin/events* and /admin/campaigns* | Authenticated RBAC | Admin DTO/envelopes | Separate CMS developer |
| /admin/audit-logs | Admin permission | Paginated audit log | Separate CMS developer |

Existing endpoint names for payments, bookings and tickets match current frontend. The public event and promotion endpoints and proposed admin endpoints are **new responsibilities** for backend.

## 2. Envelope, localization, errors, idempotency

All reads and writes maintain current API envelope:
```json
{ "success": true, "data": {} }
```
Error:
```json
{
  "success": false,
  "message": "The selected event package is sold out.",
  "errors": { "items.0.quantity": ["Only one package remains."] }
}
```

- Header `Accept-Language: ar|en`; include AR+EN content fields regardless of selected language so guest can switch locales without losing context.
- ISO-8601 with UTC offset, convert input Cairo date/time to UTC server storage, `DateTimeImmutable` / timezone-aware values.
- Monetary amounts are decimal **strings** with 2 fractional digits; `EGP` currency code, real rounding/discounts/taxes server-side.
- 400 malformed, 401 unauthenticated admin, 403 forbidden, 404 unknown/non-public, 409 sold-out or illegal state, 422 semantic/field validation, 429 throttled, 5xx unexpected; always emit `X-Request-Id`.
- Pagination only where agreed; the current `normalizeEventList` accepts `data: EventSummary[]` or `data: {items: EventSummary[]}`; `promotions/active` expects an array or `{campaigns|items}` inside the envelope.
- **Critical:** `POST /bookings` on timeout/5xx is ambiguous. Backend should implement a safe idempotency key bound to validated body+guest context; frontend currently intentionally blocks repeated automatic create until a definitive recovery is possible. A future idempotency header requires Next proxy allowlist/forwarding changes.
- Payment session initiation for a given reservation reference must be safe to retry. Reconcile duplicate/late provider webhooks idempotently.

## 3. Event and promotion state machines

**Event publish state:** draft → published → archived. Separately, effective sellability is `upcoming|open|sold_out|closed|cancelled` (based on occurrence, sale windows and stock), and the package has an independent enabled/sale state. Do not return draft events publicly.

**Campaign publication state:** draft → ready → published/paused/ended → archived; `enabled` switch and start/end timestamps independently constrain visibility. A scheduled campaign may be published and enabled without appearing before `starts_at`.

**Booking/payment state:** `pending_payment` → `paid` → `confirmed` → optional check-in/out and completion; `failed|cancelled|expired` branch by backend. No QR until verified payment and ticket issuance. A guest may retry a failed payment for the same unexpired hold, not duplicate booking stock.

Important: **Campaign OFF != Event cancelled != Event booking closed != Booking refunded**. Treat each as separate operations with scoped authorization and audit.

## 4. Effective public campaign filtering

Backend returns only visible campaigns filtered by:
1. `published && enabled`.
2. current instant within configured `[starts_at, ends_at)`.
3. page target (client sends locale-free path).
4. applicable device/segment target only if that targeting is shipped and consistently supplied.
5. authorized safe relative link; title_AR/EN and CTA_AR/EN must be present.

Sort `priority DESC, stable id`. Frontend independently enforces schedule/priority and chooses max one per placement. Public response excludes draft content and private audit metadata. Pause/expiry should clear caches, no stale active campaigns on open pages beyond polling interval and network latency.

## 5. Effective public event availability

- Resolve `slug -> event -> occurrence -> package`.
- Validate public visibility, start/end and sale windows, inventory resource pool, active holds and payment settlements.
- `remaining_units` in package units, not guests; `available` false when sale closed/capacity below required minimum.
- `unit_price` is the current backend-issued display quote. At `POST /bookings`, recalculate atomically and return authoritative `ApiBooking.total`.
- Prevent oversell on concurrent final-seat requests using transaction/row-level locks or an equivalent atomic inventory ledger.
- Automatic hold expiration releases allocation; late payments/refunds need defined reconciliation behavior.

## 6. Booking create contract

Client sends:
```json
{
  "product_type": "event",
  "event_occurrence_id": 701,
  "items": [{"event_package_id": 901, "quantity": 2}],
  "guests": 4,
  "guest_name": "Example Guest",
  "guest_email": "example@example.com",
  "guest_phone": "+201001234567"
}
```
Expected output `ApiBooking` as specified in `EVENT-BOOKING-API-HANDOFF.md`: reference, code, status, server `total`, currency, hold timestamps, valid_from/valid_to, payment state and optionally event snapshot fields. **Never** accept a client-supplied amount for the final total. Persist immutable package/name/unit-price snapshots, not references only.

Backend must reject a mismatched guest count (e.g. 2 couple bundles means 4 guests) rather than implicitly trust the client.

## 7. Public ticket and secure QR

- Booking returns an opaque `booking_code`; no public booking PII from GET reference.
- Ticket endpoint verifies confirmed/paid status and returns a `BookingTicketLookup`, including `event_title_ar/en`, booked package quantities and validity window where applicable.
- **Current frontend is one QR per booking**, independent of attendee count. For multi-admission scan logic, backend must track used admissions/count separately; per-person QR is a product enhancement requiring a new shared contract.
- QR possession alone must not authorize backend mutations or sensitive PII retrieval.

## 8. Integration signoff checklist

- [ ] All public endpoints match typed contracts and authenticated admin APIs match RBAC.
- [ ] Existing Day Use, Bubble Stay and Wedding V2 payloads/regressions unchanged.
- [ ] Publishing event and campaign in CMS independently updates public APIs.
- [ ] Expired or paused campaign is removed from active feed.
- [ ] Available/sold-out dates and package quantities correct under concurrent requests.
- [ ] Server price and hold expiry are authoritative.
- [ ] Paymob test checkout, retry, cancellation and late webhook tested on staging.
- [ ] Confirmed event displays booking status/ticket QR with no draft data or guest PII leaks.
- [ ] 409, 422, 429, 5xx errors follow documented envelope and trace IDs.
- [ ] English/Arabic locale and Cairo date boundaries validated.
- [ ] Migration, rollback, audit and support runbook reviewed by backend/CMS owners.
