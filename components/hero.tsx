import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-32 pb-20 sm:pt-40 lg:px-8 lg:pt-48 lg:pb-32"
    >
      {/* ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--brand) 45%, transparent), transparent)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-6">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border glass px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-brand" />
              The AI platform for SMBs
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-8 max-w-[16ch] text-5xl font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-6xl lg:text-7xl">
              One AI platform for your entire business.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[52ch] text-base leading-relaxed font-light text-muted-foreground sm:text-lg">
              Build your presence. Grow your customers. Automate your work.
              Operate from one dashboard.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#get-started"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-12px_var(--brand)] transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage:
                    'linear-gradient(100deg, var(--brand), var(--brand-alt))',
                }}
              >
                Get Started Free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-border glass px-6 py-3.5 text-sm font-light text-foreground transition-colors hover:border-foreground/25"
              >
                See How It Works
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mt-8 text-[12.5px] font-light text-muted-foreground/70">
              No credit card required · Free tier available · Setup in under 5
              minutes
            </p>
          </Reveal>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-12 opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in oklab, var(--brand-alt) 40%, transparent), transparent)',
            }}
          />
          <div
            className="relative w-[340px] overflow-hidden mix-blend-screen sm:w-[480px] lg:w-[600px] xl:w-[660px]"
            style={{ animation: 'float-y 6s ease-in-out infinite' }}
          >
            <Image
              src="/quadropus-logo.png"
              alt="The Quadropus mark: four gradient tendrils extending from a central form"
              width={920}
              height={753}
              priority
              className="-mb-[19%] w-full mix-blend-screen"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
