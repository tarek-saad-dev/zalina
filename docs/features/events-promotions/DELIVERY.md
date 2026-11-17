# Zalina Events & Promotions — Frontend-Complete Delivery Plan

**Owner:** Next.js frontend team.
**Target outcome:** Finish ALL guest-facing UX and frontend integration adapters without needing the Laravel backend or CMS to exist yet. Backend/CMS developers receive ready-to-implement, explicit contracts.
**Status:** Phase 1 promotion bar/card and Phase 2 public Event catalog/detail/package selector are implemented on the feature branch (automated/browser QA pending). Phase 3 Event Booking V2 and Phase 4 final QA/handoff remain outstanding.
**Explicitly out of scope for this frontend delivery:** Laravel migrations, CRUD implementation, real admin CMS screens, gateway/server-side pricing, inventory locks, webhook processing, backend deployment.

## Four execution steps — no separate wireframe or design phase

### 1. Complete frontend promotions system
- Global Top Bar below the actual fixed `LuxuryNavbar` and Bottom Floating Event Card in `app/[locale]/layout.tsx`.
- CSS/layout/mobile/RTL behavior, dismissal, placement selection, priority, collision rules, reduced-motion, route targeting, scheduling, error/empty/loading states, announcement exclusion in active booking/payment flows.
- Typed `PromotionCampaign` contract and API adapter, no hard-coded real campaign content.
- Self-contained **preview/mock mode** for frontend dev/testing only, explicitly disabled in production until CMS API supplies real records.
- Goal: both display modes work in AR/EN and browser tests.

### 2. Complete frontend event catalog, detail and package selection
- `/[locale]/events` index and `/[locale]/events/[slug]` event landing page.
- Hero/media, description, date/time/venue, schedule, available packages, inclusions, per-person/per-package pricing, dynamic quantity, availability, sold-out/closed/upcoming/cancelled states.
- Bookable events are independent from accommodations and CMS marketing `experiences`.
- Buttons route into the event checkout; changing language preserves event path and meaningful selection.
- Real typed API adapters and local deterministic **fixture** responses for development/screens/tests. No fake booking success.

**Phase 2 implemented files:**
- `app/[locale]/events/page.tsx` and `app/[locale]/events/[slug]/page.tsx`, with route-local loading/not-found screens.
- `components/events/EventsCatalog.tsx`, `EventDetailView.tsx` and `EventPackageSelector.tsx`.
- `lib/events/domain.ts`, `lib/events/api.ts`, `lib/events/fixtures.ts` and `lib/events/domain.test.ts`.
- `docs/features/events-promotions/EVENTS-API-HANDOFF.md`.
- `sections/home/LuxuryFooter.tsx` + localized footer messages for discovery.
- `ZALINA_EVENTS_DEMO=true` local server fixture switch, forcibly off in production.
- Event Checkout CTA remains intentionally disabled until Step 3. This is not a launched booking feature.

### 3. Complete frontend Event Booking V2 and payment states
- Event-only booking wizard integrated with existing common checkout patterns: choose occurrence and package(s), quantity, guests, details, review, server-priced estimate, create booking, hold countdown, initiate payment, redirect.
- Integrate with existing `/api/v1/bookings`, `/bookings/{reference}/pay`, and public booking status / QR ticket recovery screens.
- Extend client booking product type/normalizer/adapters/UI for `event` with backward compatibility for day_use, bubble_stay, wedding.
- Explicitly implement idle/loading/validation/sold-out/409/rate-limit/network/expired/paid/failed/cancelled/unknown/error states. Never trust client price.
- Payment success remains authoritative ONLY after backend confirmation. Fixtures simulate *responses* for preview/tests, not production payments.
- CTA from campaign `/events/[slug]` to selectable package to checkout to confirmation is navigable end-to-end in frontend demo mode.

### 4. Close frontend quality + handoff documentation
- Typecheck, unit/component/browser/mobile/RTL tests; accessibility/performance and checkout regression verification.
- Complete `docs/features/events-promotions/` handoff pack:
  - `FRONTEND-INTEGRATION.md` (routes, files, environmental toggles, integration sequence, contract owners)
  - `BACKEND-API-CONTRACT.md` (endpoints, detailed request/response/error examples, booking and ticket lifecycle, auth, availability, caching, idempotency, concurrency)
  - `CMS-REQUIREMENTS.md` (fields, screens, on/off rules, schedules, preview, targeting, priority, validation, permissions and audit)
  - `ACCEPTANCE.md` (test cases, state matrix, handoff checklist)
- Ready-to-merge frontend PR **only after** frontend tests pass. CMS/Backend work can begin independently from docs.
- Frontend is complete **without actual backend availability**; live events/bookings still require backend implementation and final integration testing.

## Architecture and constraints

- Source of truth: Laravel CMS/booking API, NOT frontend fixtures.
- `app/[locale]/layout.tsx` renders `LuxuryNavbar` and `ZalinaPromotions`.
- Existing `lib/api/client.ts` handles `/api/v1/*`, locale, envelopes and errors.
- Existing Booking V2 supports only `day_use`, `bubble_stay`, `wedding`; add `event` without breaking the three.
- Existing `lib/api/catalog.ts` states CMS experiences are marketing content **not** booking inventory.
- Existing status/recovery/payment screens should be reused/extended rather than duplicated.
- The connected GitHub repository contains the Next.js application; the Laravel CMS repository has not been identified.
- Never claim backend API or CMS is shipped as part of this PR.

## Contract starter: active campaigns

`GET /api/v1/promotions/active?path=/experiences` with `Accept-Language: en|ar`.

Expected envelope: `{ "success": true, "data": [<Campaign>] }`. Return `[]` when none. Backend applies enabled/published/schedule/page/targeting constraints.

```json
{
  "success": true,
  "data": [
    {
      "id": 41,
      "slug": "christmas-2026",
      "enabled": true,
      "placements": ["top_bar", "floating_card"],
      "priority": 90,
      "title_ar": "ليلة الكريسماس في زالينا",
      "title_en": "Christmas Night at Zalina",
      "description_ar": "تجربة استثنائية على النيل",
      "description_en": "An evening beside the Nile",
      "eyebrow_ar": "مناسبة خاصة",
      "eyebrow_en": "A SPECIAL EVENING",
      "cta_label_ar": "استكشف الباقات",
      "cta_label_en": "Explore Packages",
      "cta_href": "/events/christmas-2026",
      "image_url": "https://api.zalinaarabianvillage.com/storage/events/christmas.webp",
      "starts_at": "2026-12-01T10:00:00+02:00",
      "ends_at": "2026-12-25T23:59:00+02:00",
      "display_delay_seconds": 3,
      "dismiss_for_hours": 24
    }
  ]
}
```

- Placement enum: `top_bar`, `floating_card`; priority 0–10000; delay 0–30 seconds; dismissal 0–720 hours.
- Dates ISO-8601 with offset; schedule `starts_at < ends_at`.
- Public CTA links must be internal routes. Media URLs must be HTTPS or safe local paths.
- Frontend can be viewed without backend: absent endpoint returns no active promotion, and must never fabricate publicly live campaigns.
- Frontend must filter/validate untrusted results and suppress intrusive promotions in booking/payment screens.
- Poll/refresh after published status changes so admin OFF takes effect on open pages.

## CMS backend requirements summary

Protected (Sanctum, scoped permissions):
`GET /api/v1/admin/campaigns`,
`POST /api/v1/admin/campaigns`,
`GET /api/v1/admin/campaigns/{id}`,
`PATCH /api/v1/admin/campaigns/{id}`,
`POST /api/v1/admin/campaigns/{id}/publish`,
`POST /api/v1/admin/campaigns/{id}/pause`,
`POST /api/v1/admin/campaigns/{id}/duplicate`,
`GET /api/v1/admin/campaigns/{id}/preview?locale=ar|en`.

CMS must separate **event**, **event package**, **booking availability**, and **promotion campaign** states. Events remain bookable when a promotion is paused if the event's own booking window is open; stopping event sales does not silently modify paid reservations.

## Booking backend requirements summary

- `GET /api/v1/events`, `GET /api/v1/events/{slug}`, `GET /api/v1/events/{slug}/availability`.
- `POST /api/v1/bookings` with `product_type: "event"`, occurrence id, package ids + quantities, guest contact; backend validates, prices and atomically reserves.
- Reuse `POST /api/v1/bookings/{reference}/pay`, webhooks, tickets and confirmation flow.
- Store immutable booking item snapshots and honor hold expiry; use DB transactions/locking; avoid duplicate payment processing.
- Preserve existing booking APIs and types.

## Definition of frontend done

- [ ] Every customer-facing screen, state, navigation and UI control is implemented, in AR/EN and responsive.
- [ ] Backend and CMS data enter only through typed API adapters.
- [ ] A deterministic developer fixture/demo allows the entire frontend customer journey to be tested without Laravel.
- [ ] No hard-coded real campaign, price, availability or payment outcome in production.
- [ ] Typecheck, unit and integration tests pass; booking regression tests pass.
- [ ] Handoff documentation is sufficient for backend/CMS developers to implement without guessing frontend expectations.
- [ ] No backend/DB/CMS code changes, merges or deployments are falsely reported as part of this frontend work.
