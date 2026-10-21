# Quadropus — Current Status

**Last updated:** October 21, 2026
**Deployed:** Vercel (auto-deploys from `main`)
**Domain:** quadropus.ai
**Framework:** Next.js 16 (App Router)
**Auth:** Single-user password gate (session cookie), enforced in `proxy.ts` *and* per-route
**Database:** None. Vercel Blob for the waitlist, leads, and the stored daily brief

---

## What Quadropus IS

1. **Client-facing brand** — the public site at quadropus.ai sells AI-powered business services to SMBs
2. **Internal ops** — the command centre for all Fundy Logic Inc. products: health, leads, the daily brief, and the Brand Lab

---

## Security incident, October 21 2026 — read this before changing the gate

`proxy.ts` shipped with `AUTH_ENABLED = false` and a comment saying it was temporary. It stayed that way on a public domain. Verified exposure before the fix:

| Endpoint | What an anonymous caller got |
|---|---|
| `/dashboard`, `/dashboard/grow`, `/dashboard/command-center` | 200, full internal UI |
| `/api/dashboard/sites` | Every Vercel project on the account, with ids and domains |
| `/api/ops/health` | Health of all 20 tracked sites, including which were down |
| `/api/ops/leads` | The lead store |
| `/api/ops/daily-brief` | The stored brief |
| `POST /api/ops/domain-check` | Real domain lookups on our Porkbun/RDAP budget |
| `POST /api/ops/ideas` | Gemini generation, billed to us |

**What changed, and the rule that came out of it:**

- `AUTH_ENABLED` is now `process.env.AUTH_ENABLED !== 'false'` — it defaults ON and there is no hardcoded off switch. Disabling it is a deliberate, visible act in the Vercel settings.
- **Every route checks the session itself** via `requireOps` in `lib/ops/guard.ts`. One global flag that every route trusted is a single point of failure, and it failed. `proxy.ts` is the outer wall, not the only one.
- Endpoints that cost money are rate-limited per IP: Gemini generation 15/hr, RDAP/DNS lookups 60/hr, Porkbun confirms 30/hr, health fan-out 30/hr. In-memory, so per-instance and lost on cold start — a speed bump, not a guarantee. The session gate is the real control.
- **Never add a route under `/api/ops` without `requireOps`**, or its own bearer check as the leads ingest and cron paths have.

---

## What's Live and Working

### Public marketing site
- [x] Landing page: hero, social proof, functions, dashboard preview, how it works, AI models, pricing, vision, CTA
- [x] SEO: JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage), OpenGraph, Twitter cards
- [x] Pricing: Essentials $197/mo, Growth $497/mo, Scale $997/mo, all + $3,500 setup
- [x] Privacy Policy, Terms of Service, dynamic sitemap, robots.txt
- [x] Waitlist (email → Resend notification → Vercel Blob, deduplicated)
- [x] Vercel Analytics (production only)

### Dashboard (internal, behind the password gate)
- [x] **Overview** — stats, AI insight, recent activity (still largely hardcoded)
- [x] **Build** — live Vercel API: every project, framework, domains, last updated
- [x] **Brand Lab** (`/dashboard/grow`) — **the one fully built tool.** Gemini generates names in a chosen style with a positioning line and rationale; `.com`/`.ai` availability is checked and only names with a free domain are kept, over-generating across rounds; trademarks get a preliminary signal plus one-click USPTO/CIPO links; Porkbun confirms a likely-free domain on demand; results deep-link to Porkbun checkout. A paste box runs the same checks on your own names.
- [x] **Command Center** — governance view: products, compliance, agents, costs, alerts (hardcoded)
- [x] **Daily brief** — generated on a Vercel cron at 11:00 UTC, emailed via Resend, latest stored in Blob
- [x] **Leads** — ingested from FundyLaunch/FundyLogic via bearer token, listed in the dashboard
- [x] **Health** — fans out to every tracked site and reports up/down
- [ ] Automate, Operate, AI Agents, Outreach, Content, Analytics, Clients, Settings — placeholders

---

## What's NOT working / needs action

| Item | Status | Note |
|---|---|---|
| Client platform | ❌ Not built | No client signup, payment, or per-client dashboards |
| Database | ❌ None | Blob only; no Supabase, no RLS, no multi-user |
| Dashboard data | ⚠️ Mixed | Build, Brand Lab, health, leads and the brief are live; Overview and Command Center are hardcoded |
| Rate limiting | ⚠️ In-memory | Per-instance and lost on cold start. Needs shared storage to be a real limit |
| 8 placeholder pages | ⚠️ Empty | Automate, Operate, Agents, Outreach, Content, Analytics, Clients, Settings |
| Revenue | $0 | Waitlist phase |

---

## Environment variables

All set across production, preview and development:

| Name | Used for |
|---|---|
| `QUADROPUS_PASSWORD` | The single-user login. Also in the gitignored `.env.local` |
| `CRON_SECRET` | Authenticates the Vercel cron to `/api/ops/daily-brief` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini, for Brand Lab and the daily brief |
| `PORKBUN_API_KEY` / `PORKBUN_SECRET_KEY` | Authoritative domain confirms. These were local-only for a while, so Verify silently never worked in production |
| `VERCEL_API_TOKEN` / `VERCEL_TEAM_ID` | The Build page's project list |
| `RESEND_API_KEY` | Waitlist and brief emails |
| `LEADS_INGEST_TOKEN` | **Not set.** Lead ingestion returns 500 until it is |

---

## Architecture

```
quadropus.ai
  ├── /                      public marketing page
  ├── /privacy, /terms       public
  ├── /login                 public (sets the session cookie)
  └── /dashboard/*           gated: 11 routes

APIs
  ├── /api/waitlist          public
  ├── /api/auth/login|logout public
  ├── /api/dashboard/sites   gated
  └── /api/ops/*             gated by requireOps, except:
        ├── POST /leads        bearer LEADS_INGEST_TOKEN (cross-origin)
        └── /daily-brief       bearer CRON_SECRET, or a session

Storage: Vercel Blob (waitlist, leads, latest brief). No database.
```

---

## Business model

| Tier | Monthly | Setup | Includes |
|---|---|---|---|
| Essentials | $197 | $3,500 | Site, SEO, AI chat agent, GBP, hosting, maintenance |
| Growth | $497 | $3,500 | + blog, booking, lead follow-up, GBP posts, reviews |
| Scale | $997 | $3,500 | + Google Ads, strategy calls, advanced analytics, priority support |

Target: SMBs, initially Atlantic Canada. Done-for-you services, not self-service SaaS.

| Product | Stage | Revenue |
|---|---|---|
| Duelly | Live | Credit packs |
| GetBetter | Live, personal | $0 |
| MarketMojo | Active development | Subscription-ready |
| HikeMind | Pre-launch | $0 |
| Client sites | Live | Service contracts |

---

## What's next (priority order)

1. **Set `LEADS_INGEST_TOKEN`** — lead ingestion is broken without it
2. **Replace in-memory rate limiting** with shared storage if the ops APIs ever face the public
3. **Make Command Center and Overview live** instead of hardcoded
4. **Client platform** — Supabase auth, Stripe checkout, per-client dashboards, RLS
5. **Fill the placeholder pages**, in the order they earn their place
