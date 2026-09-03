'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles, Loader2, Check, ExternalLink, ShieldAlert, Scale, Info } from 'lucide-react'

type NameStyle = 'evocative' | 'coined' | 'compound' | 'playful' | 'literal'
type Perspective = 'customer' | 'buyer' | 'both'

interface DomainResult {
  domain: string
  tld: string
  status: 'available' | 'taken' | 'unknown'
  confidence: 'confirmed' | 'likely'
  registerUrl: string | null
}

interface TrademarkCheck {
  flag: 'clear-signal' | 'caution'
  reason: string
  usptoUrl: string
  cipoUrl: string
}

interface IdeaResult {
  idea: string
  name: string
  tagline: string
  why: string
  audience: string
  available: DomainResult[]
  trademark: TrademarkCheck
}

const STYLES: { id: NameStyle; label: string; hint: string }[] = [
  { id: 'evocative', label: 'Evocative', hint: 'Real words with feeling' },
  { id: 'coined', label: 'Coined', hint: 'Fresh invented words' },
  { id: 'compound', label: 'Compound', hint: 'Two words joined' },
  { id: 'playful', label: 'Playful', hint: 'Unexpected, memorable' },
  { id: 'literal', label: 'Literal', hint: 'Clear and descriptive' },
]

const PERSPECTIVES: { id: Perspective; label: string; hint: string }[] = [
  { id: 'customer', label: 'End user', hint: 'The person using it is the hero' },
  { id: 'buyer', label: 'Buyer', hint: 'The business purchasing it is the hero' },
  { id: 'both', label: 'Both', hint: 'Works for both sides of a marketplace' },
]

export default function GrowPage() {
  const [niche, setNiche] = useState('')
  const [styles, setStyles] = useState<NameStyle[]>([])
  const [perspective, setPerspective] = useState<Perspective>('both')
  const [results, setResults] = useState<IdeaResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ checked: number; found: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleStyle = (s: NameStyle) => {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setRunning(true)
    setError(null)
    setResults([])
    setProgress({ checked: 0, found: 0 })
    try {
      const res = await fetch('/api/ops/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, styles, perspective, target: 20 }),
      })
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error || `Failed (${res.status})`)
      }
      // Read the newline-delimited JSON stream.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          const evt = JSON.parse(line)
          if (evt.type === 'progress') setProgress({ checked: evt.checked, found: evt.found })
          else if (evt.type === 'done') setResults(evt.results || [])
          else if (evt.type === 'error') setError(evt.error)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate ideas')
    } finally {
      setRunning(false)
      setProgress(null)
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
            Brand-strategist naming. Shows only ideas with an available .com or .ai.
          </p>
        </div>
      </div>

      {/* What gets checked (and what does not) */}
      <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border/70 bg-secondary/30 p-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.5} />
        <div className="text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">What we check for each name:</span>{' '}
          domain availability (<span className="text-foreground">.com is confirmed</span> against the
          registry; <span className="text-foreground">.ai is a likely signal</span> from DNS), plus a{' '}
          <span className="text-foreground">preliminary trademark flag</span> against well-known brands.
          <br />
          <span className="font-medium text-foreground">What this is NOT:</span> legal clearance. A free
          domain can still infringe a trademark. Before you register or build on a name, run the linked{' '}
          <span className="text-foreground">USPTO</span> (US) and <span className="text-foreground">CIPO</span>{' '}
          (Canada) searches, and check social handles. For anything real, confirm with a lawyer.
        </div>
      </div>

      {/* Controls */}
      <form onSubmit={generate} className="mt-6 space-y-4">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Describe the space (e.g. AI job bank that screens and interviews candidates)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30"
        />

        {/* Style chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Naming style:</span>
          {STYLES.map((s) => {
            const active = styles.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStyle(s.id)}
                title={s.hint}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-brand bg-brand/15 font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            )
          })}
          <span className="text-[11px] text-muted-foreground/60">
            {styles.length === 0 ? '(mix of all)' : ''}
          </span>
        </div>

        {/* Perspective / who is the hero */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Who is the hero:</span>
          {PERSPECTIVES.map((p) => {
            const active = perspective === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPerspective(p.id)}
                title={p.hint}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-brand bg-brand/15 font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {running ? 'Finding available names...' : 'Find 20 Available Names'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {running && progress && (
        <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Checked {progress.checked} domains, found {progress.found} available so far...
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {results.length} ideas with an available domain
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <div key={r.name} className="flex flex-col rounded-xl border border-border bg-secondary/40 p-5">
                <h3 className="font-display text-lg font-bold text-foreground">{r.name}</h3>
                {r.tagline && <p className="mt-0.5 text-sm font-medium text-brand">{r.tagline}</p>}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.idea}</p>
                {r.why && <p className="mt-2 text-[12px] italic text-muted-foreground/80">{r.why}</p>}
                {r.audience && (
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                    For: {r.audience}
                  </p>
                )}
                <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                  {r.available.map((d) => (
                    <div key={d.domain} className="flex items-center justify-between gap-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <Check className="size-3.5 text-emerald-400" />
                        {d.domain}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400">
                          {d.confidence === 'likely' ? 'likely free' : 'available'}
                        </span>
                        {d.registerUrl && (
                          <a
                            href={d.registerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
                          >
                            register <ExternalLink className="size-3" />
                          </a>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trademark signal (preliminary, not clearance) */}
                <div className="mt-3 border-t border-border/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    {r.trademark.flag === 'caution' ? (
                      <ShieldAlert className="size-3.5 text-amber-400" />
                    ) : (
                      <Scale className="size-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={`text-[11px] font-medium ${
                        r.trademark.flag === 'caution' ? 'text-amber-400' : 'text-muted-foreground'
                      }`}
                    >
                      {r.trademark.flag === 'caution' ? 'Trademark: caution' : 'Trademark: no obvious conflict'}
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground/80">
                    {r.trademark.reason} Verify:
                    {' '}
                    <a href={r.trademark.usptoUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      USPTO
                    </a>
                    {' · '}
                    <a href={r.trademark.cipoUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      CIPO
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!running && results.length === 0 && !error && (
        <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Describe a space, pick a naming style (or leave it as a mix), and hit generate. You will
            only see names whose .com or .ai is actually available.
          </p>
        </div>
      )}
    </div>
  )
}
