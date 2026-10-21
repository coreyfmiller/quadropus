# Quadropus — TODO

**Last updated:** October 21, 2026

---

## P0 — Security follow-ups

The auth gate was off in production for weeks (see CURRENT_STATUS.md). It's fixed, but these remain:

- [ ] **Set `LEADS_INGEST_TOKEN`** in Vercel. `POST /api/ops/leads` returns 500 without it, so FundyLaunch and FundyLogic cannot deliver leads at all right now.
- [ ] **Replace the in-memory rate limiter** (`lib/ops/guard.ts`) with shared storage — Upstash Redis or similar. The current one is per-serverless-instance and resets on cold start, so it is a speed bump rather than a limit.
- [ ] **Rotate the credentials that were exposed while the dashboard was open**: `VERCEL_API_TOKEN` especially, since `/api/dashboard/sites` was handing out the project list to anyone. There's no evidence of abuse, but the token was reachable for weeks.
- [ ] Consider a second factor, or an allowlist, if the dashboard ever holds client data.

---

## P1 — Make the dashboard honest

Several panels show numbers that aren't real. That's the same class of problem as the auth flag: it looks finished and isn't.

- [ ] **Overview** — stats (6 sites, 47 AI conversations, $14.5k pipeline) are hardcoded. Either wire them up or show empty states.
- [ ] **Command Center** — products, compliance matrix, agents, costs, alerts are all hardcoded.
- [ ] Audit every dashboard panel for invented figures and remove or derive them.

---

## P2 — Client platform (revenue)

- [ ] Supabase project: auth (Google OAuth + email), client profiles, client sites, RLS so clients see only their own rows
- [ ] Stripe Checkout: $3,500 setup + monthly tier
- [ ] Post-payment: auto-create the client account, welcome email via Resend
- [ ] Per-client dashboard: their sites, health scores, reports, chat transcripts
- [ ] Role split: admin (all clients + Command Center) vs client (own data only)
- [ ] Monthly report PDF, generated and emailed

---

## P3 — Brand Lab improvements

The one tool that's genuinely finished. Possible additions, none urgent:

- [ ] Save shortlists, so a session's good names survive a reload
- [ ] More TLDs beyond `.com`/`.ai` (`.co`, `.io`, country codes)
- [ ] Social handle availability, which the naming steering file says is a required step and the tool doesn't cover
- [ ] Batch Porkbun confirms, within the ~1 request / 10s account limit
- [ ] Export a shortlist to CSV or the daily brief

---

## P4 — Remaining dashboard pages

In the order they'd actually earn their place:

- [ ] **Outreach** — prospect search (reuse MarketMojo's engine), campaign builder, send tracking
- [ ] **Content** — AI-assisted blog drafts, GBP post scheduler, calendar
- [ ] **Operate** — MRR per client, pipeline, invoices, churn risk
- [ ] **Automate** — per-client chat agent deployment, training, escalation rules
- [ ] **Analytics** — cross-client traffic, conversation analytics, ROI
- [ ] **Clients** — the list view that the client platform needs
- [ ] **Settings** — whatever is actually configurable by then

---

## P5 — Infrastructure

- [ ] Error tracking (Sentry, or Vercel's own)
- [ ] Uptime alerting that routes somewhere — critical to SMS, warnings to email
- [ ] Health history, so `/api/ops/health` shows a trend rather than only now
- [ ] Cost trend graphs for the AI spend

---

## Done

- [x] Public marketing site: landing page, SEO, JSON-LD, pricing, privacy, terms, sitemap, robots
- [x] Waitlist (Resend + Vercel Blob)
- [x] Dashboard scaffold, 11 routes
- [x] Build page — live Vercel API
- [x] **Brand Lab** — Gemini naming, `.com`/`.ai` availability with only-available filtering, trademark signals with USPTO/CIPO links, Porkbun confirm, Porkbun checkout deep-links, and a paste box for your own names
- [x] Command Center (hardcoded, but built)
- [x] Daily brief — Vercel cron, Gemini, emailed, stored in Blob
- [x] Lead ingestion endpoint and dashboard list
- [x] Site health checks
- [x] Login + session gate, defaulting secure
- [x] Per-route auth and rate limiting (`lib/ops/guard.ts`)
- [x] `QUADROPUS_PASSWORD`, `CRON_SECRET`, and the Porkbun keys configured in Vercel
- [x] CURRENT_STATUS.md and TODO.md, tracked in git this time
