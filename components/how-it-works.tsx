import { Reveal } from '@/components/reveal'

const steps = [
  {
    title: 'Tell us about your business',
    body: 'You answer a few questions. Our AI builds your profile.',
  },
  {
    title: 'We build your systems',
    body: 'Website, agents, automations — deployed automatically.',
  },
  {
    title: 'You grow. We operate.',
    body: 'AI handles the day-to-day. You focus on customers.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl lg:text-5xl">
            Live in 5 minutes.
          </h2>
        </Reveal>

        <ol className="relative mt-16 grid gap-12 lg:mt-24 lg:grid-cols-3 lg:gap-10">
          <div
            aria-hidden="true"
            className="absolute top-6 right-[16%] left-[16%] hidden h-px lg:block"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent, var(--border) 12%, var(--border) 88%, transparent)',
            }}
          />

          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 0.1} className="lg:text-center">
                <div className="flex items-center gap-4 lg:flex-col lg:gap-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[13px] font-medium text-brand shadow-[0_0_28px_-10px_var(--brand)]">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-medium tracking-tight text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed font-light text-muted-foreground lg:mx-auto">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
