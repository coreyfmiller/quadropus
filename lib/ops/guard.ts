import { NextResponse } from 'next/server'

/**
 * Per-route access control and rate limiting for the ops APIs.
 *
 * ## Why this exists
 *
 * Every ops route used to carry the comment "Session-gated by proxy.ts" and no
 * check of its own. `proxy.ts` then had a single `AUTH_ENABLED = false` left in
 * from a building session, and the whole internal dashboard — the Vercel API
 * token, the site health report, the lead store, and the endpoints that spend
 * Gemini and Porkbun quota — answered to anyone on the public internet.
 *
 * One flag that every route trusts is a single point of failure, and it failed.
 * So the gate is now defence in depth: `proxy.ts` still runs first and is the
 * cheap outer wall, but each route that costs money or exposes data also checks
 * for itself. Turning the outer gate off can no longer open the inner ones.
 *
 * **Never add a route under /api/ops that doesn't call `requireOps` (or verify
 * its own bearer token, as the leads and cron endpoints do).**
 */

const SESSION_COOKIE = 'quadropus_session'

/** Is this request carrying a valid ops session cookie? */
export function hasSession(request: Request): boolean {
  const cookie = request.headers.get('cookie') || ''
  // Match the cookie as its own name=value pair, so `not_quadropus_session=1`
  // can't satisfy it.
  return /(?:^|;\s*)quadropus_session=1(?:;|$)/.test(cookie)
}

/** Does this request carry the given shared secret as a bearer token? */
export function hasBearer(request: Request, secret: string | undefined): boolean {
  if (!secret) return false
  const auth = request.headers.get('authorization') || ''
  return auth.startsWith('Bearer ') && auth.slice(7) === secret
}

/**
 * The caller's best-known address, for rate limiting.
 *
 * Behind Vercel, `x-forwarded-for` is set by the platform and its first entry
 * is the client. Falls back to a single shared bucket, which is deliberately
 * strict rather than permissive: an unknown caller shares a limit with every
 * other unknown caller.
 */
export function clientKey(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

type Bucket = { count: number; resetAt: number }

/**
 * In-memory sliding counters.
 *
 * Honest about what this is: per serverless instance, lost on cold start, and
 * multiplied by however many instances are warm. It is a speed bump against
 * a casual loop, not a guarantee — the session gate is the real control, and
 * the provider-side limits (Porkbun's ~1 request / 10s) are the backstop. A
 * real limiter needs shared storage, which this project doesn't have yet.
 */
const buckets = new Map<string, Bucket>()

/** Keeps the map from growing without bound on a long-lived instance. */
function sweep(now: number) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number }

export function rateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  sweep(now)
  const key = `${name}:${clientKey(request)}`
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) }
  }

  existing.count += 1
  return { ok: true }
}

/** Budgets for the endpoints that cost real money, per IP. */
export const LIMITS = {
  /** Gemini generation. The most expensive thing here. */
  generate: { limit: 15, windowMs: 60 * 60 * 1000 },
  /** RDAP/DNS lookups — cheap but noisy, and they feed the Porkbun stage. */
  lookup: { limit: 60, windowMs: 60 * 60 * 1000 },
  /** Porkbun confirms. The provider allows ~1 per 10 seconds, account-wide. */
  porkbun: { limit: 30, windowMs: 60 * 60 * 1000 },
  /** Outbound fetches to every tracked site. */
  health: { limit: 30, windowMs: 60 * 60 * 1000 },
} as const

/**
 * The one call every ops route should make first.
 *
 * Returns a Response to send back when the request must be refused, or null
 * when it may proceed. `cost` picks the rate-limit budget; omit it for routes
 * that only read local state.
 */
export function requireOps(
  request: Request,
  cost?: keyof typeof LIMITS,
): Response | null {
  if (!hasSession(request)) {
    // Deliberately terse: an unauthenticated caller learns nothing about what
    // lives here.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (cost) {
    const { limit, windowMs } = LIMITS[cost]
    const verdict = rateLimit(request, cost, limit, windowMs)
    if (!verdict.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Give it a minute.' },
        { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSeconds) } },
      )
    }
  }

  return null
}
