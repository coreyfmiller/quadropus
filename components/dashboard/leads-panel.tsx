'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Inbox, Mail, Building2, Phone } from 'lucide-react'

interface Lead {
  id: string
  source: string
  name: string
  email: string
  business?: string
  phone?: string
  message?: string
  formType?: string
  createdAt: string
}

const SOURCE_LABEL: Record<string, string> = {
  fundylaunch: 'FundyLaunch',
  fundylogic: 'FundyLogic',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ops/leads', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="rounded-xl border border-border bg-secondary/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Recent Leads
          </h2>
          <p className="mt-1 text-sm text-foreground">
            {loading ? 'Loading...' : `${leads.length} captured`}
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

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-10 text-center">
          <Inbox className="size-6 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No leads captured yet.</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            New contact-form submissions from FundyLaunch and FundyLogic will appear here.
          </p>
        </div>
      )}

      {leads.length > 0 && (
        <div className="mt-4 space-y-2">
          {leads.slice(0, 15).map((lead) => (
            <div key={lead.id} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {lead.name || lead.email}
                  </span>
                  <span className="shrink-0 rounded-full bg-brand/12 px-2 py-0.5 text-[10px] font-medium text-brand">
                    {SOURCE_LABEL[lead.source] || lead.source}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(lead.createdAt)}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3" /> {lead.email}
                </span>
                {lead.business && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3" /> {lead.business}
                  </span>
                )}
                {lead.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" /> {lead.phone}
                  </span>
                )}
              </div>
              {lead.message && (
                <p className="mt-1.5 line-clamp-2 text-[12px] text-foreground/80">{lead.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
