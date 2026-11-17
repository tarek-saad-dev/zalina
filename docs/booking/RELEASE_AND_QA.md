# Zalina Booking Tickets — Frontend QA and Release Gate

**Branch:** `codex/issue-15` / PR linked to issue #15. Do not merge/deploy production until approval and all gates green.

## Current compatibility status

| Capability | Frontend | Backend dependency | Runtime behavior |
|---|---|---|---|
| Existing Day Use | Preserved | Existing live GET /day-use and POST /bookings | Live as before; payload unchanged without optional Lantern |
| Observatory Experience | New product card, distinct Day Use catalog filter | Extend GET /day-use with explicit `ticket_category` + actual bundle price/benefits | Coming Soon until at least one active explicit-priced Observatory catalog row exists |
| Cabin Stay | Rename Bubble Stay in customer-facing UI | Confirm and implement per-guest overnight pricing, availability and contracts | Coming Soon; existing `bubble_stay` enum/data preserved |
| Lantern | Optional per-guest UI, pricing and payload adapter | NEW GET /ticket-add-ons + accept `ticket_add_ons` on POST /bookings | Unavailable unless backend advertises `checkout_enabled: true`; fail closed |
| Payments / QR | Existing checkout / payment / polling kept | Existing Paymob integration | Do not create production test payments |

## Verify before merge

- `npm ci`
- `npm test`
- `npm run typecheck`
- `npm run build`
- Manual bilingual browser tests (mobile + desktop) with non-production backend fixtures for each feature-gated state.
- Verify Day Use request has **no** `ticket_add_ons` when unchecked; with selected Lantern exactly one item and quantity equal guests.
- Compare backend-authoritative `total` against UI estimate on creation. Never mark payment completed based on client calculation.
- Confirm inactive/invalid Observatory/Lantern cannot reach payment; cabin remains disabled.
- Require team signoff on Observatory inclusions, Cabin pricing unit/rollout, Lantern price and permitted ticket types.

## Release order

1. Backend ships inactive Observatory catalog, add-on feature, and booking create/receipt support behind capability flags to staging.
2. Test booking/Paymob mock webhook/QR in staging; no production business mutations.
3. Frontend reviewed PR merges to main only after explicit owner approval (merge triggers production workflow).
4. Backend admin enables Observatory and Lantern only after production readiness. Old Day Use stays unaffected.
5. Monitor API error rates and booking integrity; disable the catalog flags to roll back the new options without rolling back frontend.

**Known hold:** No live backend verification has been performed by frontend work alone; do not claim production-ready until contract + tests pass.
