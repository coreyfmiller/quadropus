/**
 * Health-check engine for the ops command center.
 * Pings each monitorable project (site reachable?) and each Supabase-backed
 * project (is the project awake, not paused?). Pure functions, no UI.
 */

import { PROJECTS, type Project } from './registry'

export type HealthState = 'healthy' | 'warning' | 'down' | 'unknown'

export interface ProjectHealth {
  id: string
  name: string
  area: Project['area']
  priority: Project['priority']
  url: string | null
  state: HealthState
  httpStatus: number | null
  responseMs: number | null
  supabase: {
    checked: boolean
    awake: boolean | null
    note: string | null
  }
  issues: string[]
  checkedAt: string
}

const TIMEOUT_MS = 8000

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      // Identify ourselves; some hosts block empty UAs.
      headers: { 'User-Agent': 'QuadropusOps/1.0', ...(init?.headers || {}) },
    })
  } finally {
    clearTimeout(timer)
  }
}

/** Is the site reachable and returning a non-error status? */
async function checkSite(url: string): Promise<{ status: number | null; ms: number | null; ok: boolean; err?: string }> {
  const start = Date.now()
  try {
    // GET (not HEAD) because some hosts/edge return odd codes for HEAD.
    const res = await fetchWithTimeout(url, { method: 'GET' })
    const ms = Date.now() - start
    return { status: res.status, ms, ok: res.status < 400 }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.name : 'error'
    return { status: null, ms: null, ok: false, err }
  }
}

/**
 * Is a Supabase project awake? A paused/deleted project's host stops resolving,
 * so the fetch throws (DNS/network). If it responds at all (even 401), it's awake.
 */
async function checkSupabase(supabaseUrl: string): Promise<{ awake: boolean | null; note: string | null }> {
  try {
    const res = await fetchWithTimeout(`${supabaseUrl}/auth/v1/health`, { method: 'GET' })
    // Any HTTP response (200, 401, 404, even 502 briefly) means the host resolved = not paused.
    if (res.status >= 500) {
      return { awake: true, note: `auth service returned ${res.status} (may be waking up)` }
    }
    return { awake: true, note: null }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.name : 'error'
    // AbortError = timeout; TypeError = DNS/connection failure (classic paused-project symptom).
    return { awake: false, note: `unreachable (${err}) — likely paused or deleted` }
  }
}

export async function checkProject(p: Project): Promise<ProjectHealth> {
  const issues: string[] = []
  let state: HealthState = 'unknown'
  let httpStatus: number | null = null
  let responseMs: number | null = null
  const supa: ProjectHealth['supabase'] = { checked: false, awake: null, note: null }

  // Run site + supabase checks in parallel.
  const [siteRes, supaRes] = await Promise.all([
    p.url ? checkSite(p.url) : Promise.resolve(null),
    p.supabaseUrl ? checkSupabase(p.supabaseUrl) : Promise.resolve(null),
  ])

  if (siteRes) {
    httpStatus = siteRes.status
    responseMs = siteRes.ms
    if (siteRes.ok) {
      state = 'healthy'
      if (siteRes.ms != null && siteRes.ms > 4000) issues.push(`slow response (${siteRes.ms}ms)`)
    } else if (siteRes.status === null) {
      state = 'down'
      issues.push(`site unreachable (${siteRes.err})`)
    } else {
      state = siteRes.status >= 500 ? 'down' : 'warning'
      issues.push(`HTTP ${siteRes.status}`)
    }
  } else {
    // No URL to check yet (registry TODO).
    state = 'unknown'
    issues.push('no live URL configured')
  }

  if (supaRes) {
    supa.checked = true
    supa.awake = supaRes.awake
    supa.note = supaRes.note
    if (supaRes.awake === false) {
      state = 'down'
      issues.push('Supabase project unreachable (likely paused)')
    } else if (supaRes.note) {
      if (state === 'healthy') state = 'warning'
      issues.push(`Supabase: ${supaRes.note}`)
    }
  }

  return {
    id: p.id,
    name: p.name,
    area: p.area,
    priority: p.priority,
    url: p.url,
    state,
    httpStatus,
    responseMs,
    supabase: supa,
    issues,
    checkedAt: new Date().toISOString(),
  }
}

export interface HealthReport {
  generatedAt: string
  summary: { total: number; healthy: number; warning: number; down: number; unknown: number }
  projects: ProjectHealth[]
}

export async function runHealthChecks(): Promise<HealthReport> {
  // Check everything that has either a URL or a Supabase backend.
  const targets = PROJECTS.filter((p) => p.url || p.supabaseUrl)
  const results = await Promise.all(targets.map(checkProject))

  // Sort: worst first, and within a state, revenue/client priority first.
  const stateOrder: Record<HealthState, number> = { down: 0, warning: 1, unknown: 2, healthy: 3 }
  const prioOrder: Record<Project['priority'], number> = {
    revenue: 0, client: 1, demo: 2, personal: 3, game: 4, parked: 5,
  }
  results.sort((a, b) =>
    stateOrder[a.state] - stateOrder[b.state] || prioOrder[a.priority] - prioOrder[b.priority]
  )

  const summary = {
    total: results.length,
    healthy: results.filter((r) => r.state === 'healthy').length,
    warning: results.filter((r) => r.state === 'warning').length,
    down: results.filter((r) => r.state === 'down').length,
    unknown: results.filter((r) => r.state === 'unknown').length,
  }

  return { generatedAt: new Date().toISOString(), summary, projects: results }
}
