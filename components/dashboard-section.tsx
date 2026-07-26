import { DashboardPreview } from '@/components/dashboard-preview'
import { Reveal } from '@/components/reveal'

export function DashboardSection() {
  return (
    <section id="solutions" className="relative px-6 py-24 lg:px-8 lg:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--brand-alt) 40%, transparent), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl lg:text-5xl">
            One intelligent system.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed font-light text-muted-foreground">
            See everything. Control everything. From one screen.
          </p>
        </Reveal>

        <Reveal delay={0.1} y={40} className="mt-14 lg:mt-20">
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  )
}
