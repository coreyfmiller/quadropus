import { Check } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const tiers = [
  {
    name: 'Starter',
    price: '$97',
    summary: 'AI monitoring, analytics, basic automation',
    features: [
      'AI business monitoring',
      'Unified analytics',
      'Basic automation',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$497',
    summary: 'Full website, AI agents, content, SEO',
    features: [
      'Custom website & content',
      'AI chat & voice agents',
      'SEO + paid campaigns',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$1,497',
    summary: 'Complete AI operations team for your business',
    features: [
      'Everything in Growth',
      'Multi-channel automation',
      'Business intelligence',
      'Dedicated strategist',
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl lg:text-5xl">
            Transparent pricing. No surprises.
          </h2>
        </Reveal>

        <ul className="mt-16 grid gap-4 lg:mt-20 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <li key={tier.name}>
              <Reveal delay={i * 0.08} className="h-full">
                <article
                  className={`relative flex h-full flex-col rounded-2xl border p-7 transition-colors ${
                    tier.featured
                      ? 'border-brand/40 bg-brand/[0.06] shadow-[0_0_70px_-30px_var(--brand)]'
                      : 'border-border glass hover:border-foreground/20'
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-7 rounded-full border border-brand/40 bg-background px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-brand uppercase">
                      Most popular
                    </span>
                  )}

                  <h3 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    {tier.name}
                  </h3>

                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-[-0.03em] text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-sm font-light text-muted-foreground">
                      /mo
                    </span>
                  </p>

                  <p className="mt-4 text-[14.5px] leading-relaxed font-light text-foreground/80">
                    {tier.summary}
                  </p>

                  <ul className="mt-7 flex flex-col gap-3 border-t border-border/70 pt-7">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[13px] font-light text-muted-foreground"
                      >
                        <Check
                          className="mt-px size-3.5 shrink-0 text-brand"
                          strokeWidth={2}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#get-started"
                    className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-[13px] font-medium transition-colors ${
                      tier.featured
                        ? 'text-primary-foreground'
                        : 'border border-border text-foreground hover:bg-secondary'
                    }`}
                    style={
                      tier.featured
                        ? {
                            backgroundImage:
                              'linear-gradient(100deg, var(--brand), var(--brand-alt))',
                          }
                        : undefined
                    }
                  >
                    Choose {tier.name}
                  </a>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-14 flex flex-col items-center gap-6">
          <p className="text-[13px] font-light text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center justify-center rounded-xl border border-border glass px-6 py-3.5 text-sm font-light text-foreground transition-colors hover:border-brand/50"
          >
            Start Free Trial
          </a>
        </Reveal>
      </div>
    </section>
  )
}
