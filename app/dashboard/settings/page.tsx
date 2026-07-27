import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand">
          <Settings className="size-[18px]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-[13px] font-light text-muted-foreground">Account, integrations, and preferences.</p>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming soon. This section will display real data from your connected services.</p>
      </div>
    </div>
  )
}
