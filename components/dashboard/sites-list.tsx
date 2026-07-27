"use client"

import { useState, useEffect } from 'react'
import { Globe, ExternalLink, GitBranch, Search, Clock, RefreshCw, Tag, Settings2 } from 'lucide-react'

interface Site {
  id: string
  name: string
  framework: string
  url: string | null
  customDomains: string[]
  updatedAt: number
  repo: string | null
  vercelUrl?: string
}

type Category = 'all' | 'client' | 'personal' | 'demo' | 'experimental' | 'uncategorized'

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'text-foreground' },
  { id: 'client', label: 'Client', color: 'text-green-500' },
  { id: 'personal', label: 'Personal', color: 'text-brand' },
  { id: 'demo', label: 'Demo', color: 'text-yellow-500' },
  { id: 'experimental', label: 'Experimental', color: 'text-orange-500' },
  { id: 'uncategorized', label: 'Uncategorized', color: 'text-muted-foreground' },
]

const CATEGORY_BADGES: Record<string, { label: string; className: string }> = {
  client: { label: 'Client', className: 'text-green-500 bg-green-500/10' },
  personal: { label: 'Personal', className: 'text-brand bg-brand/10' },
  demo: { label: 'Demo', className: 'text-yellow-500 bg-yellow-500/10' },
  experimental: { label: 'Experimental', className: 'text-orange-500 bg-orange-500/10' },
}

const STORAGE_KEY = 'quadropus_site_categories'

function getStoredCategories(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
}

function saveCategories(cats: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function frameworkBadge(fw: string) {
  const colors: Record<string, string> = {
    nextjs: 'text-foreground bg-foreground/10',
    vite: 'text-purple-400 bg-purple-400/10',
    unknown: 'text-muted-foreground bg-muted',
  }
  const labels: Record<string, string> = {
    nextjs: 'Next.js',
    vite: 'Vite',
    unknown: 'Other',
  }
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[fw] || colors.unknown}`}>
      {labels[fw] || fw}
    </span>
  )
}

export function SitesList({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites)
  const [filter, setFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setCategories(getStoredCategories())
  }, [])

  const handleCategoryChange = (siteId: string, category: string) => {
    const updated = { ...categories, [siteId]: category }
    setCategories(updated)
    saveCategories(updated)
    setEditingId(null)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/dashboard/sites')
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites)
      }
    } catch {}
    setRefreshing(false)
  }

  const getSiteCategory = (siteId: string): string => categories[siteId] || 'uncategorized'

  const filtered = sites.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.customDomains.some((d) => d.toLowerCase().includes(filter.toLowerCase()))
    const matchesCategory =
      activeCategory === 'all' || getSiteCategory(s.id) === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 flex-1 max-w-sm">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sites..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-light text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-light text-muted-foreground transition-colors hover:text-foreground hover:border-brand/40 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? sites.length
            : sites.filter((s) => getSiteCategory(s.id) === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeCategory === cat.id
                  ? `${cat.color} bg-current/10 ring-1 ring-current/30`
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Sites grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((site) => {
          const cat = getSiteCategory(site.id)
          const badge = CATEGORY_BADGES[cat]

          return (
            <div
              key={site.id}
              className="group rounded-xl border border-border bg-secondary/40 p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="size-4 shrink-0 text-brand/70" strokeWidth={1.5} />
                  <h3 className="text-[13px] font-medium text-foreground truncate">{site.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {badge && (
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  )}
                  {frameworkBadge(site.framework)}
                </div>
              </div>

              {site.customDomains.length > 0 && (
                <p className="mt-2 text-[11px] font-light text-muted-foreground truncate">
                  {site.customDomains[0]}
                </p>
              )}

              {site.url && !site.customDomains.length && (
                <p className="mt-2 text-[11px] font-light text-muted-foreground truncate">
                  {site.url}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                  <Clock className="size-3" />
                  {timeAgo(site.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  {/* Category picker */}
                  {editingId === site.id ? (
                    <select
                      value={cat}
                      onChange={(e) => handleCategoryChange(site.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none"
                    >
                      <option value="uncategorized">Uncategorized</option>
                      <option value="client">Client</option>
                      <option value="personal">Personal</option>
                      <option value="demo">Demo</option>
                      <option value="experimental">Experimental</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingId(site.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Set category"
                    >
                      <Tag className="size-3.5" />
                    </button>
                  )}
                  {site.url && (
                    <a
                      href={`https://${site.customDomains[0] || site.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Visit site"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                  {site.vercelUrl && (
                    <a
                      href={site.vercelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Vercel project"
                    >
                      <Settings2 className="size-3.5" />
                    </a>
                  )}
                  {site.repo && (
                    <a
                      href={`https://github.com/${site.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="View repo"
                    >
                      <GitBranch className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">No sites found.</p>
      )}
    </div>
  )
}
