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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
