import { NextResponse } from 'next/server'
import { porkbunCheck } from '@/lib/ops/porkbun'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

// POST { domain } -> authoritative Porkbun availability for ONE domain.
// Rate-limited by Porkbun (~1 / 10s), so this is a single on-demand confirm.
// Session-gated by proxy.ts.
export async function POST(request: Request) {
  let domain = ''
  try {
    const body = await request.json()
    if (typeof body?.domain === 'string') domain = body.domain.trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!domain) return NextResponse.json({ error: 'No domain provided' }, { status: 400 })

  const result = await porkbunCheck(domain)
  return NextResponse.json(result)
}
