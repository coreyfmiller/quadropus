import { modelProviders } from '@/components/brand-logos'
import { Reveal } from '@/components/reveal'

export function AiModels() {
  return (
    <section className="border-y border-border/60 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            Powered by the best AI on earth.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-base leading-relaxed font-light text-muted-foreground">
            Quadropus selects the right model for every task. No vendor
            lock-in. Always the best available intelligence.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-16 grid grid-cols-2 items-center gap-x-8 gap-y-12 sm:grid-cols-4">
            {modelProviders.map(({ name, Logo }) => (
              <li key={name} className="flex flex-col items-center gap-4">
                <Logo className="size-8 text-foreground/70 transition-colors hover:text-foreground" />
                <span className="text-[12px] font-light tracking-[0.12em] text-muted-foreground uppercase">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
