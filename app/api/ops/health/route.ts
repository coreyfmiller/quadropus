import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/ops/health'
import { requireOps } from '@/lib/ops/guard'

// Always run fresh; never cache health.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Reports which of the tracked sites are up.
 *
 * Rate-limited because each call fans out a fetch to every site, and gated
 * because "which of these are down right now" is not public information.
 */
export async function GET(request: Request) {
  const refused = requireOps(request, 'health')
  if (refused) return refused

  try {
    const report = await runHealthChecks()
    return NextResponse.json(report)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'health check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
