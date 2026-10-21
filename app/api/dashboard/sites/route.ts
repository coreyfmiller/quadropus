import { NextResponse } from 'next/server'
import { requireOps } from '@/lib/ops/guard'

export const dynamic = 'force-dynamic'

/**
 * Lists every Vercel project on the account.
 *
 * Reads with VERCEL_API_TOKEN and enumerates the whole team, so it must never
 * answer an anonymous caller — it was doing exactly that, complete with project
 * ids and custom domains.
 */
export async function GET(request: Request) {
  const refused = requireOps(request)
  if (refused) return refused

  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !teamId) {
    return NextResponse.json({ sites: [] })
  }

  try {
    const res = await fetch(`https://api.vercel.com/v9/projects?teamId=${teamId}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ sites: [] })
    const data = await res.json()

    const sites = data.projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework || 'unknown',
      url: p.targets?.production?.url || p.latestDeployments?.[0]?.url || null,
      customDomains: p.alias || [],
      updatedAt: p.updatedAt,
      repo: p.link?.repo || null,
      vercelUrl: `https://vercel.com/${teamId}/${p.name}`,
    }))

    return NextResponse.json({ sites })
  } catch {
    return NextResponse.json({ sites: [] })
  }
}
