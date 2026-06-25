import { APP_TAGLINE, ROUTES } from '@/shared/constants'
import { BrandLogo } from '@/shared/ui'

const footerNav = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Preview', href: '#preview' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Workspace', href: ROUTES.WORKSPACE },
  { label: 'Sign in', href: ROUTES.AUTH.LOGIN },
] as const

export function AppFooter() {
  return (
    <footer className="surface-solid border-t">
      <div className="mx-auto max-w-[var(--content-max)] px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <BrandLogo size="lg" />
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{APP_TAGLINE}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer navigation">
            {footerNav.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground text-sm font-medium transition-colors hover:text-[var(--color-brand)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="border-border text-muted-foreground mt-12 border-t pt-8 text-xs">
          © {new Date().getFullYear()} BlueprintAI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
