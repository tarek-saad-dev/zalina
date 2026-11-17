# Events & Promotions — Developer Handoff Index

**Feature branch:** `feat/events-promotions-phase1` | **Draft PR:** https://github.com/tarek-saad-dev/zalina/pull/14

## Handoff packet — read in this order

1. [DELIVERY.md](./DELIVERY.md) — 4-step frontend plan, current status and scope boundaries.
2. [FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md) — routes, files, env, demo mode, integration and rollback sequence.
3. [BACKEND-API-CONTRACT.md](./BACKEND-API-CONTRACT.md) — unified endpoint matrix and lifecycle rules.
4. [EVENTS-API-HANDOFF.md](./EVENTS-API-HANDOFF.md) — exact event catalog/detail/occurrence/package/availability response shapes.
5. [EVENT-BOOKING-API-HANDOFF.md](./EVENT-BOOKING-API-HANDOFF.md) — standalone event Booking V2 payload, pricing, holds, Paymob, status and QR tickets.
6. [CMS-REQUIREMENTS.md](./CMS-REQUIREMENTS.md) — editor fields, screens, publish/on-off, scheduling, targeting, roles, validation and audit.
7. [ACCEPTANCE.md](./ACCEPTANCE.md) — frontend QA, staging/live checks, release and rollback gates.
8. [SOURCE-ALIGNMENT.md](./SOURCE-ALIGNMENT.md) — explicit differences between ANV v1 project PDF specs and the active Booking V2 frontend.

## Clear role split

**Frontend — this PR:** guest-visible pages, promotion placements, event packages, booking forms, payment handoff, status and ticket UI, typed adapters, fixtures and CI.

**Laravel backend — separate implementation:** `/api/v1/events*`, `/api/v1/promotions/active`, Booking V2 product_type `event`, authoritative server prices and inventory holds, gateway webhooks, ticket issuance and lookup.

**CMS — separate implementation:** authenticated Events & Promotions administration, publication, editorial and pricing permissions, schedules, media, on/off and audit.

## Safe developer preview

With `NODE_ENV=development`, set:
```env
ZALINA_EVENTS_DEMO=true
NEXT_PUBLIC_ZALINA_PROMOTIONS_DEMO=true
NEXT_PUBLIC_ZALINA_PROMOTIONS_DEMO=true
NEXT_PUBLIC_API_BASE_URL=https://api.zalinaarabianvillage.com
```

Visit `/en/events` or `/ar/events`; inspect Christmas preview event, top bar, bottom floating card and checkout. Fixtures are fictional, visibly labelled and NEVER produce a server booking/payment/ticket.

Run:
```sh
npm install
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser test screenshots and traces are available as GitHub Actions artifacts. **Do not interpret developer demo as backend readiness or success of real payment integration.**

## Release policy

The feature branch/PR remains separate from `main`. Do not merge or deploy solely on green frontend tests. Backend + CMS contracts and staging payment/inventory/permissions must be verified by their owners and final merge/release explicitly approved.
