import Image from 'next/image'

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Build', href: '#platform' },
      { label: 'Grow', href: '#platform' },
      { label: 'Automate', href: '#platform' },
      { label: 'Operate', href: '#platform' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#company' },
      { label: 'Contact', href: 'mailto:hello@quadropus.ai' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Pricing', href: '#pricing' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-2.5 lg:flex-col lg:items-start lg:gap-4">
            <span className="block w-9 overflow-hidden mix-blend-screen">
              <Image
                src="/quadropus-logo.png"
                alt=""
                width={160}
                height={131}
                className="-mb-[19%] w-full"
              />
            </span>
            <span className="text-[14px] font-semibold tracking-tight text-foreground">
              Quadropus<span className="text-brand-alt">.ai</span>
            </span>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[11px] font-medium tracking-[0.16em] text-foreground uppercase">
                {column.title}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-16 text-[12px] font-light text-muted-foreground/60">
          © 2026 Quadropus.ai · Atlantic Canada
        </p>
      </div>
    </footer>
  )
}
