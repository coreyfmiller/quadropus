import { NextResponse } from 'next/server'
import { checkDomains } from '@/lib/ops/domains'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// POST { domains: string[] } -> availability results. Session-gated by proxy.ts.
export async function POST(request: Request) {
  let domains: string[] = []
  try {
    const body = await request.json()
    if (Array.isArray(body?.domains)) domains = body.domains.filter((d: unknown) => typeof d === 'string')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (domains.length === 0) {
    return NextResponse.json({ error: 'No domains provided' }, { status: 400 })
  }
  if (domains.length > 80) domains = domains.slice(0, 80)

  try {
    const results = await checkDomains(domains)
    return NextResponse.json({ results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'domain check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
