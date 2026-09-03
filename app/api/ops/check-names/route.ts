import { NextResponse } from 'next/server'
import { checkNames } from '@/lib/ops/ideas'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { names: string[] } -> availability + trademark for each user-supplied name.
// Session-gated by proxy.ts.
export async function POST(request: Request) {
  let names: string[] = []
  try {
    const body = await request.json()
    if (Array.isArray(body?.names)) names = body.names.filter((n: unknown) => typeof n === 'string')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (names.length === 0) return NextResponse.json({ error: 'No names provided' }, { status: 400 })

  try {
    const results = await checkNames(names)
    return NextResponse.json({ results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
