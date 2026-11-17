# Zalina CMS — Events & Promotions Implementation Specification

**Audience:** Laravel / CMS developer. **Status:** implementation handoff, not a claim that the CMS exists.
**Scope boundary:** Next.js public frontend is in PR #14; this document defines the separate authenticated administration system and public read APIs. No CMS admin UI is built in the frontend repo.
**Editorial concept:** an Event is the guest experience and bookable inventory; a Campaign is a separately scheduled announcement *about* an event or other internal page. Never combine their states.

## 1. Admin information architecture

Top-level module: **Events & Promotions**, with:
1. **Overview**: upcoming events, currently visible campaigns (by placement), events with booking closed or low inventory; actions Create Event, Create Campaign.
2. **Events**: searchable list, filters by status/event date/booking state, create/edit/duplicate/archive, detail preview for Arabic and English, package/inventory management.
3. **Campaigns**: list/calendar, placement badges (top_bar, floating_card), effective current status, priority, start/end, enabled switch, per-language content and targeting.
4. **Media library**: upload/replace optimized image, focal point, alt texts, preview, no executable SVG/HTML.
5. **History**: publication changes, pause/restore, capacity/price edits, who/when/old/new values.
6. **Configuration**: roles/permissions, site timezone (Africa/Cairo), supported languages (ar/en), global max concurrent placements and frequency caps.

### Event editor — required fields

| Field | Type | Rules |
|---|---|---|
| id | server integer | Immutable |
| slug | URL-safe string | Unique, <=120, never silently change after public launch |
| publish_status | enum | draft, published, archived; only published may appear publicly |
| title_ar / title_en | string | Required in both languages |
| summary_ar / summary_en | plain string | Public card |
| description_ar / description_en | plain text | Required to publish; multi-paragraph, escaped in frontend |
| venue_ar / venue_en | plain text | Display location, not customer address |
| cover_image | media asset | Optional to draft, recommended for publish; publish validates accessible safe URL |
| gallery | ordered assets | 0–12, localized descriptive alt text optional |
| highlights_ar / highlights_en | ordered strings | 0–30 each |
| terms_ar / terms_en | plain text | Policies, cancellations and accessibility |
| SEO title, description | localized text | Optional; fallback event title/summary |
| sale_starts_at / sale_ends_at | datetime | In Cairo UI; stored UTC with explicit offset on API |
| booking_status | enum | open / upcoming / sold_out / closed / cancelled (computed/effective, not solely editor switch) |
| occurrences | child collection | At least one before publish if bookable |
| packages | child collection | At least one before opening sales |

### Occurrence editor

Each event can have multiple occurrences:
- occurrence id; parent event; optional label_ar/en; start_at and end_at (end > start).
- own sale start/end, max capacity and currently allocated quantities (capacity checks controlled by backend).
- visible status: upcoming, open, sold_out, closed, cancelled.
- ability to close a single occurrence while other dates remain bookable.
- inventory reconciliation MUST account for active holds, confirmed bookings, releases and refunds; CMS numeric capacity edits alone cannot override existing paid commitments.
- cannot delete an occurrence with active or historical bookings; archive/cancel with an explicit resolution workflow.

### Package editor

| Field | Type / validation |
|---|---|
| id; event_id | server-owned, immutable |
| name_ar / name_en | required |
| description_ar / description_en | plain localized text |
| includes_ar / includes_en | ordered lists |
| price | decimal(12,2), >=0, formatted as string in public JSON; never JS float as ledger |
| currency | ISO 4217; frontend currently displays code (e.g. EGP) |
| pricing_mode | per_person or per_package |
| guests_per_unit | integer 1–100; force 1 for per_person |
| min_quantity / max_quantity | integers 1–100; max >= min |
| capacity / allocation | per occurrence; shared resource caps enforced by booking backend |
| display_order | integer, lower first |
| status | draft / on_sale / paused / retired |
| selling window | optional override limited to parent event/occurrence validity |

**Publication validation:** at least one date and one package; required localized copy; valid URL/media, monetary fields, capacities and schedule consistency. No event can be displayed as bookable if server inventory or sale window disagrees.

## 2. Campaign editor — independent of event booking

| Field | Type | Notes |
|---|---|---|
| id, slug | server-owned | Stable campaign identity |
| internal_name | string | Admin-only, not exposed |
| title_ar / title_en | required strings | Short headline for top bar and floating card |
| description_ar / description_en | optional strings | Floating card (max ~160 visible characters) |
| eyebrow_ar / eyebrow_en | optional strings | Luxury editorial label |
| cta_label_ar / cta_label_en | required strings | Accessible button name |
| cta_href | **relative site URL only** | `/events/{slug}`, `/experiences` etc; reject `//`, JS, data, external redirect |
| image_url | optional trusted image | Used by floating card |
| placements | array | top_bar, floating_card, or both |
| priority | integer 0–10000 | Higher wins for each placement; deterministic tie break |
| enabled | bool | Manual ON/OFF independent of dates |
| publish_status | enum | draft, ready, published, archived |
| starts_at / ends_at | timezone-aware datetime | Empty boundary = unbounded; valid start < end |
| display_delay_seconds | integer 0–30 | Floating only |
| dismiss_for_hours | integer 0–720 | 0 means dismissal for current visit only |
| targeting_paths | string[] | `*`, `/`, `/experiences`, `/events`; match against locale-free routes |
| targeting_devices | enum[] | all / desktop / mobile if implemented with server response device logic |
| experiment_tag | optional string | Internal reporting; no tracking PII |
| tracking_campaign_id | optional identifier | Server-owned analytics linkage |

**Effective live condition:** `publish_status=published AND enabled=true AND now in [starts_at, ends_at) AND path/device targeting match`.

The ON toggle must NOT bypass draft approval. Publish with enabled=false should stay hidden; enabled=true with future start remains **Scheduled**; after expiry becomes **Ended**. Pause/disable is immediate and **must invalidate public caches**. Disabling a Campaign must not cancel the associated event or close its booking window.

### CMS actions and workflow

- **Save draft** (valid partial content), **Validate/Ready**, **Preview** (access-controlled, both locales and both placements), **Schedule**, **Publish**, **Pause/Off**, **Resume/On**, **Duplicate to disabled draft**, **Archive**.
- Bulk scheduling for Christmas/New Year's/other occasions prepared months ahead; calendar shows overlaps and conflicting priorities.
- Show exact next transition time in Africa/Cairo and current server effective status.
- High-priority overlapping campaigns: select only **one active record per placement**. A Campaign may own both simultaneously. On dismiss, next eligible campaign may appear; CMS preview should make this clear.
- Admin preview must never leak unpublished assets or pricing through public API, and must set noindex/no-cache.
- Maintain audit records for every mutation, including before/after and admin ID. Require a reason for cancellation or reduction of sellable capacity.
- Prevent deleting an event/package with paid or pending bookings; archive instead.

## 3. Public read contracts consumed by Next.js

**Active placements**: `GET /api/v1/promotions/active?path={locale-free-path}`; en/ar header; response `{success:true,data:PromotionCampaign[]}`. Empty list if none. Return only published, enabled, matching, non-expired campaigns. Exact frontend fields in `lib/promotions/domain.ts` and example in `DELIVERY.md`.

**Events index**: `GET /api/v1/events`; `data: EventSummary[]` (not generic CMS /experiences).

**Event detail**: `GET /api/v1/events/{slug}`; `data: EventDetail`, 404 if unpublished/nonexistent.

**Inventory**: `GET /api/v1/events/{slug}/availability?occurrence_id=...`; server-calculated prices/capacity. Never cache across inventory changes as though authoritative.

Detailed DTOs in `EVENTS-API-HANDOFF.md` and `EVENT-BOOKING-API-HANDOFF.md`.

**Important:** Backend currently owns all actual stock, price, payment and QR decisions. A marketer/editor's campaign switch cannot directly create a booking or grant free paid tickets.

## 4. Proposed authenticated admin HTTP actions

Existing Laravel auth and CSRF/Sanctum patterns should be reused:
- `GET /api/v1/admin/events?status=&search=&date_from=&date_to=`
- `POST /api/v1/admin/events`, `GET/PATCH /api/v1/admin/events/{id}`
- `POST /api/v1/admin/events/{id}/publish`, `POST /api/v1/admin/events/{id}/archive`
- `POST /api/v1/admin/events/{id}/occurrences`, `PATCH /api/v1/admin/occurrences/{id}`
- `POST /api/v1/admin/events/{id}/packages`, `PATCH /api/v1/admin/event-packages/{id}`
- `GET /api/v1/admin/campaigns?status=&placement=&search=`, `POST /api/v1/admin/campaigns`
- `GET/PATCH /api/v1/admin/campaigns/{id}`
- `POST /api/v1/admin/campaigns/{id}/publish`, `POST /api/v1/admin/campaigns/{id}/pause`
- `POST /api/v1/admin/campaigns/{id}/duplicate`
- `GET /api/v1/admin/campaigns/{id}/preview?locale=ar|en`
- `GET /api/v1/admin/audit-logs?resource_type=&resource_id=`

These are **proposals** for CMS/backend team sign-off; not existing endpoints. All mutations require explicit authorization + logging. Return 403 for unauthorized, 422 for validation, 409 for concurrency/illegal state, 404 for unknown, 429 for throttling, 5xx with request ID for faults.

## 5. Suggested RBAC and security gates

| Role | Campaigns | Event editorial | Pricing/capacity | Payments/bookings |
|---|---|---|---|---|
| Marketing editor | Draft/edit/preview | Draft content | Read-only | No access |
| Publisher | Publish/pause and schedule | Publish metadata | Read-only | No access |
| Event operations manager | Read | Edit occurrence status | Change with reason and audit | Read scoped summary |
| Finance | Read | Read | Approve monetary changes | Refund/reconcile through existing privileged workflow |
| Super admin | All with audit | All with audit | All with audit | Existing protected booking workflow only |

Security: validate media content type, dimension, file size and origin; strip dangerous HTML; sanitize redirects; server-enforce permissions regardless of hidden buttons; use optimistic versioning for concurrent edits; no public draft preview; secure publication logs.

## 6. Required CMS acceptance scenarios

1. Editor creates Christmas event in AR/EN, adds 2 occurrences and 3 packages, leaves draft; nothing visible publicly.
2. Publisher makes event public but leaves booking upcoming. Detail may show upcoming; no checkout enabled.
3. Operations opens occurrence 1, closes occurrence 2. Public availability matches each independently.
4. Editor schedules both Christmas and New Year's campaigns with different placement/priorities; upcoming campaigns never appear early.
5. Publisher enables both placements; top bar and floating card display matching published campaign. CTA opens its event.
6. Visitor dismisses a campaign; repeat visits respect `dismiss_for_hours`.
7. Publisher pauses campaign; public `active` response changes immediately, including on already-open client pages after refresh.
8. Editor closes bookings but campaign stays on; event page shows booking closed, never sells inventory.
9. Operations cancels event with paid attendees; existing tickets/bookings are NOT silently erased and a documented refund/customer notification process is triggered.
10. Unauthorized staff cannot change price/capacity, publish or expose draft data; each mutation has an audit trail.

## 7. Decisions backend/CMS owners must confirm

- Whether capacity is per package or across a shared seating/zone pool; *must* agree before selling tickets.
- Booking hold duration, expiry sweep cadence and idempotency semantics.
- One QR per booking (currently supported) versus one QR per attendee (requires a contract change).
- Whether campaign targeting supports devices, traffic segments or only page paths in initial release.
- Exact storage host, media policy, receipt/WhatsApp/email notifications, and localized cancellation policy.
