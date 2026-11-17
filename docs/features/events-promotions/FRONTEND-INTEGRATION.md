# Frontend Integration Guide — Zalina Events & Promotions

**Repo:** `tarek-saad-dev/zalina`, PR #14, `feat/events-promotions-phase1`.
**Scope:** completed frontend implementation awaiting final browser QA + external Laravel integration; this is **not** proof that the CMS or backend routes are deployed.

## 1. Public routes and intended user flows

| Route | Purpose | Public data |
|---|---|---|
| `/{locale}/events` | Event catalog, status filters, cards | `GET /events` |
| `/{locale}/events/{slug}` | Hero, details, gallery, occurrences and packages | `GET /events/{slug}` |
| `/{locale}/events/{slug}/book?occurrence_id={id}&package_id={id}&quantity={n}` | Guest details, review, hold, pay | `GET /events/{slug}`, availability, `POST /bookings`, `POST /pay` |
| `/{locale}/booking/{reference}` | Post-gateway status/confirmation/retry/QR | Existing Booking V2 `GET /bookings/{reference}`, `GET /tickets/{code}` |
| `/{locale}/booking` | Payment return recovery without explicit reference | Existing session handoff, server lookup |
| All public pages via `app/[locale]/layout.tsx` | CMS promotion top bar + floating card | `GET /promotions/active?path=...` |

Supported locale paths: `/ar` (RTL) and `/en` (LTR). Footer includes an Events link. Event CTA from top bar or floating card points to relative `/events/{slug}`.

## 2. Frontend file ownership

| Files | Responsibility |
|---|---|
| `lib/promotions/domain.ts` | Campaign shape/safety/selection/scheduling |
| `lib/promotions/api.ts` | Active campaign read adapter |
| `components/promotions/ZalinaPromotions.tsx` | Layout placements, on/off refresh and dismissal |
| `lib/events/domain.ts` | Localized event shapes, normalization, statuses and formatting |
| `lib/events/api.ts` | Event list/detail/availability HTTP + safe developer fixture mode |
| `lib/events/checkout.ts` | Valid selection, guest data, estimated price, hold expiry |
| `components/events/EventsCatalog.tsx` | Search/filter-ready listing cards and empty/error states |
| `components/events/EventDetailView.tsx` | Event hero, details, venue, gallery and package section |
| `components/events/EventPackageSelector.tsx` | Occurrence/package quantities, stock, totals and booking CTA |
| `components/events/EventCheckout.tsx` | Three-step booking, pending/failed payment, local demo preview |
| `lib/api/{client,bookings,booking-types,adapters,payments}.ts` | Shared Booking V2 contract and existing gateway use |
| `components/booking-status/*` | Reused ticket/QR, booking confirmation and payment retry |

**Do not** re-introduce legacy V1 fields, use `/experiences` as bookable stock, or split payment across an unrelated new service. Existing `day_use`, `bubble_stay`, `wedding` routes remain supported.

## 3. Environment configuration

```env
# Backend origin for Next's server and browser proxy.
NEXT_PUBLIC_API_BASE_URL=https://api.zalinaarabianvillage.com

# Existing gateway selection. Never means that payment is approved.
NEXT_PUBLIC_PAYMENT_GATEWAY=paymob

# Development-only preview data. Explicitly forbidden in production.
ZALINA_EVENTS_DEMO=false
# Optional fake campaign layouts in development only.
NEXT_PUBLIC_ZALINA_PROMOTIONS_DEMO=false
```

The active `lib/api/client.ts` resolves `/api/v1/*`, locale, response envelope and errors. Browsers call the Next proxy; server components call the absolute host. Check the existing API proxy for forwarding allowed languages/headers and security controls before enabling an idempotency-key mechanism.

**Preview local:** set `NODE_ENV=development` and `ZALINA_EVENTS_DEMO=true`; `npm run dev`; open `http://localhost:3000/en/events`. Preview fixtures are in `lib/events/fixtures.ts` and represent **fictional event names, prices and availability**. The booking wizard's preview never creates a server booking, redirects to payment, or creates a valid QR. It is not a gateway sandbox.

**Production:** Demo always off even if the flag were set. Missing public API routes show a visible unavailable state, never fake prices/bookings.

## 4. Recommended integration order

1. Implement /events listing and event detail endpoint using `EVENTS-API-HANDOFF.md`. Verify both locales and public/draft data filtering.
2. Implement occurrence-level `/availability` with real server price and remaining units. Confirm no stale caching.
3. Implement Booking V2 `product_type=event`: transactionally allocate seats/packages, snapshot price, create timed pending hold, return booking reference/code, start expiry handling.
4. Extend existing `/bookings/{reference}/pay` to support event holds (same Paymob and webhook process).
5. Extend public booking status and ticket lookup snapshots. Confirm QR is issued **after verified payment**.
6. Implement CMS publishing, scheduling, media, targeting and audit from `CMS-REQUIREMENTS.md`.
7. Run `ACCEPTANCE.md` in staging using production-like inventory and a payment test gateway. Verify failure, retry and refund cases.
8. Merge approved frontend PR and deploy in controlled order only when backend is ready, or keep disabled/unpublished events until then.

## 5. Runtime behavior and graceful degradation

- Active promotions: fetch per locale/path, recheck approximately every 30 seconds on already-open pages; defensive client schedule, priority and dismissal. Floating card is scroll-gated to avoid first-screen hero interruption and suppressed on event details and all checkout/payment routes; top bar may remain on event details.
- Ignore unknown/invalid campaign payload fields; unsafe CTAs rejected. Promotion suppression in booking/payment routes.
- Event index: if API returns `[]`, show empty published events. If API is down, show `temporarily unavailable` instead.
- Event detail: invalid slug/404 is not-found; API outages render unavailable.
- Availability is fetched when occurrence changes and again before hold creation. It is only a quote/stock snapshot, not a guarantee.
- Checkout: frontend never sends a price or total to `POST /bookings`.
- 409 capacity conflict ⇒ refresh stock and ask the guest to choose again; 422 validation ⇒ display errors; 429 ⇒ ask to wait; network/5xx **ambiguous booking creation** ⇒ do not silently submit duplicate.
- Successful hold ⇒ display server amount and reference; initiate payment only on explicit guest action.
- Payment link must be secure HTTPS in production; never put card details into the frontend.
- Payment return status/QR must be queried from Laravel; a successful redirect alone is not confirmation.
- Browser session storage saves only payment handoff fields, no guest PII/card/payment URL; recovery is possible via server booking reference.

## 6. Contract verification examples (pseudo curl)

```sh
curl -H 'Accept: application/json' -H 'Accept-Language: ar' \
  'https://api.zalinaarabianvillage.com/api/v1/events'

curl -H 'Accept: application/json' -H 'Accept-Language: en' \
  'https://api.zalinaarabianvillage.com/api/v1/events/christmas-night/availability?occurrence_id=701'

curl -X POST -H 'Content-Type: application/json' \
  -d '{"product_type":"event","event_occurrence_id":701,"items":[{"event_package_id":901,"quantity":2}],"guests":4,"guest_name":"Test Guest","guest_email":"test@example.com","guest_phone":"+201001234567"}' \
  'https://api.zalinaarabianvillage.com/api/v1/bookings'
```

These are **examples only**; do not run production booking mutations against actual inventory during development. Use a staging DB and a sandbox payment gateway.

## 7. Release and rollback

- Frontend branch/PR remains separate from main until approved. No real backend/CMS credentials should be committed.
- First ship server endpoints behind controlled publication and empty events/feed; verify responses/caches.
- Enable one staging event and one campaign for AR/EN; run checkout, payment, booking recovery, QR on staging.
- Rollback: set campaigns enabled=false, close sale window on events if needed; revert Next frontend independently. **Never discard paid reservations** as part of a rollback.
- Monitor API 409/422/429/5xx, frontend request errors, abandoned holds, payment reconciliation and unpublished data leaks.
- Confirm CMS staff explicitly own prices, cancellation notices and capacity changes.
