# Isolated Event browser fixture

The in-memory API listens only on 127.0.0.1:4187, never calls an upstream service, and uses a synthetic payment-provider return (HTTP on loopback in Next dev only). It is not Laravel or Paymob. Do not enter real customer data.

Run locally:
1. `npm install --no-save --package-lock=false --no-audit --no-fund playwright`
2. `npx playwright install chromium`
3. `node scripts/event-acceptance-mock.cjs`
4. `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4187 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_PAYMENT_GATEWAY=mock npm run dev -- --hostname 127.0.0.1`
5. `node scripts/event-browser-smoke.cjs`

The browser blocks non-loopback requests; screenshots and logs go to artifacts/event-browser. Runs en/ar at 1440x900 and 390x844, exercises free booking, simulated paid return and landing/card/banner previews. The branch-only hosted CI workflow is intended to run outside the Codex sandbox. A successful run would establish only these fixture-backed scenarios, not actual Paymob/Laravel behavior, and not full acceptance. Other sales states, rate limits, capacity contention, homepage behavior and real backend remain separate gates.
