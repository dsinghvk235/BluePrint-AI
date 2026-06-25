import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { BrandLogo, Button } from '@/shared/ui'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Preview', href: '#preview' },
  { label: 'FAQ', href: '#faq' },
] as const

export function LandingHeader() {
  return (
    <header className="surface-solid sticky top-0 z-[var(--z-sticky)] border-b">
      <div className="mx-auto flex h-[var(--navbar-height)] max-w-[var(--content-max)] items-center justify-between px-5 sm:px-8">
        <BrandLogo size="sm" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground text-sm font-medium transition-colors hover:text-[var(--color-brand)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to={ROUTES.AUTH.LOGIN}>Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={ROUTES.DASHBOARD}>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
