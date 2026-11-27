# Opt-in isolated cross-app acceptance

This is a **manual browser entrypoint**, not an automated pass or a backend fixture provisioner. The synthetic fixture suite in `event-acceptance-mock.md` is separate. Do not run this against production or any shared environment.

## Prerequisites

- Obtain explicit authorization and an Events-enabled backend checkout/runtime from its maintainer. Record both repository SHAs and clean-worktree results in the evidence, without copying private source here. The current runner supplied no such checkout or runtime.
- The backend owner must provide a disposable database, storage, cache, mail and queue, a mock-only payment gateway, and local-only feature configuration. Do not reuse an existing `.env`, credentials, or business data. Verify the running process actually uses these isolated services before any mutation. Do not modify the backend repository.
- Enforce outbound network isolation for **both servers and the browser** outside this script. Browser request interception below does not control Next server-side fetches, backend egress, WebSockets, or other processes. Verify Next's API base points to the isolated backend, the backend's provider uses only its mock, and both servers bind to loopback. Do not proceed if any of these cannot be established.
- The maintainer supplies synthetic published and draft editions, free and paid packages, capacity contention and expired-hold arrangements, preview tokens/media for all three scopes, and legacy product booking fixtures. Agree how to trigger delayed/failed fulfillment and payment retry using the backend's supported test procedures. No test-only backend routes are assumed here. Use synthetic guest data only.
- Install Playwright and Chromium as in `event-acceptance-mock.md`; start the separately isolated backend and frontend yourself. Use explicit loopback HTTP origins with ports. This entrypoint never starts or configures either server.

## Launch

```sh
EVENT_CROSS_APP_ISOLATED=yes \
EVENT_CROSS_APP_FRONTEND=http://127.0.0.1:3000 \
EVENT_CROSS_APP_BACKEND=http://127.0.0.1:8000 \
node scripts/event-cross-app-browser.cjs
```

Use the actual verified local ports. The browser opens the frontend and permits ordinary browser requests only to those two origins. This is defense in depth, not a network sandbox. Navigate manually using the supplied fixture paths and tokens; do not put capability URLs, tokens, guest details, payment URLs or response bodies in logs or screenshots. Press Enter in the terminal to close the browser. Browser developer tools or network traces can contain sensitive capabilities: sanitize or omit them from evidence.

## Evidence checklist

Record date, exact frontend/backend SHAs, clean status, isolation and mock-payment verification, commands with secrets removed, browser version, viewport, locale, and pass/fail/blocked for each item. Capture sanitized screenshots where useful. Check the actual public response shapes and privacy/cache headers without retaining capability values or guest PII.

- Announcement absent, card, banner, replacement and clear; deep link; four commercial states, archived/cancelled status-only, draft/disabled 404.
- Mixed free/paid package quantities, authoritative total and guest count, shared-capacity contention and 422 refresh, 429 backoff, duplicate-submit protection.
- Free confirmation without payment; paid mock checkout and provider return with authoritative polling; expiry, payment retry/409/422 and no duplicate payment. A return query alone must not show success.
- Three authoritative tickets, current edition dates, delayed and failed fulfillment, invalidated ticket distinction and email PDF guidance. Verify fulfillment failure does not initiate repayment.
- Landing, card and banner previews, missing/invalid/wrong-scope tokens, protected draft media, no booking action, no-store/noindex/no-referrer and capability privacy.
- Existing Day Use, Bubble Stay and Wedding status/recovery paths using synthetic bookings.

Mark any unavailable fixture, scenario or verification as blocked. An actual Laravel pass requires observed end-to-end results; mock-only frontend tests cannot establish it. Keep PR #31 draft until the cross-app gate and independent review of the final head are complete.
