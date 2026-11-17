# Zalina Events & Promotions — Delivery Contract (Phases 1–4)

Status: **Frontend phase 1 implemented on a feature branch; Laravel endpoints below are NOT verified as deployed.** This is the handoff contract, not a claim that the backend exists.

## Four delivery slices

1. **Campaign surfaces (frontend):** Global top bar below the existing fixed LuxuryNavbar and dismissible bottom floating card. Data comes from Laravel, without hard-coded promotions. AR/EN, device-responsive, priority, time window, safe internal links, local dismissal, checkout exclusions, graceful empty/error state.
2. **Laravel CMS:** Authenticated campaign CRUD, media, preview, enable/disable, priority, schedule, targeting, audit log, and public active endpoint. Only this step makes on/off work from the CMS.
3. **Event products and checkout:** Bookable events with occurrences, package inventory, prices and capacity, new Booking V2 product_type `event`, existing Paymob/payment + ticket/confirmation flow. No frontend-supplied pricing.
4. **Acceptance and production release:** Migrations/tests/API examples/permissions, complete E2E in both locales and on mobile, then staged rollout with rollback plan.

## Existing production-compatible frontend pieces

- `app/[locale]/layout.tsx` renders `LuxuryNavbar` and `ZalinaPromotions`.
- `components/promotions/ZalinaPromotions.tsx` renders the two layouts.
- `lib/promotions/api.ts` calls the same `apiFetchSafe` wrapper as other CMS endpoints, through `/api/v1`.
- `lib/promotions/domain.ts` validates unknown JSON and enforces safe URLs, schedule and priority.

## Phase 2 Laravel endpoint (required)

`GET /api/v1/promotions/active?path=/experiences`

- Public, `Accept-Language: ar|en`; response follows the existing `{ "success": true, "data": [...] }` envelope.
- `path` is a locale-free route path such as `/`, `/experiences` or `/weddings`. Backend validates it and matches per-page targeting. `*` means all public marketing routes.
- Includes only published, manually enabled, time-valid, approved and page-targeted campaigns.
- Never returns draft/paused/expired campaigns.
- Returns `[]` for no matching campaigns; no event is displayed.
- Explicit date-times have UTC offset (ISO 8601). Use Africa/Cairo to enter/schedule times in CMS and UTC in storage.
- Sort by `priority` descending then stable ID, without random ordering.
- Cache: no-store for active feed, or explicitly invalidated on Publish/Off. Do not cache until expiry beyond scheduled boundaries.

Example:

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

**Field rules:** `placements` accepts `top_bar`, `floating_card` or both; integer `priority` 0–10000; `display_delay_seconds` 0–30 (floating only); `dismiss_for_hours` 0–720; internal `cta_href` starts with a single `/` (no external targets in phase 1); all AR/EN titles and CTA labels required; `starts_at < ends_at` when both given; `image_url` HTTPS or local path. Public response excludes private campaign/internal data.

**Targeting:** per-page paths and optional device targeting should be evaluated by Laravel using a documented device signal or exposed in the response in phase 2. The phase 1 frontend submits the route for backend targeting and filters the returned campaigns by schedule and placement; it does NOT independently implement route or device targeting.

**Update propagation:** the frontend should re-fetch active campaigns at route changes and at least every 30 seconds while an open page stays active. Publisher-side cache must be invalidated on Off/Publish.

## Phase 2 CMS mutations (Sanctum, authorization required)

- `GET /api/v1/admin/campaigns` (filters: status, placement, date, search)
- `POST /api/v1/admin/campaigns` (create draft)
- `GET /api/v1/admin/campaigns/{id}` and `PATCH /api/v1/admin/campaigns/{id}`
- `POST /api/v1/admin/campaigns/{id}/publish` (validate content, CTA target, schedule)
- `POST /api/v1/admin/campaigns/{id}/pause` (immediately removed from public feed)
- `POST /api/v1/admin/campaigns/{id}/duplicate` (new disabled draft)
- `GET /api/v1/admin/campaigns/{id}/preview?locale=ar|en` (admin-only noindex; unpublished never leaked)
- `DELETE /api/v1/admin/campaigns/{id}` only for unused drafts; archive used campaigns.

The CMS must separate `draft / ready / scheduled / live / paused / ended` from `enabled` (manual switch). An enabled future campaign remains `scheduled`, and an ended campaign can never return as live without extending its schedule.

Require scoped Admin permissions and audit rows for create/edit/enable/pause/delete, validate media MIME+size, sanitize text, no HTML markup from user fields and no arbitrary executable URLs.

## Phase 3: independent bookable Events

Do **not** reuse `GET /experiences` as the booking inventory: `lib/api/catalog.ts` explicitly treats CMS Experiences as marketing content only. Do **not** force an event attendee to reserve a bubble stay.

Introduce:
- `events`: title/description/media/location/status, sell window
- `event_occurrences`: event session date/time, capacity
- `event_packages`: packages, price type, participant allocation, min/max, benefits
- `event_package_inventory` or inventory ledger per occurrence; no double booking
- Event lines in Booking V2, not a separate payment/confirmation service
- `GET /api/v1/events`, `GET /api/v1/events/{slug}`, `GET /api/v1/events/{slug}/availability`
- `POST /api/v1/bookings` with `product_type="event"`, occurrence ID and package quantities; existing `/bookings/{reference}/pay`, webhook, tickets.
- Server-only price calculation and capacity check with transaction/lock; time-limited holds and release on failed/expired payments. Booking/ticket item snapshots preserve booked title/price despite future CMS edits.
- Distinguish event enabled, booking open and campaign enabled.

## Phase 4 acceptance checklist

- [ ] Draft prepared and disabled; not visible publicly
- [ ] Manually publish, schedule, pause/off, re-enable, automatic expiry
- [ ] Both placements independently render in Arabic/English
- [ ] Priority resolves simultaneous campaigns deterministically
- [ ] No announcement obscures fixed navbar, mobile menu, checkout controls
- [ ] Close button persists for specified period; no stale card after campaign is paused
- [ ] Safe URL and media validation; unauthenticated admin mutations denied
- [ ] Out-of-stock packages cannot be booked; simultaneous final-seat orders do not oversell
- [ ] Failed and expired payments release holds; duplicate webhooks are idempotent
- [ ] Confirmed tickets only after verified payment
- [ ] Booking confirmation and payment recovery work with event product_type
- [ ] E2E deployment smoke test, error monitoring and rollback verified

## Ownership / blocker

The connected `tarek-saad-dev/zalina` repository contains the Next.js frontend and typed booking client. The Laravel CMS/DB repository has not been identified in the connected GitHub access. Backend endpoints and admin pages above therefore remain **pending**; the frontend deliberately shows no promotion until the real CMS API returns one.
