import { FolderKanban, LayoutDashboard, Search, Settings, Sparkles } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'

import { AppCommandPalette } from '@/app/components/AppCommandPalette'
import {
  Navbar,
  PageTransition,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
} from '@/shared/ui'
import { ROUTES } from '@/shared/constants'
import { useCommandPalette } from '@/shared/hooks'

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.WORKSPACE, label: 'Workspace', icon: Sparkles },
  { to: ROUTES.PROJECTS, label: 'Projects', icon: FolderKanban },
  { to: ROUTES.SEARCH, label: 'Search', icon: Search },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
] as const

export function AppShellLayout() {
  const location = useLocation()
  const { open, setOpen } = useCommandPalette()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar onSearchClick={() => setOpen(true)} />
        <AppCommandPalette open={open} onOpenChange={setOpen} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="hidden lg:flex">
            <SidebarHeader>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Navigation
              </p>
            </SidebarHeader>
            <SidebarContent>
              <nav className="flex flex-col gap-0.5" aria-label="App navigation">
                {navItems.map((item) => (
                  <SidebarNavItem
                    key={item.to}
                    to={item.to}
                    active={location.pathname.startsWith(item.to)}
                    icon={<item.icon className="h-4 w-4 shrink-0" aria-hidden />}
                  >
                    {item.label}
                  </SidebarNavItem>
                ))}
              </nav>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-y-auto">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
