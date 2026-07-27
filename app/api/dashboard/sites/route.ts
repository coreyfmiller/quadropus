import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
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
