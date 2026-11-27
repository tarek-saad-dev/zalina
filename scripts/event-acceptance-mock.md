# Isolated Event browser fixture

The in-memory API binds only to 127.0.0.1:4187 and never calls an upstream service. Its test-only `/__fixture` control changes responses and records synthetic request bodies and counts in memory; it is not available through the site proxy. The simulated provider redirects on loopback in Next dev only. It is not Laravel or Paymob. Do not enter real customer data.

Run locally:
1. `npm install --no-save --package-lock=false --no-audit --no-fund playwright`
2. `npx playwright install chromium`
3. `node scripts/event-acceptance-mock.cjs`
4. `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4187 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_PAYMENT_GATEWAY=mock npm run dev -- --hostname 127.0.0.1`
5. `node scripts/event-browser-smoke.cjs`

The browser blocks non-loopback requests; screenshots and logs go to `artifacts/event-browser`. The existing smoke runs English and Arabic at 1440x900 and 390x844, covering free booking, simulated paid return, and all three previews. The additional English desktop cases exercise announcement replacement and clearing, direct edition states and 404s, invalid preview tokens and scope, preview/proxy privacy headers, mixed-package payload and capacity rejection, repeated 429, expiry, payment conflict, failed fulfillment and invalidated tickets. These are fixture-backed checks, not actual Laravel or Paymob integration. Actual browser results must come from executing the suite; actual isolated Laravel integration, production CDN invalidation, OPEN-EVT-014 timezone, legacy private media orphan cleanup, preview version stamp, and capability URL M11 follow-ups remain separate gates.
