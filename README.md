# Wine Pairing Assistant

[![CI](https://github.com/pkouchu/wine-pairing-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/pkouchu/wine-pairing-assistant/actions/workflows/ci.yml)

> Describe your meal. Get a bottle recommendation from your actual CellarTracker cellar, powered by Claude AI.

**Live demo:** https://wine-pairing-assistant.vercel.app

---

## What It Does

Fetches your public CellarTracker inventory via the tab-delimited export API, caches it server-side, and calls Claude Haiku with your inventory + meal description to return specific bottle suggestions with rationale and confidence scores.

---

## Architecture

```
pages/api/sync.ts    ← fetches CellarTracker export, caches 1hr in memory
pages/api/pair.ts    ← calls Claude Haiku with inventory + meal, returns PairingResult[]
lib/cellartracker.ts ← tab-export fetcher and parser
lib/cache.ts         ← generic TTL cache
lib/claude.ts        ← Anthropic SDK wrapper with prompt caching on inventory payload
```

The inventory is passed to Claude as a cached prompt block — since the cellar changes rarely, the same token prefix is reused across requests, significantly reducing cost and latency on repeated queries.

---

## Test Framework

| Layer | Tool | Coverage |
|---|---|---|
| Lib unit tests | Vitest | CSV parsing, cache TTL, prompt building |
| API route tests | Playwright APIRequestContext | Schema validation, error codes, network mocking |
| E2E tests | Playwright | Happy path, error states, NV handling, loading states |
| Visual regression | Playwright screenshots | WineCard at desktop + mobile viewports |

CI runs Playwright tests across **3 parallel shards** via GitHub Actions matrix strategy, cutting suite time by ~65%. Trace files and HTML reports are uploaded as artifacts on failure only.

### Key test patterns

**Server-side fetch interception:** `next/experimental/testmode/playwright` intercepts outbound Node.js fetches (to CellarTracker and Anthropic) at the server level — API tests never depend on external services.

**Custom fixtures:** `cellar.fixture.ts` provides a `cellarPage` object with mocked sync and pair responses. Every E2E test gets a pre-loaded inventory without repeating setup.

**Network interception edge cases:**
- CellarTracker 504 → API returns 503 with `cellartracker_unavailable`
- Claude 503 → UI shows pairing unavailable message
- Empty inventory → 400 with specific `no_inventory` error code
- High-latency Claude call → loading skeleton visible within 200ms of submission

---

## Local Setup

```bash
git clone https://github.com/pkouchu/wine-pairing-assistant.git
cd wine-pairing-assistant
npm install
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY and CELLARTRACKER_USERNAME in .env.local
npm run dev
```

Open http://localhost:3000.

### Running Tests

```bash
npm run test:unit          # Vitest — lib unit tests
npx playwright test        # Playwright — API + E2E tests
npx playwright test --ui   # Playwright UI mode for debugging
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `CELLARTRACKER_USERNAME` | Yes | Public CellarTracker username |

---

## Vercel Deploy

Deploy your own instance:

```bash
npx vercel --prod
```

Set `ANTHROPIC_API_KEY` and `CELLARTRACKER_USERNAME` in the Vercel dashboard under project environment variables.

---

## Phase 2 (Planned)

AI triage agent: hooks into Playwright's `afterEach`, captures failure context (error message, console logs, network payload), calls Claude to generate a structured markdown triage report in `./triage-reports/` — mimicking a Senior QA Lead's bug ticket.
