import type { LucideIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/utils'

interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}
      {...props}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-squircle)] bg-[var(--color-brand-muted)]">
          <Icon className="h-6 w-6 text-[var(--color-brand)]" aria-hidden />
        </div>
      )}
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
      {children}
    </div>
  )
}

export { EmptyState }
