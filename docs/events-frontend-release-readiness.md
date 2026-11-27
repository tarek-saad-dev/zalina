# M9-B Events frontend — release readiness and handoff

Status: **draft; not approved for production**. PR #31, issue #30. Scope is Next.js frontend only. No backend implementation or production feature activation is included.

## Verified baseline
Head `7598177eea235a594b68f655abee163a154321e2`:
- [PR verification](https://github.com/tarek-saad-dev/zalina/actions/runs/45935125068): 32 test files, 311 tests, typecheck and production build passed.
- [Chromium QA](https://github.com/tarek-saad-dev/zalina/actions/runs/45935125005): English and Arabic at 1440x900 and 390x844, free booking, mock payment return, tickets, three preview scopes, and advanced acceptance scenarios passed.
- [Evidence artifact](https://github.com/tarek-saad-dev/zalina/actions/runs/45935125005/artifacts/15170019534).
- Advanced browser scenarios cover announcement replacement/clear, six edition states, draft/disabled 404, preview denial/privacy, mixed packages, capacity rejection, repeated 429, expiry, 409, failed fulfillment and invalidated ticket.
- Targeted keyboard, accessible naming, touch size, locale and capability-metadata assertions passed. Not a full WCAG audit.
- Added protected draft media and delayed multi-ticket fulfillment scenarios, and authoritative guest count display. These require fresh exact-head verification; baseline results do not certify later commits.

## Reproduce locally (synthetic fixture)
Follow `scripts/event-acceptance-mock.md`. Use Node 22, install dependencies without generating a lockfile, run npm test, npm run typecheck, npm run build. The browser fixture runs in Next dev with explicit loopback API and site origins. Never use real customer details, production API, or real payments. Hosted QA stores screenshots and logs. Fixture coverage is not proof of Laravel/Paymob behavior, a full accessibility audit or performance benchmarks.

## Actual cross-app gate (blocked)
The backend maintainer reports an Events-enabled revision, but an explicitly authorized isolated checkout/runtime and its disposable services and synthetic fixtures were not supplied in this runner's work area. No actual Laravel cross-app test has been run here. The opt-in manual browser entrypoint and detailed prerequisites are in `scripts/event-cross-app.md`; browser interception alone cannot isolate server-side traffic. Do not commit private backend source, credentials, customer records, or production tokens into this repository.
1. Record backend and frontend exact SHAs; verify local clean worktrees, isolated DB/media/queue and mock gateway; apply only backend maintainer-approved test configuration.
2. Confirm real announcement, edition, availability, preview, booking, payment and ticket resource envelopes against OpenAPI. Use synthetic editions and guests. Verify no-store and capability-token privacy end to end.
3. Run the handover acceptance scenarios against this backend (including concurrent shared capacity, free/paid lifecycle, expiry, delayed/failed fulfillment, invalidation, preview scopes, feature flags and privacy). Verify authoritative totals, no duplicate financial execution, and old Day Use/Bubble Stay/Wedding flows.
4. Record exact commands, statuses, screenshots, ticket counts, expected/actual and blocked cases without exposing capability values or PII. Do not claim a pass where evidence is absent.
5. Obtain independent review of the exact final head and human release approval. Keep PR draft if any required gate is missing.

## Rollout boundary
No merge, deployment, production flag activation or real Paymob operations before the approved release sequence. Preserve existing legacy booking paths and do not add a permanent public Events navigation or sitemap entry. Preview and booking routes remain private/noindex/no-referrer. A later release and rollback plan must be coordinated with the backend owner; no production database action is authorized here.

## Retained release risks from handover §N
- Verify legacy public media orphan cleanup, direct storage URL denial and production media mapping.
- Perform ticket morph uniqueness duplicate preflight without automatic deletion.
- OPEN-EVT-014: verify production APP_TIMEZONE against Africa/Cairo.
- Preview version stamp depends on edition updated_at; related edits may not invalidate tokens.
- CDN invalidation and M11 legacy capability entropy/secondary proof/IDOR are follow-up gates, not assumed resolved.
