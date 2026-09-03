import { NextResponse } from 'next/server'
import { getLeads, addLead, type NewLead } from '@/lib/ops/leads'

export const dynamic = 'force-dynamic'

// GET: list leads. Protected by the session gate in proxy.ts (must be logged in).
export async function GET() {
  try {
    const leads = await getLeads()
    return NextResponse.json({ leads, count: leads.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'failed to load leads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: capture a lead from an external app (FundyLaunch/FundyLogic).
// Authenticated with a shared bearer token (LEADS_INGEST_TOKEN), NOT the session cookie,
// because it's called cross-origin. proxy.ts exempts POST to this path.
export async function POST(request: Request) {
  const token = process.env.LEADS_INGEST_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Lead ingestion not configured' }, { status: 500 })
  }

  const auth = request.headers.get('authorization') || ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (provided !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const source = typeof body.source === 'string' ? body.source : ''
  const email = typeof body.email === 'string' ? body.email : ''
  if (!source || !email) {
    return NextResponse.json({ error: 'source and email are required' }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
  const lead: NewLead = {
    source,
    email,
    name: str(body.name) || '',
    business: str(body.business),
    phone: str(body.phone),
    message: str(body.message ?? body.details),
    formType: str(body.formType),
  }

  try {
    const saved = await addLead(lead)
    return NextResponse.json({ ok: true, id: saved.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'failed to save lead'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
