import { Reveal } from '@/components/reveal'
import { WaitlistForm } from '@/components/waitlist-form'

export function FinalCta() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden border-t border-border/60 px-6 py-28 lg:px-8 lg:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[440px] w-[820px] -translate-x-1/2 translate-y-1/3 rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--brand) 55%, transparent), transparent)',
        }}
      />

      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
          Ready to run your business with AI?
        </h2>

        <WaitlistForm className="mt-10 w-full max-w-md" />

        <p className="mt-7 text-[13px] font-light text-muted-foreground">
          Be among the first to experience the future of business AI.
        </p>
      </Reveal>
    </section>
  )
}
