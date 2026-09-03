import { NextResponse } from 'next/server'
import { generateBrief, getLatestBrief } from '@/lib/ops/brief'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * GET: two behaviors.
 * - Vercel cron (sends `Authorization: Bearer <CRON_SECRET>`): generate a fresh brief + email it.
 * - Otherwise (dashboard, session-gated by proxy.ts): return the latest stored brief.
 * Vercel cron jobs invoke endpoints via GET, so generation lives here.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  const isCron = !!cronSecret && auth === `Bearer ${cronSecret}`

  if (isCron) {
    return runAndEmail()
  }

  const brief = await getLatestBrief()
  return NextResponse.json({ brief })
}

/**
 * POST: generate a fresh brief and email it now (the "Run now" button on the dashboard).
 * proxy.ts exempts POST here; we accept a logged-in session or the cron secret.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  const isCron = !!cronSecret && auth === `Bearer ${cronSecret}`
  const isSession = request.headers.get('cookie')?.includes('quadropus_session=1')

  if (!isCron && !isSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runAndEmail()
}

async function runAndEmail() {
  try {
    const brief = await generateBrief()
    await emailBrief(brief.briefText)
    return NextResponse.json({ ok: true, brief })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'brief generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function emailBrief(briefText: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const html = `<div style="font-family:system-ui,sans-serif;max-width:620px">
    <h2 style="color:#0a0a0f">Quadropus Daily Brief</h2>
    <pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#222">${escapeHtml(
      briefText
    )}</pre>
    <p style="color:#888;font-size:12px">Generated ${new Date().toLocaleString()} by Quadropus ops.</p>
  </div>`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Quadropus Ops <onboarding@resend.dev>',
        to: 'coreyfmiller@gmail.com',
        subject: 'Quadropus Daily Brief',
        html,
      }),
    })
  } catch {
    // Non-fatal.
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
