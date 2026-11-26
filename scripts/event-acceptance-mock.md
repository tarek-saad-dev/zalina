# Isolated Event browser fixture

This fixture is in-memory and never calls an upstream service. It provides a homepage card, `/en/events/fixture` and `/ar/events/fixture`, availability, and free or pending-payment booking responses. Payment is deliberately unavailable. It is not Laravel and cannot verify payment or integration behavior.

1. Install dependencies: `npm install --package-lock=false --no-audit --no-fund`.
2. In one terminal run `node scripts/event-acceptance-mock.cjs`.
3. In another, explicitly override both production defaults: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4187 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_PAYMENT_GATEWAY=mock npm run dev -- --hostname 127.0.0.1`.
4. With browser network access restricted to loopback, inspect `/en`, `/ar`, and the two fixture edition routes at 1440×900 and 390×844. Exercise the free booking and pending-payment states. Do not use real customer details.

Other API paths return 404. Preview, provider return, rate limiting, and other sales states require additional fixtures; this harness does not establish acceptance for them.
