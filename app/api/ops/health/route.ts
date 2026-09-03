import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/ops/health'

// Always run fresh; never cache health.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  try {
    const report = await runHealthChecks()
    return NextResponse.json(report)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'health check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
