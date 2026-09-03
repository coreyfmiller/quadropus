import { NextResponse } from 'next/server'
import { generateIdeas } from '@/lib/ops/ideas'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { niche?: string, count?: number } -> generated ideas. Session-gated by proxy.ts.
export async function POST(request: Request) {
  let niche = ''
  let count = 6
  try {
    const body = await request.json()
    if (typeof body?.niche === 'string') niche = body.niche
    if (typeof body?.count === 'number') count = Math.min(Math.max(body.count, 1), 10)
  } catch {
    // empty body is fine (generates diverse ideas)
  }

  try {
    const ideas = await generateIdeas(niche, count)
    return NextResponse.json({ ideas })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'idea generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
