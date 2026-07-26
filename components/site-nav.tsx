'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Company', href: '#company' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8"
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="block w-8 overflow-hidden mix-blend-screen">
            <Image
              src="/quadropus-logo.png"
              alt=""
              width={160}
              height={131}
              className="-mb-[19%] w-full"
              priority
            />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Quadropus
            <span className="text-brand-alt">.ai</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#signin"
            className="rounded-lg px-3 py-2 text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </a>
          <a
            href="#get-started"
            className="rounded-lg bg-brand/90 px-3.5 py-2 text-[13px] font-medium text-primary-foreground shadow-[0_0_24px_-6px_var(--brand)] transition-colors hover:bg-brand"
          >
            Get Started
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 px-6 pb-6 pt-2 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3.5 text-sm font-light text-muted-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#signin"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-light text-foreground"
              >
                Sign In
              </a>
              <a
                href="#get-started"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-brand py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
