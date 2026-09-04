'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Lightbulb, Sparkles, Loader2, Check, ExternalLink, ShieldAlert, ShieldCheck, Scale, Info, Star, Save, FolderOpen, Plus } from 'lucide-react'

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

const TLD_OPTIONS = ['com', 'ai', 'io', 'co', 'ca']

const PERSPECTIVES: { id: Perspective; label: string; hint: string }[] = [
  { id: 'customer', label: 'End user', hint: 'The person using it is the hero' },
  { id: 'buyer', label: 'Buyer', hint: 'The business purchasing it is the hero' },
  { id: 'both', label: 'Both', hint: 'Works for both sides of a marketplace' },
]

const SHORTLIST_KEY = 'quadropus_idealab_shortlist'
const DISCOVERED_KEY = 'quadropus_idealab_discovered'
const CHECKED_KEY = 'quadropus_idealab_checked' // domain -> { status, confidence, at } cache of everything checked
const WORKSPACES_KEY = 'quadropus_brandlab_workspaces' // saved named workspaces

interface Workspace {
  id: string
  name: string
  savedAt: string
  niche: string
  shortlist: IdeaResult[]
  discovered: IdeaResult[]
}

// Names Corey wants to keep on hand. Seeded into the shortlist on first load
// (he can unstar/remove them anytime). Real availability confirmed 2026-09.
const SEED_SHORTLIST: IdeaResult[] = [
  {
    name: 'TalentMark',
    tagline: 'The mark of vetted talent.',
    idea: 'AI-screened talent marketplace where every candidate carries a verified quality mark.',
    why: 'Combines talent with a mark of trust and certification, signaling pre-vetted quality.',
    audience: 'Employers and job seekers',
    available: [
      { domain: 'talentmark.ai', tld: 'ai', status: 'available', confidence: 'likely', registerUrl: 'https://porkbun.com/checkout/search?q=talentmark.ai' },
    ],
    trademark: {
      flag: 'clear-signal',
      reason: 'No obvious well-known-brand collision. Still verify against the official databases.',
      usptoUrl: 'https://tmsearch.uspto.gov/search/search-information?query=TalentMark',
      cipoUrl: 'https://ised-isde.canada.ca/cipo/trademark-search/srch?null&text=TalentMark',
    },
  },
  {
    name: 'HirePath',
    tagline: 'A clear path to your next hire.',
    idea: 'AI-guided hiring platform that routes candidates and employers down the fastest path to a fit.',
    why: 'Pairs hiring with a sense of a guided, clear route, approachable for both sides.',
    audience: 'Employers and job seekers',
    available: [
      { domain: 'hirepath.ai', tld: 'ai', status: 'available', confidence: 'likely', registerUrl: 'https://porkbun.com/checkout/search?q=hirepath.ai' },
    ],
    trademark: {
      flag: 'clear-signal',
      reason: 'No obvious well-known-brand collision. Still verify against the official databases.',
      usptoUrl: 'https://tmsearch.uspto.gov/search/search-information?query=HirePath',
      cipoUrl: 'https://ised-isde.canada.ca/cipo/trademark-search/srch?null&text=HirePath',
    },
  },
]

export default function GrowPage() {
  const [niche, setNiche] = useState('')
  const [styles, setStyles] = useState<NameStyle[]>([])
  const [perspective, setPerspective] = useState<Perspective>('both')
  const [results, setResults] = useState<IdeaResult[]>([])
  const [shortlist, setShortlist] = useState<IdeaResult[]>([])
  const [discovered, setDiscovered] = useState<IdeaResult[]>([])
  const [checkedCount, setCheckedCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ checked: number; found: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load saved shortlist once on mount; persist on change.
  // On first ever load (nothing saved), seed with the names Corey wants to keep.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_KEY)
      if (raw !== null) setShortlist(JSON.parse(raw))
      else setShortlist(SEED_SHORTLIST)
    } catch {
      setShortlist(SEED_SHORTLIST)
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist))
    } catch { /* ignore */ }
  }, [shortlist])

  // Load + persist the running "discovered" history (every available name ever found).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISCOVERED_KEY)
      if (raw) setDiscovered(JSON.parse(raw))
      const chk = localStorage.getItem(CHECKED_KEY)
      if (chk) setCheckedCount(Object.keys(JSON.parse(chk)).length)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(DISCOVERED_KEY, JSON.stringify(discovered))
    } catch { /* ignore */ }
  }, [discovered])

  // Load saved workspaces once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKSPACES_KEY)
      if (raw) setWorkspaces(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])
  const persistWorkspaces = (list: Workspace[]) => {
    setWorkspaces(list)
    try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(list)) } catch { /* ignore */ }
  }

  // Save the current working state (shortlist + discovered + niche) as a named workspace.
  const saveWorkspace = () => {
    const name = (prompt('Save this workspace as:', currentWorkspace || niche || 'Untitled') || '').trim()
    if (!name) return
    const existing = workspaces.find((w) => w.name.toLowerCase() === name.toLowerCase())
    const ws: Workspace = {
      id: existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      savedAt: new Date().toISOString(),
      niche,
      shortlist,
      discovered,
    }
    const next = existing
      ? workspaces.map((w) => (w.id === ws.id ? ws : w))
      : [...workspaces, ws]
    persistWorkspaces(next)
    setCurrentWorkspace(name)
  }

  // Load a saved workspace into the working area.
  const loadWorkspace = (id: string) => {
    const ws = workspaces.find((w) => w.id === id)
    if (!ws) return
    setShortlist(ws.shortlist || [])
    setDiscovered(ws.discovered || [])
    setNiche(ws.niche || '')
    setResults([])
    setPasteResult(null)
    setError(null)
    setCurrentWorkspace(ws.name)
  }

  // Start a fresh workspace (clears the working area; saved workspaces are untouched).
  const newWorkspace = () => {
    if (
      (shortlist.length > 0 || discovered.length > 0) &&
      !confirm('Start a new workspace? This clears the current shortlist and discovered names (saved workspaces are kept).')
    ) return
    setShortlist([])
    setDiscovered([])
    setResults([])
    setNiche('')
    setPasteInput('')
    setPasteResult(null)
    setError(null)
    setCurrentWorkspace('')
  }

  // Merge freshly found results into the discovered history, de-duped by name (newest first).
  const rememberDiscovered = useCallback((found: IdeaResult[]) => {
    if (!found.length) return
    setDiscovered((prev) => {
      const byName = new Map(prev.map((d) => [d.name.toLowerCase(), d]))
      for (const f of found) byName.set(f.name.toLowerCase(), f)
      return Array.from(byName.values())
    })
    // Also record every checked domain into our local "already checked" cache.
    try {
      const raw = localStorage.getItem(CHECKED_KEY)
      const cache: Record<string, { status: string; confidence: string; at: string }> = raw ? JSON.parse(raw) : {}
      const now = new Date().toISOString()
      for (const f of found) {
        for (const d of f.available) {
          cache[d.domain.toLowerCase()] = { status: d.status, confidence: d.confidence, at: now }
        }
      }
      localStorage.setItem(CHECKED_KEY, JSON.stringify(cache))
      setCheckedCount(Object.keys(cache).length)
    } catch { /* ignore */ }
  }, [])

  const isSaved = useCallback(
    (name: string) => shortlist.some((s) => s.name.toLowerCase() === name.toLowerCase()),
    [shortlist]
  )

  const saveIdea = (idea: IdeaResult) => {
    const key = idea.name.toLowerCase()
    // Move it up into the shortlist...
    setShortlist((prev) => (prev.some((s) => s.name.toLowerCase() === key) ? prev : [...prev, idea]))
    // ...and remove it from the results + discovered lists below (claimed, clear it from the pile).
    setResults((prev) => prev.filter((r) => r.name.toLowerCase() !== key))
    setDiscovered((prev) => prev.filter((r) => r.name.toLowerCase() !== key))
  }

  const removeIdea = (name: string) => {
    setShortlist((prev) => prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()))
  }

  // Re-add the starter names (TalentMark.ai, HirePath.ai) if they are missing.
  const restoreSeed = () => {
    setShortlist((prev) => {
      const have = new Set(prev.map((s) => s.name.toLowerCase()))
      const missing = SEED_SHORTLIST.filter((s) => !have.has(s.name.toLowerCase()))
      return missing.length ? [...missing, ...prev] : prev
    })
  }
  const seedMissing = SEED_SHORTLIST.some(
    (s) => !shortlist.some((x) => x.name.toLowerCase() === s.name.toLowerCase())
  )

  // Flat, de-duped list of every available domain found (from discovered history + shortlist).
  const availableDomains = (() => {
    const map = new Map<string, { domain: string; confidence: string; registerUrl: string | null }>()
    for (const idea of [...discovered, ...shortlist]) {
      for (const d of idea.available) {
        if (d.status === 'available') {
          map.set(d.domain.toLowerCase(), { domain: d.domain, confidence: d.confidence, registerUrl: d.registerUrl })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.domain.localeCompare(b.domain))
  })()

  const copyAllDomains = () => {
    const text = availableDomains.map((d) => d.domain).join('\n')
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  const toggleStyle = (s: NameStyle) => {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const toggleTld = (t: string) => {
    setTlds((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
      return next.length ? next : prev // never allow zero TLDs selected
    })
  }

  // Frontend-driven loop: many small round requests instead of one long one, so we
  // never hit a serverless timeout. Results accumulate live until we reach the target
  // (20) or the user clicks Stop.
  const stopRef = useRef(false)
  const TARGET = 20

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setRunning(true)
    setError(null)
    setResults([])
    stopRef.current = false
    setProgress({ checked: 0, found: 0 })

    const accumulated: IdeaResult[] = []
    const tried: string[] = []
    let checkedTotal = 0
    let emptyStreak = 0

    try {
      // Cap rounds generously; the loop stops early once TARGET is hit.
      for (let round = 0; round < 25 && accumulated.length < TARGET && !stopRef.current; round++) {
        const res = await fetch('/api/ops/ideas-round', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche, styles, perspective, tlds, avoid: tried.slice(-200) }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d?.error || `Failed (${res.status})`)
        }
        const out = await res.json()
        checkedTotal += out.checkedCount || 0
        for (const t of out.tried || []) tried.push(t)

        const found: IdeaResult[] = out.found || []
        if (found.length === 0) {
          emptyStreak++
          if (emptyStreak >= 3) break // three dry rounds: the niche is likely exhausted
        } else {
          emptyStreak = 0
          for (const f of found) {
            if (!accumulated.some((a) => a.name.toLowerCase() === f.name.toLowerCase())) {
              accumulated.push(f)
            }
          }
          const snapshot = accumulated.slice(0, TARGET)
          setResults([...snapshot])
          rememberDiscovered(found) // persist every discovered name as we go
        }
        setProgress({ checked: checkedTotal, found: accumulated.length })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate ideas')
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  const stopGenerating = () => {
    stopRef.current = true
  }

  // Manual check: user pastes their own names/domains, we run them through the same
  // availability + trademark checks and show them as result cards.
  const [pasteInput, setPasteInput] = useState('')
  const [checkingPaste, setCheckingPaste] = useState(false)
  const [pasteResult, setPasteResult] = useState<{ available: number; checked: number } | null>(null)
  const [mode, setMode] = useState<'generate' | 'check'>('generate')
  const [showHow, setShowHow] = useState(false)
  const [tlds, setTlds] = useState<string[]>(['com', 'ai'])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('')

  const checkPasted = async () => {
    // Parse ALL pasted names (no silent cap). De-dupe, strip URLs/TLDs/punctuation.
    const names = Array.from(
      new Set(
        pasteInput
          .split(/[\n,]+/)
          .map((s) => s.trim().replace(/^https?:\/\//, '').replace(/\.(com|ai|net|io|co)$/i, '').replace(/[^a-zA-Z0-9]/g, ''))
          .filter(Boolean)
      )
    )
    if (names.length === 0) return
    setCheckingPaste(true)
    setError(null)
    setPasteResult(null)
    setResults([])

    const CHUNK = 15 // check in chunks so a big paste all gets checked without timing out
    const collected: IdeaResult[] = []
    try {
      for (let i = 0; i < names.length; i += CHUNK) {
        const chunk = names.slice(i, i + CHUNK)
        const res = await fetch('/api/ops/check-names', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: chunk, tlds }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d?.error || `Failed (${res.status})`)
        }
        const out = await res.json()
        const found: IdeaResult[] = out.results || [] // only names with an available domain
        for (const f of found) {
          if (!collected.some((c) => c.name.toLowerCase() === f.name.toLowerCase())) collected.push(f)
        }
        setResults([...collected])
        rememberDiscovered(found)
        // live progress: how many of the full list checked so far, how many available
        setPasteResult({ available: collected.length, checked: Math.min(i + CHUNK, names.length) })
      }
      if (collected.length === 0) {
        setError('None of those names have an available .com or .ai. Try different names.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check names')
    } finally {
      setCheckingPaste(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand">
            <Lightbulb className="size-[18px]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Brand Lab</h1>
            <p className="text-[13px] font-light text-muted-foreground">
              Brand-strategist naming with live .com / .ai availability.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHow((v) => !v)}
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Info className="size-3.5" /> How it works
        </button>
      </div>

      {/* Workspace bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-secondary/20 px-3 py-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Workspace</span>
        <span className="text-sm font-medium text-foreground">{currentWorkspace || 'Unsaved'}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {workspaces.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <FolderOpen className="size-3.5 text-muted-foreground" />
              <select
                value=""
                onChange={(e) => e.target.value && loadWorkspace(e.target.value)}
                className="rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-foreground outline-none"
              >
                <option value="">Load saved...</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={saveWorkspace}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Save className="size-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={newWorkspace}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="size-3.5" /> New
          </button>
        </div>
      </div>

      {/* Collapsible "how it works / limitations" */}
      {showHow && (
        <div className="mt-3 rounded-lg border border-border/70 bg-secondary/30 p-3.5 text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">What we check:</span> domain availability
          (<span className="text-foreground">.com confirmed</span> via registry;{' '}
          <span className="text-foreground">.ai a likely signal</span> from DNS) plus a{' '}
          <span className="text-foreground">preliminary trademark flag</span>.
          <br />
          <span className="font-medium text-foreground">Not legal clearance.</span> A free domain can still
          infringe. Run the linked USPTO (US) and CIPO (Canada) searches and check social handles before
          committing. For anything real, confirm with a lawyer.
          {checkedCount > 0 && (
            <span className="mt-1 block text-muted-foreground/70">
              {checkedCount} domains recorded in this device&apos;s checked history.
            </span>
          )}
        </div>
      )}

      {/* Input panel with mode tabs */}
      <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
        {/* Segmented control */}
        <div className="inline-flex rounded-lg border border-border bg-background/40 p-0.5">
          <button
            type="button"
            onClick={() => setMode('generate')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              mode === 'generate' ? 'bg-brand text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Generate names
          </button>
          <button
            type="button"
            onClick={() => setMode('check')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              mode === 'check' ? 'bg-brand text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Check my own
          </button>
        </div>

        {/* TLD selector (applies to both modes) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Extensions</span>
          {TLD_OPTIONS.map((t) => {
            const active = tlds.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTld(t)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-brand bg-brand/15 font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                .{t}
              </button>
            )
          })}
        </div>

        {mode === 'generate' ? (
          <form onSubmit={generate} className="mt-4 space-y-4">
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Describe the space (e.g. AI job bank that screens and interviews candidates)"
              className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={running}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {running ? 'Finding available names...' : 'Find 20 Available Names'}
              </button>
              {running && (
                <button
                  type="button"
                  onClick={stopGenerating}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  Stop
                </button>
              )}
              {running && progress && (
                <span className="text-[12px] text-muted-foreground">
                  checked {progress.checked}, found {progress.found} available...
                </span>
              )}
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-[12px] text-muted-foreground/80">
              Paste names or domains (one per line or comma-separated). We check .com + .ai and trademark for each, and show only the available ones.
            </p>
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              rows={4}
              placeholder={'echelon\nhirepath.ai\nTalentMark, Rolevo'}
              className="w-full resize-y rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/30"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={checkPasted}
                disabled={checkingPaste || !pasteInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkingPaste ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {checkingPaste ? 'Checking...' : 'Check These Names'}
              </button>
              {checkingPaste && pasteResult && (
                <span className="text-sm text-muted-foreground">
                  checked {pasteResult.checked}, found {pasteResult.available} available...
                </span>
              )}
              {!checkingPaste && pasteResult && (
                <span className={`text-sm font-medium ${pasteResult.available > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {pasteResult.available > 0 ? `${pasteResult.available} available, scroll down` : 'None available'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Shortlist (kept names, persists across searches) */}
      {(shortlist.length > 0 || seedMissing) && (
        <div className="mt-6 rounded-xl border border-brand/25 bg-brand/[0.04] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-brand" fill="currentColor" />
              <h2 className="text-sm font-semibold text-foreground">
                Shortlist{shortlist.length > 0 && ` (${shortlist.length})`}
              </h2>
              <span className="text-[11px] text-muted-foreground">kept across searches</span>
            </div>
            {seedMissing && (
              <button
                type="button"
                onClick={restoreSeed}
                className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                Restore TalentMark + HirePath
              </button>
            )}
          </div>
          {shortlist.length > 0 && (
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shortlist.map((r) => (
                <IdeaCard key={r.name} r={r} saved onSave={saveIdea} onRemove={removeIdea} />
              ))}
            </div>
          )}
          {shortlist.length === 0 && (
            <p className="mt-2 text-[12px] text-muted-foreground">
              Shortlist is empty. Click "Restore" above to bring back your starter names.
            </p>
          )}
        </div>
      )}

      {/* Results (latest search/check) */}
      {results.length > 0 && (
        <div className="mt-8 border-t border-border/60 pt-6">
          <h2 className="text-sm font-semibold text-foreground">
            Results <span className="font-normal text-muted-foreground">({results.length} available)</span>
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <IdeaCard key={r.name} r={r} saved={isSaved(r.name)} onSave={saveIdea} onRemove={removeIdea} />
            ))}
          </div>
        </div>
      )}

      {/* Collected available domains (flat list, copyable) */}
      {availableDomains.length > 0 && (
        <div className="mt-10 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Available domains collected ({availableDomains.length})
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Every available .com / .ai found so far, in one list. Confirm .ai at the registrar before buying.
              </p>
            </div>
            <button
              type="button"
              onClick={copyAllDomains}
              className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Copy all
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableDomains.map((d) => (
              <a
                key={d.domain}
                href={d.registerUrl || `https://porkbun.com/checkout/search?q=${encodeURIComponent(d.domain)}`}
                target="_blank"
                rel="noopener noreferrer"
                title={d.confidence === 'likely' ? 'Likely available (verify at registrar)' : 'Available'}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-background/40 px-3 py-1 text-xs text-foreground transition-colors hover:border-emerald-500/60"
              >
                <Check className="size-3 text-emerald-400" />
                {d.domain}
                {d.confidence === 'likely' && <span className="text-[10px] text-muted-foreground">~</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Discovered history (every available name ever found, persisted) */}
      {discovered.length > 0 && (
        <div className="mt-10 border-t border-border/60 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                All discovered names ({discovered.length})
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Every available name found on this device. Nothing is lost between searches. Star any to shortlist.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear the discovered-names history? Your shortlist is not affected.')) {
                  setDiscovered([])
                }
              }}
              className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Clear history
            </button>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {discovered.map((r) => (
              <IdeaCard key={r.name} r={r} saved={isSaved(r.name)} onSave={saveIdea} onRemove={removeIdea} />
            ))}
          </div>
        </div>
      )}

      {!running && results.length === 0 && !error && shortlist.length === 0 && discovered.length === 0 && (
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

interface VerifyState {
  loading: boolean
  available: boolean | null
  price: string | null
  premium: boolean
  message: string | null
}

function IdeaCard({
  r,
  saved,
  onSave,
  onRemove,
}: {
  r: IdeaResult
  saved: boolean
  onSave: (idea: IdeaResult) => void
  onRemove: (name: string) => void
}) {
  const [verify, setVerify] = useState<Record<string, VerifyState>>({})

  const verifyDomain = async (domain: string) => {
    setVerify((p) => ({ ...p, [domain]: { loading: true, available: null, price: null, premium: false, message: null } }))
    try {
      const res = await fetch('/api/ops/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()
      setVerify((p) => ({
        ...p,
        [domain]: {
          loading: false,
          available: typeof data.available === 'boolean' ? data.available : null,
          price: data.price ?? null,
          premium: !!data.premium,
          message: data.rateLimited
            ? 'Porkbun busy, wait ~10s and retry'
            : data.error || null,
        },
      }))
    } catch {
      setVerify((p) => ({ ...p, [domain]: { loading: false, available: null, price: null, premium: false, message: 'Verify failed' } }))
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-secondary/40 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-foreground">{r.name}</h3>
        <button
          type="button"
          onClick={() => (saved ? onRemove(r.name) : onSave(r))}
          title={saved ? 'Remove from shortlist' : 'Keep this one'}
          aria-label={saved ? 'Remove from shortlist' : 'Keep this one'}
          className={`shrink-0 rounded-md p-1 transition-colors ${
            saved ? 'text-brand' : 'text-muted-foreground/50 hover:text-brand'
          }`}
        >
          <Star className="size-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      {r.tagline && <p className="mt-0.5 text-sm font-medium text-brand">{r.tagline}</p>}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.idea}</p>
      {r.why && <p className="mt-2 text-[12px] italic text-muted-foreground/80">{r.why}</p>}
      {r.audience && (
        <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">For: {r.audience}</p>
      )}
      <div className="mt-4 space-y-2.5 border-t border-border/50 pt-3">
        {r.available.map((d) => {
          const v = verify[d.domain]
          return (
            <div key={d.domain} className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Check className="size-3.5 text-emerald-400" />
                  {d.domain}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400">
                    {d.confidence === 'likely' ? 'likely free' : 'available'}
                  </span>
                  {d.confidence === 'likely' && (
                    <button
                      type="button"
                      onClick={() => verifyDomain(d.domain)}
                      disabled={v?.loading}
                      title="Confirm authoritatively via Porkbun (rate-limited ~1 per 10s)"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                    >
                      {v?.loading ? <Loader2 className="size-3 animate-spin" /> : <ShieldCheck className="size-3" />}
                      {v?.loading ? 'Verifying' : 'Verify'}
                    </button>
                  )}
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
              {v && !v.loading && (
                <p
                  className={`mt-1 pl-5 text-[11px] ${
                    v.available === true
                      ? 'text-emerald-400'
                      : v.available === false
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {v.available === true
                    ? `Confirmed available${v.price ? ` (${v.price})` : ''}${v.premium ? ' - premium' : ''}`
                    : v.available === false
                      ? 'Confirmed taken'
                      : v.message || 'Could not confirm'}
                </p>
              )}
            </div>
          )
        })}
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
            {r.trademark.flag === 'caution' ? 'Trademark: possible conflict (may be workable)' : 'Trademark: no obvious conflict'}
          </span>
        </div>
        <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground/80">
          {r.trademark.reason} Verify:{' '}
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
  )
}
