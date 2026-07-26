import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

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

        <a
          href="#top"
          className="group mt-10 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-medium text-primary-foreground shadow-[0_16px_60px_-16px_var(--brand)] transition-transform hover:-translate-y-0.5"
          style={{
            backgroundImage:
              'linear-gradient(100deg, var(--brand), var(--brand-alt))',
          }}
        >
          Get Started Free
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </a>

        <p className="mt-7 text-[13px] font-light text-muted-foreground">
          Join 100+ businesses already on the platform.
        </p>
      </Reveal>
    </section>
  )
}
