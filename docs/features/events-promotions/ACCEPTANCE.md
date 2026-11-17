# Frontend Acceptance and Release Gate — Events & Promotions

**Project:** Zalina Arabian Village | PR #14 | `feat/events-promotions-phase1`
**Document state:** acceptance checklist; an unchecked item is **not** a passed test.
**Ownership:** Frontend QA for pre-integration browser checks; backend/CMS team for staging/live contract and payment checks.
**Release decision:** DO NOT MERGE or deploy this draft PR until production build, browser tests, visual review and backend readiness are signed off.

## A. Automated CI gates (must be green on FINAL branch HEAD)

| Test | Owner | Evidence |
|---|---|---|
| `npm run typecheck` | Frontend | GitHub Actions `Frontend checks` |
| `npm test` | Frontend | Unit/integration tests including `lib/events/` |
| `npm run build` | Frontend | GitHub Actions production build with fixtures disabled |
| `npm run test:e2e` | Frontend | Playwright Chromium desktop 1365×900 and mobile Pixel 5 |
| Vercel preview build | Frontend | PR status check |
| Live upstream API status | Backend | Separate staging contract test, NOT simulated by frontend CI |
| Real Paymob webhook and ticket issuance | Backend | Staging sandbox proof, NOT simulated by frontend CI |

**Existing verified baseline (before Stage 4 changes):** 213/213 Vitest tests passed and TypeScript passed; Vercel reported success on head `911f1f4a5eb0c8bcec4800da3c8cea5a270fe435`. This baseline does not certify newer commits or unrun browser tests.

## B. Browser smoke scenarios (Playwright)

The browser suite `tests/e2e/events.smoke.spec.ts` is a **non-production local fixture demo only**:
- [ ] English event catalog loads; cards, labels, event detail and CTA render without horizontal overflow.
- [ ] English checkout from selected package proceeds through guest details and review to an explicitly labelled NO PAYMENT preview, without any POST `/bookings` or `/pay`.
- [ ] Arabic page has `html dir=rtl`, localized labels, selection route, validation and preview.
- [ ] Sold-out package cannot continue to checkout.
- [ ] Unknown event renders recoverable 404 with link to catalog.
- [ ] All scenarios pass in both browser projects (desktop Chromium and mobile Chromium).
- [ ] Screenshot artifacts reviewed for navbar overlap, footer clipping, text legibility, floating layers and tap target size.

## C. Manual visual/UX checks

**Desktop:** 1440×900 and 1280×800. **Mobile:** 390×844, 375×812 and 320×568; **Tablet:** 768×1024. Browser tests above cover a desktop and a mobile breakpoint only; the others remain manual unless explicitly added to tests.

### Promotion placements
- [ ] Active banner starts BELOW the real fixed navbar, does not obscure sticky header or mobile menu.
- [ ] Floating card never blocks checkout, payment, mobile menu or an essential CTA.
- [ ] Close button is keyboard accessible, has label and usable touch target.
- [ ] AR/EN content wraps safely, no overflow or unreadable gold contrast.
- [ ] Dismissal persists for specified `dismiss_for_hours`, and no flash of dismissed campaign on next load.
- [ ] Simultaneous campaigns respect placement and priority, plus path/date gates.
- [ ] Scheduled future campaigns do not show early; ended/paused immediately disappear from API and within client refresh.
- [ ] No event is invented when API returns empty/error.
- [ ] Reduced-motion preference respected and mobile safe-area insets handled.

### Catalog / event detail / packages
- [ ] AR/EN catalog, card image fallback, filters and currency/date formatting match brand palette.
- [ ] Event detail metadata/canonical/hreflang and noindex on non-public/demo routes.
- [ ] Gallery images optimized, meaningful nondecorative alt and responsive layout.
- [ ] Occurrence options and sold-out/closed/upcoming/cancelled states never permit invalid checkout.
- [ ] Package unit mode correctly displays per-person vs per-package and guests_per_unit.
- [ ] Quantity respects package min/max and live remaining_units; stale availability triggers refresh.
- [ ] No unexpected layout shift when API returns content late.
- [ ] Initial/empty/404/error/retry/loading states are translated and visually consistent.

### Checkout / payment / ticket
- [ ] Changing AR/EN preserves selected occurrence/package URL values.
- [ ] Guest name, email, phone validation and backend 422 field errors are usable by keyboard and screen reader.
- [ ] Review shows event, date, package, quantity, guest count and estimated total.
- [ ] Recheck inventory before create; 409 and changed price request explicit review.
- [ ] UI does not accidentally create twice on repeated clicks, 5xx or network ambiguity.
- [ ] Server booking reference and FINAL server total shown before payment.
- [ ] Hold timer counts down and expiry prevents further payment attempts.
- [ ] Payment failure retries same booking reference; a 409 already-paid redirects to authoritative status.
- [ ] Payment URL uses HTTPS; no user card details entered into frontend.
- [ ] Status polling handles pending, paid, confirmed, failed, expired, cancelled, preparing ticket.
- [ ] QR never visible before confirmed ticket-ready status.
- [ ] Existing Day Use / Bubble Stay / Wedding checkout and booking status have no regressions.

## D. Laravel/CMS staging acceptance (external dependency, not included in demo)

- [ ] Admin can draft and publish bilingual event with date(s), price, inclusions, venue and media.
- [ ] Admin can prepare and schedule multiple campaigns ahead of time.
- [ ] Top Bar / Floating Card / Both placement works via CMS without code deployment.
- [ ] Publish, Pause, Resume, Date start/end, targeting, priority, editor permission and audit logs verified.
- [ ] Campaign OFF does not block event booking; Event booking OFF blocks new orders even if campaign visible.
- [ ] Backend /events and /availability share exact typed DTO with frontend; no drafts leaked.
- [ ] Two customers racing for the final available unit cannot oversell.
- [ ] Unpaid expired holds release inventory, duplicate webhooks do not produce duplicate tickets.
- [ ] Payment sandbox success/failure and returning browser reference validated.
- [ ] Ticket QR verified by staff-facing entry service; booking-level vs participant-level admission policy approved.
- [ ] Price changes preserve existing booked item snapshots.
- [ ] Refund/cancellation policy exercised and communicated, without deleting historical bookings.
- [ ] Backend 401/403/409/422/429/500 and malformed responses handled.
- [ ] Operational logs include X-Request-Id and correlatable booking references (without leaking guest PII).

## E. Data/security checks

- [ ] Published frontend cannot access `lib/events/fixtures.ts` data as a live product feed (demo is server guarded by NODE_ENV).
- [ ] `/events/{slug}/book` query parameters are numeric IDs/quantity only, never amounts, payment URLs, personal data.
- [ ] Client request body never contains `total`, `price`, `accommodation_id` or V1 add-ons.
- [ ] Admin preview endpoints are protected/noindex and never share draft content with public routes.
- [ ] No DOM HTML injection, protocol-relative redirect or non-HTTPS external media accepted.
- [ ] Session handoff has no PII/payment URL and does not break checkout when browser storage is denied.
- [ ] Secrets, tokens and webhook credentials are absent from frontend source and public environment variables.
- [ ] Payment/session/QR endpoints are rate-limited, monitored and access-controlled at backend.

## F. Signoff and rollback

PR can move from Draft to Ready for Review after all frontend gates, browser screenshots and reported defects are resolved. Merging requires an explicit owner approval. Deploy only after external backend/CMS staging integration passes and production release sequence is agreed.

**Rollback:** disable active campaigns via CMS and stop new event sales if problems arise; frontend can be rolled back independently, but **existing paid bookings and tickets MUST remain accessible**. Track refund/notification obligations separately.

Owner confirmations:
- Frontend QA: pending
- Backend API contract owner: pending
- CMS owner: pending
- Payments/operations owner: pending
- Production deployment owner: pending
