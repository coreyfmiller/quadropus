import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Single-user login for the internal ops dashboard.
 * Checks the submitted password against QUADROPUS_PASSWORD (env) using a
 * constant-time compare, then sets an httpOnly session cookie.
 */

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  // timingSafeEqual throws if lengths differ, so guard first (still constant-ish).
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export async function POST(request: Request) {
  const expected = process.env.QUADROPUS_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: 'Auth not configured. Set QUADROPUS_PASSWORD.' },
      { status: 500 }
    )
  }

  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!password || !safeEqual(password, expected)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('quadropus_session', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
