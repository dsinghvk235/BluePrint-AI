import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import * as React from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/utils'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const toggle = React.useCallback(() => setCollapsed((c) => !c), [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.ComponentProps<'aside'> {
  collapsible?: boolean
}

function Sidebar({ className, children, collapsible = true }: SidebarProps) {
  const { collapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'bg-sidebar border-border flex h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-[var(--motion-duration-normal)]',
        className,
      )}
      style={{ width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}
      aria-label="Sidebar navigation"
    >
      {children}
      {collapsible && <SidebarToggle />}
    </aside>
  )
}

function SidebarToggle() {
  const { collapsed, toggle } = useSidebar()

  return (
    <div className="border-border mt-auto border-t p-2">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4" />
            <span className="ml-2">Collapse</span>
          </>
        )}
      </Button>
    </div>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-border border-b p-4', className)} {...props} />
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex-1 overflow-y-auto p-2', className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-border border-t p-2', className)} {...props} />
}

interface SidebarNavItemProps extends LinkProps {
  active?: boolean
  icon?: React.ReactNode
}

function SidebarNavItem({ className, active, icon, children, ...props }: SidebarNavItemProps) {
  const { collapsed } = useSidebar()

  return (
    <Link
      className={cn(
        'flex items-center gap-2 rounded-[var(--radius-squircle)] px-2 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--color-brand-muted)]',
        active && 'bg-[var(--color-brand-muted)] text-[var(--color-brand)]',
        collapsed && 'justify-center px-2',
        className,
      )}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {icon}
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  )
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNavItem }
