import { Gauge } from 'lucide-react'

export default function OperatePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand">
          <Gauge className="size-[18px]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Operate</h1>
          <p className="text-[13px] font-light text-muted-foreground">Revenue, pipeline, and business intelligence.</p>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming soon. This section will display real data from your connected services.</p>
      </div>
    </div>
  )
}
