# Production Events public HTTP verification

Deployed frontend: `ae7940e62be9d3fbf3d8ab225d958a891b037c1c`, PR #31. [Deployment](https://github.com/tarek-saad-dev/zalina/actions/runs/46055127480) passed. [Frontend tests](https://github.com/tarek-saad-dev/zalina/actions/runs/46054463615): 312 passed; [isolated browser QA](https://github.com/tarek-saad-dev/zalina/actions/runs/46054464557) passed.

## Live evidence — 2026-11-27
[Public smoke run 46058266197](https://github.com/tarek-saad-dev/zalina/actions/runs/46058266197) passed eight HTTP checks: backend /up and /api/v1/ping; en and ar frontend homepages; direct API and frontend proxy announcement in both locales. All HTTP 200. Both announcement endpoints returned null in both locales. This is valid absence of a public announcement, not proof of a disabled flag or an error.

Edition, availability and public landing checks were skipped because there was no active public announcement to identify an edition. Booking creation, payment, ticket fulfillment and privileged preview were not exercised in production. Do not invent slugs, use private capabilities, or create synthetic production business records.

## Repeat
Run `node scripts/event-production-public-smoke.cjs` on a network that can reach the public site and API. Uses only GET, approved origins, manual redirect checks and bounded timeout. The branch-only hosted workflow is a diagnostic, not a deployment pipeline. Updated checks cover proxy privacy headers and homepage locale/direction and announcement link agreement; their evidence must be obtained in a fresh run.

Remaining evidence requires an actual public edition (published announcement or a known public landing URL provided by the owner). Backend administration, publication and sales activation are outside frontend scope. No frontend defect established in the observed initial checks.
