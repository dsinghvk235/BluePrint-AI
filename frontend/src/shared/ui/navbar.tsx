import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useLogout, useSession } from '@/features/auth/hooks/use-auth'
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
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Navbar({ className, onSearchClick, showSearch = true, children, ...props }: NavbarProps) {
  const { data: user } = useSession()
  const logout = useLogout()

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
                    {user ? getInitials(user.fullName) : '??'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.fullName ?? 'User'}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {user?.email ?? ''}
                  </span>
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
              <DropdownMenuItem onClick={() => logout.mutate()} disabled={logout.isPending}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
