import {
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Globe,
  Users,
  Zap,
  Eye,
  Lock,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { HealthPanel } from '@/components/dashboard/health-panel'
import { LeadsPanel } from '@/components/dashboard/leads-panel'
import { BriefPanel } from '@/components/dashboard/brief-panel'

// --- Types ---

type ProductStatus = 'live' | 'development' | 'paused'
type HealthStatus = 'healthy' | 'warning' | 'critical'
type RuleScope = 'global' | 'project'

interface Product {
  name: string
  domain: string
  status: ProductStatus
  stage: string
  users: number
  monthlyAiCost: number
  aiProvider: string
  hasAuth: boolean
  hasRateLimit: boolean
  hasCostCap: boolean
  hasRLS: boolean
  healthStatus: HealthStatus
  lastDeploy: string
}

interface GovernanceAgent {
  name: string
  scope: RuleScope
  appliesTo: string[]
  rulesCount: number
  lastUpdated: string
  status: 'active' | 'inactive'
}

interface CostEntry {
  provider: string
  product: string
  monthlyCost: number
  dailyCap: number
  currentDailyUsage: number
  trend: 'up' | 'down' | 'stable'
}

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  product: string
  timestamp: string
  resolved: boolean
}

// --- Data (sourced from project status files) ---

const products: Product[] = [
  {
    name: 'HikeMind',
    domain: 'hikemind.vercel.app',
    status: 'live',
    stage: 'MVP, pre-launch',
    users: 0,
    monthlyAiCost: 0,
    aiProvider: 'Google Gemini Flash (latest)',
    hasAuth: true,
    hasRateLimit: true,
    hasCostCap: false,
    hasRLS: true,
    healthStatus: 'warning',
    lastDeploy: '2026-08-23',
  },
  {
    name: 'Duelly',
    domain: 'duelly.ai',
    status: 'live',
    stage: 'Revenue-generating',
    users: 42,
    monthlyAiCost: 28.50,
    aiProvider: 'OpenAI GPT-4o',
    hasAuth: true,
    hasRateLimit: true,
    hasCostCap: true,
    hasRLS: true,
    healthStatus: 'healthy',
    lastDeploy: '2026-08-20',
  },
  {
    name: 'MarketMojo',
    domain: 'marketmojo.vercel.app',
    status: 'development',
    stage: 'Active development',
    users: 0,
    monthlyAiCost: 4.20,
    aiProvider: 'Google Gemini',
    hasAuth: true,
    hasRateLimit: true,
    hasCostCap: true,
    hasRLS: true,
    healthStatus: 'healthy',
    lastDeploy: '2026-08-18',
  },
  {
    name: 'Quadropus',
    domain: 'quadropus.ai',
    status: 'live',
    stage: 'Client-facing platform',
    users: 0,
    monthlyAiCost: 0,
    aiProvider: 'Multi-model',
    hasAuth: false,
    hasRateLimit: false,
    hasCostCap: false,
    hasRLS: false,
    healthStatus: 'healthy',
    lastDeploy: '2026-08-22',
  },
]

const governanceAgents: GovernanceAgent[] = [
  {
    name: 'Quadropus Overwatch',
    scope: 'global',
    appliesTo: ['All Products'],
    rulesCount: 28,
    lastUpdated: '2026-08-23',
    status: 'active',
  },
  {
    name: 'HikeMind Security',
    scope: 'project',
    appliesTo: ['HikeMind'],
    rulesCount: 12,
    lastUpdated: '2026-08-23',
    status: 'active',
  },
  {
    name: 'Duelly Security',
    scope: 'project',
    appliesTo: ['Duelly'],
    rulesCount: 8,
    lastUpdated: '2026-08-23',
    status: 'active',
  },
  {
    name: 'MarketMojo Security',
    scope: 'project',
    appliesTo: ['MarketMojo'],
    rulesCount: 8,
    lastUpdated: '2026-08-23',
    status: 'active',
  },
  {
    name: 'Quadropus Identity',
    scope: 'project',
    appliesTo: ['Quadropus'],
    rulesCount: 6,
    lastUpdated: '2026-08-23',
    status: 'active',
  },
]

const costs: CostEntry[] = [
  {
    provider: 'Google Gemini',
    product: 'HikeMind',
    monthlyCost: 0,
    dailyCap: 15,
    currentDailyUsage: 0,
    trend: 'stable',
  },
  {
    provider: 'OpenAI',
    product: 'Duelly',
    monthlyCost: 28.50,
    dailyCap: 10,
    currentDailyUsage: 0.95,
    trend: 'stable',
  },
  {
    provider: 'Google Gemini',
    product: 'MarketMojo',
    monthlyCost: 4.20,
    dailyCap: 5,
    currentDailyUsage: 0.14,
    trend: 'down',
  },
  {
    provider: 'Serper',
    product: 'Duelly',
    monthlyCost: 15.00,
    dailyCap: 50,
    currentDailyUsage: 12,
    trend: 'stable',
  },
]

const alerts: Alert[] = [
  {
    id: '1',
    severity: 'warning',
    message: 'Gemini spend cap NOT configured — code-level rate limiting is the only protection',
    product: 'HikeMind',
    timestamp: '2026-08-23T14:00:00Z',
    resolved: false,
  },
  {
    id: '2',
    severity: 'warning',
    message: 'Google OAuth redirect_uri_mismatch — production URL not added to credentials',
    product: 'HikeMind',
    timestamp: '2026-08-23T14:00:00Z',
    resolved: false,
  },
  {
    id: '3',
    severity: 'info',
    message: 'Pack Lab Supabase sync deployed but untested end-to-end',
    product: 'HikeMind',
    timestamp: '2026-08-23T12:00:00Z',
    resolved: false,
  },
  {
    id: '4',
    severity: 'critical',
    message: 'Stripe payments not integrated — no revenue collection on Pro tier',
    product: 'HikeMind',
    timestamp: '2026-08-23T10:00:00Z',
    resolved: false,
  },
  {
    id: '5',
    severity: 'info',
    message: 'Affiliate URLs empty — revenue tracking infrastructure built but no links populated',
    product: 'HikeMind',
    timestamp: '2026-08-23T10:00:00Z',
    resolved: false,
  },
]

// --- Components ---

function StatusBadge({ status }: { status: ProductStatus }) {
  const styles = {
    live: 'bg-green-500/15 text-green-400 border-green-500/30',
    development: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    paused: 'bg-muted text-muted-foreground border-border',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${styles[status]}`}>
      <span className={`size-1.5 rounded-full ${status === 'live' ? 'bg-green-400' : status === 'development' ? 'bg-yellow-400' : 'bg-muted-foreground'}`} />
      {status === 'live' ? 'Live' : status === 'development' ? 'In Dev' : 'Paused'}
    </span>
  )
}

function ComplianceDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-3.5 text-green-400" />
  ) : (
    <XCircle className="size-3.5 text-red-400" />
  )
}

function HealthIndicator({ status }: { status: HealthStatus }) {
  const color = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <span className={`size-2 rounded-full ${color} shadow-[0_0_6px_currentColor]`} />
  )
}

function SeverityBadge({ severity }: { severity: Alert['severity'] }) {
  const styles = {
    critical: 'bg-red-500/15 text-red-400',
    warning: 'bg-yellow-500/15 text-yellow-400',
    info: 'bg-blue-500/15 text-blue-400',
  }
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[severity]}`}>
      {severity}
    </span>
  )
}

// --- Page ---

export default function CommandCenterPage() {
  const totalMonthlyCost = costs.reduce((sum, c) => sum + c.monthlyCost, 0)
  const totalUsers = products.reduce((sum, p) => sum + p.users, 0)
  const liveProducts = products.filter((p) => p.status === 'live').length
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand/15">
              <Shield className="size-5 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Command Center
              </h1>
              <p className="text-[12px] font-light text-muted-foreground">
                Fundy Logic Inc. — Governance & Operations
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-1.5">
            <Activity className="size-3.5 text-green-500" />
            <span className="text-[11px] font-light text-muted-foreground">
              {liveProducts} products live
            </span>
          </div>
          {criticalAlerts > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5">
              <AlertTriangle className="size-3.5 text-red-400" />
              <span className="text-[11px] font-medium text-red-400">
                {criticalAlerts} critical
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Daily brief (the headline) */}
      <div className="mt-6">
        <BriefPanel />
      </div>

      {/* Live health + leads (real data) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <HealthPanel />
        <LeadsPanel />
      </div>

      {/* Top Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Products</p>
            <Globe className="size-4 text-brand/70" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{products.length}</p>
          <p className="mt-1 text-[11px] font-light text-muted-foreground">{liveProducts} live, {products.length - liveProducts} in dev</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Total Users</p>
            <Users className="size-4 text-brand/70" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{totalUsers}</p>
          <p className="mt-1 text-[11px] font-light text-muted-foreground">across all products</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">AI Costs</p>
            <DollarSign className="size-4 text-brand/70" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">${totalMonthlyCost.toFixed(2)}</p>
          <p className="mt-1 text-[11px] font-light text-muted-foreground">/month total spend</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Alerts</p>
            <AlertTriangle className="size-4 text-yellow-500/70" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{unresolvedAlerts}</p>
          <p className="mt-1 text-[11px] font-light text-red-400">{criticalAlerts} critical, {alerts.filter(a => a.severity === 'warning' && !a.resolved).length} warnings</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mt-8">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Products
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {products.map((product) => (
            <div key={product.name} className="rounded-xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HealthIndicator status={product.healthStatus} />
                  <div>
                    <h3 className="text-[14px] font-medium text-foreground">{product.name}</h3>
                    <p className="text-[11px] font-light text-muted-foreground">{product.domain}</p>
                  </div>
                </div>
                <StatusBadge status={product.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Stage</p>
                  <p className="text-[12px] font-light text-foreground">{product.stage}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Users</p>
                  <p className="text-[12px] font-light text-foreground">{product.users}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">AI Cost</p>
                  <p className="text-[12px] font-light text-foreground">${product.monthlyAiCost.toFixed(2)}/mo</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-3">
                <div className="flex items-center gap-1.5">
                  <ComplianceDot ok={product.hasAuth} />
                  <span className="text-[10.5px] text-muted-foreground">Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ComplianceDot ok={product.hasRateLimit} />
                  <span className="text-[10.5px] text-muted-foreground">Rate Limit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ComplianceDot ok={product.hasCostCap} />
                  <span className="text-[10.5px] text-muted-foreground">Cost Cap</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ComplianceDot ok={product.hasRLS} />
                  <span className="text-[10.5px] text-muted-foreground">RLS</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                <Cpu className="size-3" />
                <span>{product.aiProvider}</span>
                <span className="text-border">|</span>
                <Clock className="size-3" />
                <span>Deployed {product.lastDeploy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Governance Agents + Cost Breakdown */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Governance Agents */}
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Governance Agents
            </h2>
            <div className="flex items-center gap-1.5">
              <Eye className="size-3.5 text-brand/70" />
              <span className="text-[10.5px] text-muted-foreground">{governanceAgents.length} active</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {governanceAgents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-md ${agent.scope === 'global' ? 'bg-brand/15' : 'bg-blue-500/15'}`}>
                    {agent.scope === 'global' ? (
                      <Shield className="size-3.5 text-brand" />
                    ) : (
                      <Lock className="size-3.5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-foreground">{agent.name}</p>
                    <p className="text-[10.5px] font-light text-muted-foreground">
                      {agent.appliesTo.join(', ')} &middot; {agent.rulesCount} rules
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${agent.scope === 'global' ? 'bg-brand/15 text-brand' : 'bg-blue-500/15 text-blue-400'}`}>
                  {agent.scope}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              AI Cost Breakdown
            </h2>
            <div className="flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-brand/70" />
              <span className="text-[10.5px] text-muted-foreground">${totalMonthlyCost.toFixed(2)}/mo</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {costs.map((cost, i) => {
              const usagePercent = cost.dailyCap > 0 ? (cost.currentDailyUsage / cost.dailyCap) * 100 : 0
              return (
                <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground">{cost.provider}</p>
                      <p className="text-[10.5px] font-light text-muted-foreground">{cost.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12.5px] font-medium text-foreground">${cost.monthlyCost.toFixed(2)}/mo</p>
                      <p className="text-[10.5px] font-light text-muted-foreground">
                        Cap: ${cost.dailyCap}/day
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Today: ${cost.currentDailyUsage.toFixed(2)} / ${cost.dailyCap} ({usagePercent.toFixed(0)}%)
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Active Alerts
          </h2>
          <span className="text-[10.5px] text-muted-foreground">{unresolvedAlerts} unresolved</span>
        </div>
        <div className="mt-4 space-y-2">
          {alerts
            .filter((a) => !a.resolved)
            .sort((a, b) => {
              const order = { critical: 0, warning: 1, info: 2 }
              return order[a.severity] - order[b.severity]
            })
            .map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  alert.severity === 'critical'
                    ? 'border-red-500/30 bg-red-500/[0.05]'
                    : alert.severity === 'warning'
                    ? 'border-yellow-500/30 bg-yellow-500/[0.05]'
                    : 'border-border bg-secondary/40'
                }`}
              >
                <div className="mt-0.5">
                  {alert.severity === 'critical' ? (
                    <XCircle className="size-4 text-red-400" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="size-4 text-yellow-400" />
                  ) : (
                    <Zap className="size-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[10.5px] text-muted-foreground">{alert.product}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] font-light text-foreground/90">{alert.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Compliance Matrix */}
      <div className="mt-8">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Overwatch Compliance Matrix
        </h2>
        <p className="mt-1 text-[11px] font-light text-muted-foreground">
          Per quadropus-overwatch.md — every product must meet these minimums before launch
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Auth</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Rate Limit</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Cost Cap</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">RLS</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">STATUS.md</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">TODO.md</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Steering</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.name} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.hasAuth} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.hasRateLimit} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.hasCostCap} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.hasRLS} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.name !== 'Quadropus'} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={product.name !== 'Quadropus'} /></td>
                  <td className="px-4 py-3 text-center"><ComplianceDot ok={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="mt-8 rounded-xl border border-brand/25 bg-brand/[0.04] p-5">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-brand" />
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-foreground uppercase">
            Priority Actions
          </h2>
        </div>
        <div className="mt-4 space-y-2.5">
          {[
            { priority: 'P0', action: 'Set Gemini daily spend cap ($15/day) in Google Cloud Console', product: 'HikeMind' },
            { priority: 'P0', action: 'Fix Google OAuth redirect — add production URL to credentials', product: 'HikeMind' },
            { priority: 'P1', action: 'Manually test auth flow end-to-end (sign up → closet → Pack Lab → AI chat)', product: 'HikeMind' },
            { priority: 'P1', action: 'Build Stripe integration for Pro tier', product: 'HikeMind' },
            { priority: 'P2', action: 'Populate affiliate URLs (sign up for REI/Amazon programs)', product: 'HikeMind' },
            { priority: 'P2', action: 'Add CURRENT_STATUS.md and TODO.md', product: 'Quadropus' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                item.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                item.priority === 'P1' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {item.priority}
              </span>
              <div className="flex-1">
                <p className="text-[12.5px] font-light text-foreground/90">{item.action}</p>
                <p className="text-[10.5px] text-muted-foreground">{item.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
