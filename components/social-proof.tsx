import { modelProviders } from '@/components/brand-logos'

export function SocialProof() {
  return (
    <section
      aria-label="Trust and technology"
      className="border-y border-border/60 px-6 py-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-x-6 gap-y-4 text-center sm:flex-row">
        <p className="text-[12.5px] font-light tracking-wide text-muted-foreground/70">
          Trusted by businesses across Atlantic Canada
        </p>
        <span
          aria-hidden="true"
          className="hidden h-3 w-px bg-border sm:block"
        />
        <div className="flex items-center gap-x-5">
          <p className="text-[12.5px] font-light tracking-wide text-muted-foreground/70">
            Powered by
          </p>
          <ul className="flex items-center gap-5">
            {modelProviders.map(({ name, Logo }) => (
              <li key={name}>
                <Logo className="size-[15px] text-muted-foreground/50" />
                <span className="sr-only">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
