'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

interface DailyBrief {
  generatedAt: string
  briefText: string
  stats: { healthy: number; warning: number; down: number; unknown: number; newLeads24h: number }
}

export function BriefPanel() {
  const [brief, setBrief] = useState<DailyBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLatest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ops/daily-brief', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBrief(data.brief || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const runNow = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/ops/daily-brief', { method: 'POST' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      if (data.brief) setBrief(data.brief)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate brief')
    } finally {
      setRunning(false)
    }
  }, [])

  useEffect(() => {
    loadLatest()
  }, [loadLatest])

  return (
    <section className="rounded-xl border border-brand/25 bg-brand/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/15">
            <Sparkles className="size-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Daily Brief
            </h2>
            <p className="text-sm text-foreground">Your morning chief-of-staff memo</p>
          </div>
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Generating...' : 'Run now'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading latest brief...</p>
        ) : brief ? (
          <>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {brief.briefText}
            </pre>
            <p className="mt-3 text-[10.5px] text-muted-foreground">
              Generated {new Date(brief.generatedAt).toLocaleString()} ·{' '}
              {brief.stats.down} down, {brief.stats.warning} warning, {brief.stats.healthy} healthy ·{' '}
              {brief.stats.newLeads24h} new leads (24h)
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No brief yet. Click <span className="text-foreground">Run now</span> to generate your first
            one, or wait for the morning cron.
          </p>
        )}
      </div>
    </section>
  )
}
