import { NextResponse } from 'next/server'
import { getLeads, addLead, type NewLead } from '@/lib/ops/leads'
import { hasBearer, requireOps } from '@/lib/ops/guard'

export const dynamic = 'force-dynamic'

// GET: list leads. Personal data, so it checks the session itself rather than
// relying only on proxy.ts.
export async function GET(request: Request) {
  const refused = requireOps(request)
  if (refused) return refused

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

  // proxy.ts exempts POST here so FundyLaunch/FundyLogic can reach it
  // cross-origin, which makes this bearer check the only gate on the path.
  if (!hasBearer(request, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  const source = str(body.source)
  const email = str(body.email)
  const phone = str(body.phone)

  // A lead needs a source and *some* way to reach the person. Requiring `email`
  // specifically rejected every phone lead from the voice agent, which posts a
  // customer number and often no email at all — the transcript only yields one if
  // the caller happened to spell it out.
  if (!source) {
    return NextResponse.json({ error: 'source is required' }, { status: 400 })
  }
  if (!email && !phone) {
    return NextResponse.json({ error: 'email or phone is required' }, { status: 400 })
  }

  // The senders disagree on what the free-text field is called: the web forms send
  // `message` or `details`, the voice webhook sends `summary`. Accept all three
  // rather than silently storing a lead with no content.
  const structured = body.structured
  const lead: NewLead = {
    source,
    email,
    phone,
    name: str(body.name) || '',
    business: str(body.business),
    message: str(body.message ?? body.details ?? body.summary),
    wants: str(body.wants),
    formType: str(body.formType),
    structured:
      structured && typeof structured === 'object' ? (structured as Record<string, unknown>) : undefined,
  }

  try {
    const saved = await addLead(lead)
    return NextResponse.json({ ok: true, id: saved.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'failed to save lead'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
