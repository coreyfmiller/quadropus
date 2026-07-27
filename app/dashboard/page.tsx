import {
  ArrowUpRight,
  Globe,
  MessageSquare,
  Send,
  TrendingUp,
  Users,
  Sparkles,
  Activity,
} from 'lucide-react'

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string
  value: string
  change?: string
  icon: typeof Globe
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-brand/70" strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {change && (
        <div className="mt-1.5 flex items-center gap-1">
          <ArrowUpRight className="size-3 text-green-500" />
          <span className="text-[11px] font-light text-green-500">{change}</span>
        </div>
      )}
    </div>
  )
}

function AiInsight({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-brand/25 bg-brand/[0.07] px-4 py-3">
      <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
      <p className="text-[12.5px] leading-relaxed font-light text-foreground/85">
        {message}
      </p>
    </div>
  )
}

function SiteRow({
  name,
  url,
  status,
  score,
}: {
  name: string
  url: string
  status: 'healthy' | 'warning' | 'down'
  score: number
}) {
  const statusColor = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    down: 'bg-red-500',
  }[status]

  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`size-2 rounded-full ${statusColor} shadow-[0_0_6px_currentColor]`} />
        <div>
          <p className="text-[13px] font-medium text-foreground">{name}</p>
          <p className="text-[11px] font-light text-muted-foreground">{url}</p>
        </div>
      </div>
      <span className="text-[12px] font-medium text-foreground">{score}/100</span>
    </div>
  )
}

export default function DashboardOverview() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Good evening, Corey.
          </h1>
          <p className="mt-1 text-[13px] font-light text-muted-foreground">
            Here's what's happening across your businesses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-green-500" />
          <span className="text-[11px] font-light text-muted-foreground">All systems operational</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-6">
        <AiInsight message="Pizza Twice chatbot handled 14 conversations today. FundyLaunch blog post published. Quadropus.ai waitlist has new signups. Your SEO scores are stable across all sites." />
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Sites"
          value="6"
          icon={Globe}
        />
        <StatCard
          label="AI Conversations"
          value="47"
          change="+12 this week"
          icon={MessageSquare}
        />
        <StatCard
          label="Outreach Sent"
          value="24"
          change="8 replies"
          icon={Send}
        />
        <StatCard
          label="Pipeline Value"
          value="$14,500"
          change="+$4,000"
          icon={TrendingUp}
        />
      </div>

      {/* Two column layout */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Sites */}
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Your Sites
          </h2>
          <div className="mt-4">
            <SiteRow name="Quadropus.ai" url="quadropus.ai" status="healthy" score={94} />
            <SiteRow name="FundyLaunch" url="fundylaunch.com" status="healthy" score={91} />
            <SiteRow name="FundyLogic" url="fundylogic.com" status="healthy" score={89} />
            <SiteRow name="Duelly" url="duelly.ai" status="healthy" score={92} />
            <SiteRow name="Pizza Twice" url="pizzatwice.vercel.app" status="healthy" score={87} />
            <SiteRow name="MarketMojo" url="marketmojo.vercel.app" status="healthy" score={85} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Recent Activity
          </h2>
          <div className="mt-4 space-y-3">
            {[
              { time: '2 min ago', event: 'New waitlist signup on quadropus.ai', type: 'lead' },
              { time: '1 hr ago', event: 'Ask the Oven answered customer question', type: 'bot' },
              { time: '3 hrs ago', event: 'Outreach batch sent: 8 electricians in Quispamsis', type: 'outreach' },
              { time: '5 hrs ago', event: 'FundyLaunch blog post published', type: 'content' },
              { time: '1 day ago', event: 'Pizza Twice deployed: chatbot fix', type: 'deploy' },
              { time: '1 day ago', event: 'Quadropus pricing updated', type: 'deploy' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-[12.5px]">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand/60" />
                <div className="flex-1">
                  <p className="font-light text-foreground/85">{item.event}</p>
                  <p className="text-[10.5px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Run Outreach', href: '/dashboard/outreach', icon: Send },
            { label: 'Write Blog Post', href: '/dashboard/content', icon: Sparkles },
            { label: 'Check AI Visibility', href: '/dashboard/grow', icon: TrendingUp },
            { label: 'View Clients', href: '/dashboard/clients', icon: Users },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-2.5 rounded-lg border border-border/70 px-3.5 py-2.5 text-[12px] font-light text-foreground transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
              <action.icon className="size-3.5 text-brand" strokeWidth={1.5} />
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
