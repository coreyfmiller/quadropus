import { Reveal } from '@/components/reveal'

export function Vision() {
  return (
    <section id="company" className="px-6 py-28 lg:px-8 lg:py-44">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-3xl leading-[1.15] font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-4xl lg:text-6xl">
          The future of business isn&apos;t more software.
        </p>
        <p className="mx-auto mt-8 max-w-[52ch] text-lg leading-relaxed font-light text-balance text-muted-foreground lg:text-xl">
          It&apos;s one intelligent platform that builds, grows, automates, and
          operates — so you can focus on what matters.
        </p>
      </Reveal>
    </section>
  )
}
