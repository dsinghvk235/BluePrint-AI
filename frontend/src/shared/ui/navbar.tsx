import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown'
import { cn } from '@/shared/utils'

interface NavbarProps extends React.ComponentProps<'header'> {
  onSearchClick?: () => void
  showSearch?: boolean
  user?: { name: string; email: string }
}

function Navbar({
  className,
  onSearchClick,
  showSearch = true,
  user = { name: 'Engineer', email: 'you@blueprintai.dev' },
  children,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cn(
        'surface-solid sticky top-0 z-[var(--z-sticky)] flex h-[var(--navbar-height)] items-center border-b',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-[var(--content-max)] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <BrandLogo size="sm" />
          {children}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hidden w-48 justify-start gap-2 md:flex"
              onClick={onSearchClick}
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Search…</span>
              <kbd className="bg-secondary text-muted-foreground ml-auto rounded px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-[var(--radius-squircle)]"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[var(--color-brand-muted)] text-xs text-[var(--color-brand)]">
                    EN
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-muted-foreground text-xs font-normal">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTES.PROFILE}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={ROUTES.SETTINGS}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTES.AUTH.LOGIN}>Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
