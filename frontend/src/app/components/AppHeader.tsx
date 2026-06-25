import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { BrandLogo, Button } from '@/shared/ui'

export function AppHeader() {
  return (
    <header className="surface-solid sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo size="sm" />

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
