import { NextResponse } from 'next/server'
import { porkbunCheck } from '@/lib/ops/porkbun'
import { requireOps } from '@/lib/ops/guard'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

// POST { domain } -> authoritative Porkbun availability for ONE domain.
// Porkbun allows roughly one request every 10 seconds *per account*, so an
// unthrottled caller here exhausts the budget this tool depends on.
export async function POST(request: Request) {
  const refused = requireOps(request, 'porkbun')
  if (refused) return refused

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
