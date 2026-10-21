import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Internal-only access gate for the Quadropus ops command center.
 * Protects /dashboard and the ops APIs behind a single-user session cookie.
 * The cookie is set by /api/auth/login after checking QUADROPUS_PASSWORD.
 *
 * Next.js 16 uses the `proxy` file convention (formerly `middleware`).
 */

const SESSION_COOKIE = 'quadropus_session'

/**
 * Defaults to ON, and can only be switched off by explicitly setting
 * AUTH_ENABLED=false in the environment.
 *
 * This used to be a hardcoded `false` with a "TEMPORARY, flip it back" comment.
 * It shipped, and the entire internal dashboard — the Vercel API token, the
 * health report across every site, the lead store, and the endpoints that spend
 * Gemini and Porkbun quota — was reachable by anyone for weeks.
 *
 * So: no hardcoded off switch. Forgetting to set an env var now fails secure,
 * and disabling the gate takes a deliberate act that is visible in the Vercel
 * settings rather than invisible in a source comment. The routes themselves
 * also check the session (see lib/ops/guard.ts), so this is the outer wall
 * rather than the only one.
 */
const AUTH_ENABLED = process.env.AUTH_ENABLED !== 'false'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Gate is off: let everything through.
  if (!AUTH_ENABLED) return NextResponse.next()

  // These POST endpoints authenticate with their own bearer token (checked in the route),
  // so they bypass the session gate: lead ingestion (cross-origin from FundyLaunch/FundyLogic)
  // and the daily-brief cron (triggered by Vercel cron with CRON_SECRET). GET on these paths
  // still requires a session.
  if (
    request.method === 'POST' &&
    (pathname === '/api/ops/leads' || pathname === '/api/ops/daily-brief')
  ) {
    return NextResponse.next()
  }

  // Vercel cron hits the daily brief via GET with an Authorization bearer header.
  // Let it through (the route verifies CRON_SECRET); dashboard GET still needs a session.
  if (
    pathname === '/api/ops/daily-brief' &&
    request.method === 'GET' &&
    request.headers.get('authorization')?.startsWith('Bearer ')
  ) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === '1'
  if (hasSession) return NextResponse.next()

  // Not authenticated: send page requests to /login, and reject API calls with 401.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Gate the dashboard and the ops APIs. Leave the public marketing site,
  // the login page, the login API, and static assets open.
  matcher: ['/dashboard/:path*', '/api/ops/:path*', '/api/dashboard/:path*'],
}
