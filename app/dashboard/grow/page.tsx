'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles, Loader2, Check, X, HelpCircle, ExternalLink } from 'lucide-react'

type DomainStatus = 'available' | 'taken' | 'unknown'

interface DomainResult {
  domain: string
  tld: string
  status: DomainStatus
  confidence: 'confirmed' | 'likely'
  method: 'rdap' | 'dns'
  registerUrl: string | null
}

interface Idea {
  name: string
  pitch: string
  audience: string
  domains: string[]
}

export default function GrowPage() {
  const [niche, setNiche] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [domainMap, setDomainMap] = useState<Record<string, DomainResult>>({})
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setIdeas([])
    setDomainMap({})
    try {
      const res = await fetch('/api/ops/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, count: 6 }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error || `Failed (${res.status})`)
      }
      const data = await res.json()
      const list: Idea[] = data.ideas || []
      setIdeas(list)
      // Kick off domain checks for all candidates.
      void checkDomains(list.flatMap((i) => i.domains))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate ideas')
    } finally {
      setLoading(false)
    }
  }

  const checkDomains = async (domains: string[]) => {
    if (domains.length === 0) return
    setChecking(true)
    try {
      const res = await fetch('/api/ops/domain-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains }),
      })
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, DomainResult> = {}
        for (const r of data.results as DomainResult[]) map[r.domain] = r
        setDomainMap(map)
      }
    } catch {
      // leave domains unknown
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand">
          <Lightbulb className="size-[18px]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Idea Lab</h1>
          <p className="text-[13px] font-light text-muted-foreground">
            Generate brandable ideas and check .com / .ai availability in one shot.
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={generate} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="A niche or vibe (e.g. AI tools for tradespeople), or leave blank for a mix"
          className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {checking && (
        <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Checking domain availability...
        </p>
      )}

      {/* Ideas grid */}
      {ideas.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <div key={idea.name} className="flex flex-col rounded-xl border border-border bg-secondary/40 p-5">
              <h3 className="font-display text-lg font-bold text-foreground">{idea.name}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{idea.pitch}</p>
              {idea.audience && (
                <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                  For: {idea.audience}
                </p>
              )}
              <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                {idea.domains.map((d) => (
                  <DomainRow key={d} domain={d} result={domainMap[d]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ideas.length === 0 && !error && (
        <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Enter a niche (or leave it blank) and hit Generate. Each idea comes with .com and .ai
            availability checked automatically.
          </p>
        </div>
      )}
    </div>
  )
}

function DomainRow({ domain, result }: { domain: string; result?: DomainResult }) {
  let icon = <HelpCircle className="size-3.5 text-muted-foreground/50" />
  let label = 'checking...'
  let labelClass = 'text-muted-foreground'

  if (result) {
    if (result.status === 'available') {
      icon = <Check className="size-3.5 text-emerald-400" />
      label = result.confidence === 'likely' ? 'likely available' : 'available'
      labelClass = 'text-emerald-400'
    } else if (result.status === 'taken') {
      icon = <X className="size-3.5 text-red-400/70" />
      label = 'taken'
      labelClass = 'text-muted-foreground'
    } else {
      icon = <HelpCircle className="size-3.5 text-amber-400" />
      label = 'unknown'
      labelClass = 'text-amber-400'
    }
  }

  const isAvailable = result?.status === 'available'

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className={isAvailable ? 'font-medium text-foreground' : 'text-muted-foreground'}>{domain}</span>
      <span className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 text-[11px] ${labelClass}`}>
          {icon}
          {label}
        </span>
        {isAvailable && result?.registerUrl && (
          <a
            href={result.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
          >
            register <ExternalLink className="size-3" />
          </a>
        )}
      </span>
    </div>
  )
}
