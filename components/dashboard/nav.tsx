"use client"

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutGrid,
  Boxes,
  Lightbulb,
  Workflow,
  Gauge,
  Bot,
  BarChart3,
  Users,
  Settings,
  Send,
  FileText,
  Shield,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutGrid },
  { label: 'Build', href: '/dashboard/build', icon: Boxes },
  { label: 'Idea Lab', href: '/dashboard/grow', icon: Lightbulb },
  { label: 'Automate', href: '/dashboard/automate', icon: Workflow },
  { label: 'Operate', href: '/dashboard/operate', icon: Gauge },
  { divider: true },
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Outreach', href: '/dashboard/outreach', icon: Send },
  { label: 'Content', href: '/dashboard/content', icon: FileText },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { divider: true },
  { label: 'Command Center', href: '/dashboard/command-center', icon: Shield },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
] as const

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border/70 bg-background/40 p-4 md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pb-6">
        <span className="block w-7 overflow-hidden mix-blend-screen">
          <Image
            src="/quadropus-logo.png"
            alt=""
            width={160}
            height={131}
            className="-mb-[19%] w-full"
          />
        </span>
        <span className="text-[13px] font-semibold tracking-tight text-foreground">
          Quadropus
          <span className="text-brand-alt">.ai</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Dashboard">
        {navItems.map((item, i) => {
          if ('divider' in item) {
            return <div key={i} className="my-3 h-px bg-border/50" />
          }

          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors',
                isActive
                  ? 'bg-brand/12 font-medium text-foreground'
                  : 'font-light text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('size-[15px]', isActive && 'text-brand')}
                strokeWidth={1.5}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="rounded-lg border border-border/70 bg-secondary/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-foreground">Corey Miller</p>
            <p className="mt-0.5 text-[10.5px] font-light text-muted-foreground">Admin</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-[15px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
