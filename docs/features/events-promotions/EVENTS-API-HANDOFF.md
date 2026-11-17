# Zalina Bookable Events — Phase 2 Frontend API Handoff

**Owner:** Laravel backend + CMS team (implementation). The Next.js frontend already implements the public list/detail/availability views.
**Status:** Proposed contract; upstream Laravel endpoints are **not verified as implemented**. **No new backend route or CMS panel is included in this PR.**

## 1. API and response wrapper

Base `/api/v1`. Public endpoints require no auth and honor `Accept-Language: ar|en`. Keep existing `{ "success": true, "data": ... }` wrapper, and existing error convention with `message`, `errors`, `X-Request-Id`.

`GET /api/v1/events`
Returns a flat array of PUBLIC events, with the following keys for each item:

```json
{
  "id": 37,
  "slug": "christmas-night",
  "title_ar": "ليلة الكريسماس في زالينا",
  "title_en": "Christmas Night at Zalina",
  "summary_ar": "أمسية على ضفاف النيل",
  "summary_en": "An evening beside the Nile",
  "cover_image_url": "https://api.zalinaarabianvillage.com/storage/events/37.webp",
  "starts_at": "2026-12-24T19:00:00+02:00",
  "ends_at": "2026-12-25T01:00:00+02:00",
  "booking_status": "open",
  "starting_price": "950.00",
  "currency": "EGP"
}
```

Required: numeric positive `id`, stable slug `[a-z0-9-]`, **both language titles**, `booking_status`.
Fields `summary_*` may be empty; `cover_image_url` and price/date fields may be null.
The list endpoint must never return draft/hidden events. Empty catalogue returns `data: []`, not 404.

`GET /api/v1/events/{slug}`
Returns a single public event object with all list keys plus:

```json
{
  "description_ar": "تفاصيل المناسبة",
  "description_en": "A memorable cultural evening",
  "venue_ar": "زالينا، الأقصر",
  "venue_en": "Zalina, Luxor",
  "highlights_ar": ["عشاء", "موسيقى حية"],
  "highlights_en": ["Dinner", "Live music"],
  "terms_ar": "قواعد الحجز",
  "terms_en": "Booking terms",
  "gallery_urls": ["https://api.zalinaarabianvillage.com/storage/events/37-1.webp"],
  "occurrences": [
    {
      "id": 701,
      "starts_at": "2026-12-24T19:00:00+02:00",
      "ends_at": "2026-12-25T01:00:00+02:00",
      "booking_status": "open",
      "label_ar": "ليلة 24 ديسمبر",
      "label_en": "Christmas Eve"
    }
  ],
  "packages": [
    {
      "id": 901,
      "name_ar": "تجربة الثنائي",
      "name_en": "Couple Experience",
      "description_ar": "أمسية لشخصين",
      "description_en": "An evening for two",
      "includes_ar": ["عشاء", "جلسة مميزة"],
      "includes_en": ["Dinner", "Reserved seating"],
      "price": "2200.00",
      "currency": "EGP",
      "pricing_mode": "per_package",
      "guests_per_unit": 2,
      "min_quantity": 1,
      "max_quantity": 4,
      "display_order": 1
    }
  ]
}
```

This is a **partial example** showing the extra fields; the real response must include the list fields as well. The server must return **404** for non-public/unknown slug. The front end treats a transient API error differently from a legitimate empty list.

Allowed booking statuses on Event and Occurrence:
`open` | `upcoming` | `sold_out` | `closed` | `cancelled`.
Unknown statuses are displayed conservatively as **closed**, not bookable.

`pricing_mode = per_person`: 1 unit means a guest ticket, `guests_per_unit=1`.
`pricing_mode = per_package`: 1 unit is a fixed bundle, `guests_per_unit` equals the bundle capacity (e.g. 2 for couple). Booking step 3 will use it for guest count/validation.
The display `price` and `starting_price` are **indicative UI values only**. Backend checkout must recalculate and snapshot money.

`GET /api/v1/events/{slug}/availability?occurrence_id=701`
Requested whenever the selected occurrence changes. Returns:
```json
{
  "success": true,
  "data": {
    "occurrence_id": 701,
    "checked_at": "2026-12-01T10:15:00+02:00",
    "packages": [
      {
        "package_id": 901,
        "available": true,
        "remaining_units": 4,
        "unit_price": "2200.00",
        "currency": "EGP"
      }
    ]
  }
}
```

The availability object must be scoped to the requested occurrence. Backend supplies current package availability, `remaining_units`, sellable state and unit price.
Frontend does not infer stock from CMS catalogue data. If API fails or price is missing, the UI does not allow a valid selection.
For `per_package` stock, `remaining_units` measures bundle units, **not attendees**. The server must enforce shared room/seat/zone capacity and enforce resource allocation atomically in step 3.

## 2. CMS data requirements

The CMS editor must manage:
- Event status: draft/published/archived, bookability independent from promotion on/off.
- Slug (unique, permanent once referenced), Arabic + English title/summary/description, location, hero and gallery assets, highlights, terms, SEO fields (optional enhancement).
- One or many occurrences with timezone-aware start/end and separate booking status/sales windows.
- Packages per event with localized copy, included services, pricing mode, guests per unit, min/max quantity, display order, inventory allocation, currency.
- Currency amounts as decimal strings (max 2 fractional places), not float.
- `starting_price` should reflect the least published bookable package or be null; do not advertise sold-out prices as available.
- User-facing date/time output in `Africa/Cairo`; store canonical instants UTC.
- Editing/suspending a campaign must not change event availability; a cancelled event must block new holds and trigger staff/customer operations separately.
- Sanitize rich text and media URLs; the frontend currently displays plain text only.

## 3. UX states supplied by frontend

- `/en/events`, `/ar/events`: All / Bookable / Coming Soon filter, cards, status, title, image, pricing.
- `/{locale}/events/{slug}`: hero, breadcrumb, details, venue, date, highlights, gallery, terms and package selector.
- Per occurrence: open, upcoming, sold out, closed, cancelled.
- Availability: loading, ready, 404 / unavailable, retry.
- Per package: live price display, availability check, min/max quantity, guest count and indicative total.
- **Step 2 restriction:** checkout continuation is intentionally disabled until the Step 3 Event Booking V2 route and payment recovery UI are implemented. Do not interpret this as live commerce.

## 4. Developer fixture (non-production only)

To preview real screens without Laravel, set `ZALINA_EVENTS_DEMO=true` locally, with `NODE_ENV=development`; then visit:
- `/en/events`
- `/en/events/christmas-night-preview`
- `/ar/events/christmas-night-preview`
- `/en/events/new-years-eve-preview` (sold out)
- `/ar/events/valentines-evening-preview` (upcoming)

`lib/events/fixtures.ts` is fictional test data, not a real Christmas event or price. The demo flag is disabled in production regardless of its value. If the backend endpoint is unavailable in production, users see a graceful unavailable state, never fictional inventory.

## 5. Step 3 contract direction

Booking Domain V2 will gain `product_type: "event"` with `event_occurrence_id`, `items: [{ event_package_id, quantity }]`, guest details and a server-generated payment hold. The existing payment flow and QR recovery stay authoritative. Neither package price nor total will be sent as a trusted request value.

## 6. Frontend integration checklist

- Event endpoints return the exact JSON envelope and field names above.
- All UI price/stock fields are backed by Laravel, never by a production fixture.
- `GET /events/{slug}` returns meaningful 404 for unknown/unpublished event, not 200 with null.
- `GET /availability` validates occurrence ownership, sell window and available allocation.
- Mixed EN/AR content present; RTL text and i18n routes tested.
- Re-fetch/cache policy avoids stale inventory/expired campaign visibility.
- CI typecheck, unit and device tests complete before merge.
