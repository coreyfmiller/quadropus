'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'

type HealthState = 'healthy' | 'warning' | 'down' | 'unknown'

interface ProjectHealth {
  id: string
  name: string
  area: string
  priority: string
  url: string | null
  state: HealthState
  httpStatus: number | null
  responseMs: number | null
  supabase: { checked: boolean; awake: boolean | null; note: string | null }
  issues: string[]
  checkedAt: string
}

interface HealthReport {
  generatedAt: string
  summary: { total: number; healthy: number; warning: number; down: number; unknown: number }
  projects: ProjectHealth[]
}

const AREA_LABELS: Record<string, string> = {
  personal: 'Personal Projects',
  client: 'Clients',
  'potential-client': 'Potential Clients',
  demo: 'Demo Sites',
  game: 'Games',
}

const stateStyles: Record<HealthState, { dot: string; label: string; text: string }> = {
  healthy: { dot: 'bg-emerald-500', label: 'Healthy', text: 'text-emerald-400' },
  warning: { dot: 'bg-amber-500', label: 'Warning', text: 'text-amber-400' },
  down: { dot: 'bg-red-500', label: 'Down', text: 'text-red-400' },
  unknown: { dot: 'bg-muted-foreground/40', label: 'Unknown', text: 'text-muted-foreground' },
}

function StateIcon({ state }: { state: HealthState }) {
  const cls = 'size-3.5'
  if (state === 'healthy') return <CheckCircle2 className={`${cls} text-emerald-400`} />
  if (state === 'warning') return <AlertTriangle className={`${cls} text-amber-400`} />
  if (state === 'down') return <XCircle className={`${cls} text-red-400`} />
  return <HelpCircle className={`${cls} text-muted-foreground`} />
}

export function HealthPanel() {
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ops/health', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Health check failed (${res.status})`)
      setReport(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load health')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Auto-refresh every 5 minutes while the page is open.
    const t = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [load])

  const summary = report?.summary
  const grouped = (report?.projects || []).reduce<Record<string, ProjectHealth[]>>((acc, p) => {
    ;(acc[p.area] ||= []).push(p)
    return acc
  }, {})

  return (
    <section className="rounded-xl border border-border bg-secondary/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Live Service Health
          </h2>
          <p className="mt-1 text-sm text-foreground">
            {summary
              ? `${summary.total} projects checked`
              : loading
                ? 'Checking all projects...'
                : 'Health status'}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary counters */}
      {summary && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          <SummaryStat label="Healthy" value={summary.healthy} className="text-emerald-400" />
          <SummaryStat label="Warning" value={summary.warning} className="text-amber-400" />
          <SummaryStat label="Down" value={summary.down} className="text-red-400" />
          <SummaryStat label="Unknown" value={summary.unknown} className="text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Project list grouped by area, worst first (already sorted by API) */}
      {report && (
        <div className="mt-5 space-y-5">
          {Object.entries(grouped).map(([area, projects]) => (
            <div key={area}>
              <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {AREA_LABELS[area] || area}
              </p>
              <div className="space-y-1.5">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`size-2 shrink-0 rounded-full ${stateStyles[p.state].dot}`} />
                      <span className="truncate text-sm text-foreground">{p.name}</span>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          {p.url.replace('https://', '')}
                        </a>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {p.issues.length > 0 && (
                        <span className="hidden max-w-[280px] truncate text-[11px] text-muted-foreground sm:block">
                          {p.issues.join(' · ')}
                        </span>
                      )}
                      {p.responseMs != null && p.state === 'healthy' && (
                        <span className="text-[11px] text-muted-foreground">{p.responseMs}ms</span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${stateStyles[p.state].text}`}>
                        <StateIcon state={p.state} />
                        {stateStyles[p.state].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {report && (
        <p className="mt-4 text-[10.5px] text-muted-foreground">
          Last checked {new Date(report.generatedAt).toLocaleString()}
        </p>
      )}
    </section>
  )
}

function SummaryStat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-center">
      <div className={`text-2xl font-semibold ${className}`}>{value}</div>
      <div className="mt-0.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
