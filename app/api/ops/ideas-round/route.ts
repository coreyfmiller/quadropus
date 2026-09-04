import { NextResponse } from 'next/server'
import { runOneRound, type NameStyle, type Perspective } from '@/lib/ops/ideas'

export const dynamic = 'force-dynamic'
// One round is quick; keep a comfortable budget but this should finish in ~10-30s.
export const maxDuration = 60

const VALID_STYLES: NameStyle[] = ['evocative', 'coined', 'compound', 'playful', 'literal']
const VALID_PERSPECTIVES: Perspective[] = ['customer', 'buyer', 'both']

/**
 * POST { niche?, styles?, perspective?, batchSize?, avoid?: string[] }
 * Runs ONE generate+check pass and returns { found, tried, checkedCount }.
 * The frontend calls this repeatedly, passing back the growing `avoid` list,
 * to accumulate results without ever risking a serverless timeout.
 * Session-gated by proxy.ts.
 */
export async function POST(request: Request) {
  let niche = ''
  let styles: NameStyle[] = []
  let perspective: Perspective = 'both'
  let batchSize: number | undefined
  let avoid: string[] = []
  let tlds: string[] | undefined
  try {
    const body = await request.json()
    if (typeof body?.niche === 'string') niche = body.niche
    if (Array.isArray(body?.styles)) styles = body.styles.filter((s: unknown) => VALID_STYLES.includes(s as NameStyle))
    if (VALID_PERSPECTIVES.includes(body?.perspective)) perspective = body.perspective
    if (typeof body?.batchSize === 'number') batchSize = Math.min(Math.max(body.batchSize, 3), 15)
    if (Array.isArray(body?.avoid)) avoid = body.avoid.filter((a: unknown) => typeof a === 'string').slice(-200)
    if (Array.isArray(body?.tlds)) tlds = body.tlds.filter((t: unknown) => typeof t === 'string')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const out = await runOneRound({ niche, styles, perspective, batchSize, avoid, tlds })
    return NextResponse.json(out)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'round failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
