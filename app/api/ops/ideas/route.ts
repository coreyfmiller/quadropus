import { findAvailableIdeas, type NameStyle } from '@/lib/ops/ideas'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const VALID_STYLES: NameStyle[] = ['evocative', 'coined', 'compound', 'playful', 'literal']

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
  let target = 20
  try {
    const body = await request.json()
    if (typeof body?.niche === 'string') niche = body.niche
    if (Array.isArray(body?.styles)) styles = body.styles.filter((s: unknown) => VALID_STYLES.includes(s as NameStyle))
    if (typeof body?.target === 'number') target = Math.min(Math.max(body.target, 1), 30)
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
          target,
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
