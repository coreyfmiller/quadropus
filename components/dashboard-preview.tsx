import {
  LayoutGrid,
  Boxes,
  LineChart,
  Workflow,
  Gauge,
  Bot,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  ArrowUpRight,
  Search,
  Bell,
  CalendarClock,
  Megaphone,
  MessageSquare,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
  { label: 'Build', icon: Boxes },
  { label: 'Grow', icon: LineChart },
  { label: 'Automate', icon: Workflow },
  { label: 'Operate', icon: Gauge },
  { label: 'AI Agents', icon: Bot },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Customers', icon: Users },
  { label: 'Settings', icon: Settings },
]

const revenuePoints = [
  6, 10, 8, 14, 12, 18, 16, 22, 20, 27, 32, 30, 38, 44, 42, 52,
]

function Sparkline() {
  const max = Math.max(...revenuePoints)
  const w = 260
  const h = 64
  const step = w / (revenuePoints.length - 1)
  const coords = revenuePoints.map((p, i) => {
    const x = i * step
    const y = h - (p / max) * (h - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M${coords.join(' L')}`
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-5 h-16 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-alt)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#revFill)" />
      <path
        d={line}
        fill="none"
        stroke="url(#revLine)"
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function HealthRing({ score = 96 }: { score?: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative mt-4 flex items-center justify-center">
      <svg viewBox="0 0 84 84" className="size-[104px] -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-alt)" />
          </linearGradient>
        </defs>
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 8%)"
          strokeWidth="6"
        />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold text-foreground">{score}</span>
        <span className="text-[10px] font-light text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  )
}

function CardShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-secondary/40 p-4 ${className}`}
    >
      {children}
    </div>
  )
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
    >
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border/70 bg-background/40 p-4 md:flex">
          <div className="flex items-center gap-2 px-1.5 pb-6">
            <span
              className="size-5 rounded-md"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--brand), var(--brand-alt))',
              }}
            />
            <span className="text-[13px] font-semibold tracking-tight text-foreground">
              Quadropus
            </span>
          </div>

          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors ${
                  item.active
                    ? 'bg-brand/12 text-foreground'
                    : 'font-light text-muted-foreground'
                }`}
              >
                <item.icon
                  className={`size-[15px] ${item.active ? 'text-brand' : ''}`}
                  strokeWidth={1.5}
                />
                {item.label}
              </span>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border border-border/70 bg-secondary/40 p-3">
            <p className="text-[11px] font-medium text-foreground">
              Growth plan
            </p>
            <p className="mt-1 text-[10.5px] font-light text-muted-foreground">
              8 automations active
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/40 px-2.5 py-1.5">
              <Search className="size-3.5 text-muted-foreground" />
              <span className="text-[11.5px] font-light text-muted-foreground">
                Search or ask AI…
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <span
                className="size-6 rounded-full"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, var(--brand), var(--brand-alt))',
                }}
              />
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Good morning, Corey.
            </h3>

            {/* AI strip */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-brand/25 bg-brand/[0.07] px-3.5 py-3">
              <Sparkles className="mt-px size-4 shrink-0 text-brand" />
              <p className="text-[12.5px] leading-relaxed font-light text-foreground/85">
                Website updated overnight. 2 new leads captured. SEO score
                increased to 94.
              </p>
            </div>

            {/* Grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CardShell className="sm:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardLabel>Revenue</CardLabel>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                      $12,847
                    </p>
                    <p className="text-[11.5px] font-light text-muted-foreground">
                      this month
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-2 py-1 text-[11px] font-medium text-brand">
                    <ArrowUpRight className="size-3" />
                    23%
                  </span>
                </div>
                <Sparkline />
              </CardShell>

              <CardShell>
                <CardLabel>Website health</CardLabel>
                <HealthRing score={96} />
                <p className="mt-3 text-center text-[11.5px] font-light text-muted-foreground">
                  All systems nominal
                </p>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <CardLabel>AI conversations</CardLabel>
                  <MessageSquare className="size-3.5 text-brand-alt" />
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  14
                </p>
                <p className="text-[11.5px] font-light text-muted-foreground">
                  conversations today
                </p>
                <div className="mt-4 flex h-10 items-end gap-1.5">
                  {[30, 55, 40, 70, 50, 85, 65, 45, 78, 60].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-brand-alt/30 last:bg-brand-alt/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </CardShell>

              <CardShell>
                <CardLabel>Leads this week</CardLabel>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  23
                </p>
                <p className="text-[11.5px] font-light text-muted-foreground">
                  new · 8 qualified
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: '35%',
                      backgroundImage:
                        'linear-gradient(90deg, var(--brand), var(--brand-alt))',
                    }}
                  />
                </div>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <CardLabel>Next appointment</CardLabel>
                  <CalendarClock className="size-3.5 text-brand" />
                </div>
                <p className="mt-2 text-[13.5px] font-medium text-foreground">
                  Maritime Roofing Co.
                </p>
                <p className="mt-1 text-[11.5px] font-light text-muted-foreground">
                  Today · 2:30 PM · Discovery call
                </p>
                <p className="mt-3 text-[11px] font-light text-muted-foreground/70">
                  Booked by AI scheduler
                </p>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <CardLabel>Campaign status</CardLabel>
                  <Megaphone className="size-3.5 text-brand-alt" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
                  <p className="text-[13.5px] font-medium text-foreground">
                    Google Ads: running
                  </p>
                </div>
                <p className="mt-1 text-[11.5px] font-light text-muted-foreground">
                  $4.20 CPA · 312 clicks
                </p>
                <p className="mt-3 text-[11px] font-light text-muted-foreground/70">
                  Budget pacing on target
                </p>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
