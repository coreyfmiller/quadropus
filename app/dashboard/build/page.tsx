import { Boxes } from 'lucide-react'
import { SitesList } from '@/components/dashboard/sites-list'

export const dynamic = 'force-dynamic'

async function getSites() {
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !teamId) return []

  try {
    const res = await fetch(`https://api.vercel.com/v9/projects?teamId=${teamId}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()

    return data.projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework || 'unknown',
      url: p.targets?.production?.url || p.latestDeployments?.[0]?.url || null,
      customDomains: p.alias || [],
      updatedAt: p.updatedAt,
      repo: p.link?.repo || null,
    }))
  } catch {
    return []
  }
}

export default async function BuildPage() {
  const sites = await getSites()

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand">
          <Boxes className="size-[18px]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Build</h1>
          <p className="text-[13px] font-light text-muted-foreground">
            All your websites and deployments. {sites.length} projects on Vercel.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SitesList initialSites={sites} />
      </div>
    </div>
  )
}
