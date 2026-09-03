/**
 * Daily brief generator — the "chief of staff" layer.
 * Gathers live health + recent leads, then asks Gemini to produce a short, ranked,
 * plain-English briefing with concrete suggestions, prioritized by business value.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { put, list } from '@vercel/blob'
import { runHealthChecks } from './health'
import { getLeads } from './leads'

const BLOB_KEY = 'quadropus/latest-brief.json'

export interface DailyBrief {
  generatedAt: string
  briefText: string
  stats: {
    healthy: number
    warning: number
    down: number
    unknown: number
    newLeads24h: number
  }
}

export async function generateBrief(): Promise<DailyBrief> {
  const [health, leads] = await Promise.all([runHealthChecks(), getLeads()])

  const since = Date.now() - 24 * 60 * 60 * 1000
  const newLeads = leads.filter((l) => new Date(l.createdAt).getTime() >= since)

  // Build a compact factual context for the model.
  const problems = health.projects.filter((p) => p.state === 'down' || p.state === 'warning')
  const context = {
    checkedAt: health.generatedAt,
    summary: health.summary,
    problems: problems.map((p) => ({
      name: p.name,
      area: p.area,
      priority: p.priority,
      state: p.state,
      issues: p.issues,
    })),
    healthyCount: health.summary.healthy,
    newLeads24h: newLeads.map((l) => ({ source: l.source, name: l.name, business: l.business })),
    totalLeads: leads.length,
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  let briefText: string

  if (!apiKey) {
    briefText = buildFallbackBrief(context)
  } else {
    try {
      const google = createGoogleGenerativeAI({ apiKey })
      const { text } = await generateText({
        model: google('gemini-flash-latest'),
        system: BRIEF_SYSTEM,
        prompt: `Here is today's operational data as JSON:\n\n${JSON.stringify(context, null, 2)}\n\nWrite the morning briefing.`,
      })
      briefText = text.trim()
    } catch {
      briefText = buildFallbackBrief(context)
    }
  }

  const brief: DailyBrief = {
    generatedAt: new Date().toISOString(),
    briefText,
    stats: { ...health.summary, newLeads24h: newLeads.length },
  }

  // Persist latest brief so the dashboard can show it without regenerating.
  try {
    await put(BLOB_KEY, JSON.stringify(brief), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch {
    // Non-fatal: return the brief even if persistence fails.
  }

  return brief
}

export async function getLatestBrief(): Promise<DailyBrief | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 })
    const found = blobs.find((b) => b.pathname === BLOB_KEY)
    if (!found) return null
    const res = await fetch(found.url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as DailyBrief
  } catch {
    return null
  }
}

const BRIEF_SYSTEM = `You are the Chief of Staff for Fundy Logic Inc., a solo-founder company run by Corey Miller in New Brunswick, Canada.

You write a short morning operations briefing. Your job is to turn raw monitoring data into clear decisions, like a trusted analyst handing the CEO a memo.

Business priorities (most important first):
1. Duelly (revenue SaaS, live payments)
2. MarketMojo (revenue SaaS)
3. FundyLaunch and FundyLogic (agency + AI studio, client-facing)
4. Client sites
5. Demo sites, personal tools, games (low priority)

Rules:
- Lead with what needs Corey's attention TODAY, ranked by business impact. Revenue projects being down is urgent; a demo site being down is minor.
- Be concrete and specific. If a Supabase project looks paused, say so and say "resume it in the Supabase dashboard." If a domain is down, name it.
- Mention new leads if any came in, with a nudge to follow up.
- If everything is healthy, say so briefly and confidently. Do not invent problems.
- Keep it tight: a one-line greeting, then a short ranked list, then a one-line close. Under 200 words.
- Plain text, no markdown headers. Use simple numbered or dashed lines. NEVER use em dashes; use commas or periods.
- Warm, direct, confident tone. No corporate filler.`

function buildFallbackBrief(context: {
  summary: { healthy: number; warning: number; down: number; unknown: number }
  problems: Array<{ name: string; state: string; issues: string[] }>
  newLeads24h: Array<{ source: string; name: string }>
}): string {
  const lines: string[] = ['Morning brief (generated without AI, key not set):']
  if (context.problems.length === 0) {
    lines.push(`All monitored projects are healthy (${context.summary.healthy} up).`)
  } else {
    lines.push(`${context.problems.length} project(s) need attention:`)
    for (const p of context.problems) {
      lines.push(`- ${p.name} [${p.state}]: ${p.issues.join(', ')}`)
    }
  }
  lines.push(`New leads in last 24h: ${context.newLeads24h.length}.`)
  return lines.join('\n')
}
