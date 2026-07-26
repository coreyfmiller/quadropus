import { Boxes, LineChart, Workflow, LayoutDashboard } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const functions = [
  {
    name: 'Build',
    icon: Boxes,
    line: 'Create your digital presence.',
    items: ['Custom websites', 'Brand identity', 'Content', 'Landing pages'],
  },
  {
    name: 'Grow',
    icon: LineChart,
    line: 'Acquire more customers.',
    items: [
      'SEO optimization',
      'Paid advertising',
      'Social media',
      'Email marketing',
    ],
  },
  {
    name: 'Automate',
    icon: Workflow,
    line: 'Replace repetitive work with AI.',
    items: [
      'AI chat agents',
      'Voice AI',
      'Workflow automation',
      'Smart scheduling',
    ],
  },
  {
    name: 'Operate',
    icon: LayoutDashboard,
    line: 'Run your business from one place.',
    items: ['CRM', 'Analytics', 'Knowledge base', 'Business intelligence'],
  },
]

export function FunctionsSection() {
  return (
    <section id="platform" className="px-6 py-24 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl lg:text-5xl">
            Everything your business needs. One login.
          </h2>
        </Reveal>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {functions.map((fn, i) => (
            <li key={fn.name}>
              <Reveal delay={i * 0.07} className="h-full">
                <article className="group relative flex h-full flex-col rounded-2xl border border-border glass p-7 transition-all duration-300 hover:border-brand/40 hover:shadow-[0_0_50px_-20px_var(--brand)]">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-brand transition-colors group-hover:text-brand-alt">
                    <fn.icon className="size-[18px]" strokeWidth={1.5} />
                  </div>

                  <h3 className="mt-7 text-[11px] font-semibold tracking-[0.2em] text-foreground uppercase">
                    {fn.name}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed font-light text-foreground/85">
                    {fn.line}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5 border-t border-border/70 pt-6">
                    {fn.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-[13px] font-light text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="size-1 shrink-0 rounded-full bg-brand/60"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
