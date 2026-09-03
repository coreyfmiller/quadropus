import { findAvailableIdeas, type NameStyle, type Perspective } from '@/lib/ops/ideas'

export const dynamic = 'force-dynamic'
// Accuracy over speed: throttled/retried domain checks take longer, so use the max budget.
export const maxDuration = 300

const VALID_STYLES: NameStyle[] = ['evocative', 'coined', 'compound', 'playful', 'literal']
const VALID_PERSPECTIVES: Perspective[] = ['customer', 'buyer', 'both']

/**
 * POST { niche?, styles?: NameStyle[], target?: number }
 * Streams newline-delimited JSON events as it finds AVAILABLE ideas:
 *   {"type":"progress","checked":N,"found":N,"round":N}
 *   {"type":"done","results":[...]}
 *   {"type":"error","error":"..."}
 * Session-gated by proxy.ts.
 */
export async function POST(request: Request) {
  let niche = ''
  let styles: NameStyle[] = []
  let perspective: Perspective = 'both'
  let target = 20
  let batchSize: number | undefined
  let maxRounds: number | undefined
  try {
    const body = await request.json()
    if (typeof body?.niche === 'string') niche = body.niche
    if (Array.isArray(body?.styles)) styles = body.styles.filter((s: unknown) => VALID_STYLES.includes(s as NameStyle))
    if (VALID_PERSPECTIVES.includes(body?.perspective)) perspective = body.perspective
    if (typeof body?.target === 'number') target = Math.min(Math.max(body.target, 1), 30)
    if (typeof body?.batchSize === 'number') batchSize = Math.min(Math.max(body.batchSize, 3), 15)
    if (typeof body?.maxRounds === 'number') maxRounds = Math.min(Math.max(body.maxRounds, 1), 20)
  } catch {
    // defaults are fine
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      try {
        const results = await findAvailableIdeas({
          niche,
          styles,
          perspective,
          target,
          batchSize,
          maxRounds,
          onProgress: (info) => send({ type: 'progress', ...info }),
        })
        send({ type: 'done', results })
      } catch (e) {
        send({ type: 'error', error: e instanceof Error ? e.message : 'generation failed' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
