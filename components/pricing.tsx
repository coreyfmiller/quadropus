import { Check } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const tiers = [
  {
    name: 'Essentials',
    price: '$197',
    setup: '$3,500 one-time setup',
    summary: 'Your complete online presence, handled.',
    features: [
      'Custom website (5-10 pages)',
      'Full SEO setup (schema, meta, sitemap)',
      'AI chat agent on your site',
      'Google Business Profile optimization',
      'Website hosting + maintenance',
      'Unlimited content edits',
      'Monthly SEO + AI visibility monitoring',
      'Monthly performance report',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$497',
    setup: '$3,500 one-time setup',
    summary: 'Everything in Essentials plus active growth.',
    features: [
      'Everything in Essentials',
      '4 SEO blog posts per month',
      'Appointment booking integration',
      'Automated lead follow-up emails',
      'Google Business posts (3/week)',
      'Review response management',
      'AI visibility tracking (Duelly)',
      'Chat agent monthly tuning',
    ],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$997',
    setup: '$3,500 one-time setup',
    summary: 'Your full AI-powered marketing team.',
    features: [
      'Everything in Growth',
      'Google Ads setup + management',
      'Monthly strategy call (30 min)',
      'AI-generated growth recommendations',
      'Priority support',
      'Advanced analytics dashboard',
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
            Simple pricing. Real results.
          </h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-base leading-relaxed font-light text-muted-foreground">
            One setup fee to build everything. One monthly fee to keep it running and growing.
          </p>
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

                  <p className="mt-2 text-[12px] font-light text-brand">
                    {tier.setup}
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
                    Get Started
                  </a>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-14 flex flex-col items-center gap-4">
          <p className="text-[13px] font-light text-muted-foreground text-center max-w-lg">
            Every plan includes a custom website, AI chat agent, full SEO, and hosting. No hidden fees. Cancel anytime.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
