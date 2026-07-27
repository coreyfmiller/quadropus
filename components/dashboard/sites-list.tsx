"use client"

import { useState } from 'react'
import { Globe, ExternalLink, GitBranch, Search, Clock } from 'lucide-react'

interface Site {
  id: string
  name: string
  framework: string
  url: string | null
  customDomains: string[]
  updatedAt: number
  repo: string | null
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

export function SitesList({ sites }: { sites: Site[] }) {
  const [filter, setFilter] = useState('')

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.customDomains.some((d) => d.toLowerCase().includes(filter.toLowerCase()))
  )

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
        <Search className="size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search sites..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-transparent text-[13px] font-light text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Sites grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((site) => (
          <div
            key={site.id}
            className="group rounded-xl border border-border bg-secondary/40 p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-brand/70" strokeWidth={1.5} />
                <h3 className="text-[13px] font-medium text-foreground">{site.name}</h3>
              </div>
              {frameworkBadge(site.framework)}
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
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {site.url && (
                  <a
                    href={`https://${site.customDomains[0] || site.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    title="Visit site"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                {site.repo && (
                  <a
                    href={`https://github.com/${site.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    title="View repo"
                  >
                    <GitBranch className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">No sites found.</p>
      )}
    </div>
  )
}
