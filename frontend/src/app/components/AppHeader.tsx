import { Link } from 'react-router-dom'

import { APP_NAME, ROUTES } from '@/shared/constants'
import { Button, ThemeToggle } from '@/shared/ui'

export function AppHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md text-xs">
            BP
          </span>
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
