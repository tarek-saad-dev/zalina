# Zalina — Agent Rules

GitHub issues are the source of truth for task scope. Pull requests are the source of truth for implementation, verification, review findings, and release readiness.

Read `docs/agent-control-plane/CONTROL-PLANE.md` before changing code.

## Project

- Repository: `tarek-saad-dev/zalina`
- Base branch: `main`
- Stack: Next.js 14, React 18, TypeScript, Tailwind CSS
- Package manager: npm
- Install: `npm ci`
- Tests: `npm test`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Local runtime: `npm run dev`
- Production: `https://zalinaarabianvillage.com/`

## Execution guardrails

- One builder branch per issue: `codex/issue-<number>`.
- Implement only the originating issue scope.
- Never commit secrets or credentials.
- Never merge automatically.
- Never dispatch production deployment.
- A human approval from Tarek is required before merge.
- Push/merge to `main` triggers `.github/workflows/deploy.yml` and production deployment.
- Therefore `READY_FOR_TAREK` means safe to merge and safe to deploy immediately.
- Prefer targeted tests while developing. The control workflow also runs the repository verification gate.
- Separate pre-existing failures from regressions.

## Production safety

Agent verification must not create or mutate real production bookings, payment transactions, customer data, service execution state, or other business records.

- Prefer local tests, mocks, fixtures, and non-production flows.
- `.env.example` uses the mock payment gateway for local work.
- Do not use production secrets.
- Do not treat a successful page load as proof that mutation flows are safe.

## Lifecycle

`PLANNED -> BUILDING -> REVIEW -> FIXING -> REVIEW -> READY_FOR_TAREK -> MERGED`

`READY_FOR_TAREK` requires:
- issue scope complete
- current head verified
- tests/typecheck/build green, or clearly named pre-existing failures
- independent Codex review with no unresolved material findings
- PR open against `main`
- safe to deploy immediately after explicit approval

## Control commands

ChatGPT is the normal operator. It translates Tarek's natural-language request into a validated command envelope on the dedicated `codex-control` branch.

Supported actions are:

- `EXECUTE`
- `REVIEW`
- `FIX_FINDINGS`

Exact owner comments `DEV_ACTION: EXECUTE|REVIEW|FIX_FINDINGS` remain a manual fallback.

A push to `codex-control` must never deploy production. Routine status checks are handled by ChatGPT from GitHub without spending a Codex run.

Codex never merges. ChatGPT may merge only after Tarek explicitly approves in chat.
