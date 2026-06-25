import { AlertCircle } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/utils'

interface ErrorStateProps extends React.ComponentProps<'div'> {
  title?: string
  description?: string
  onRetry?: () => void
}

function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
  children,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}
      role="alert"
      {...props}
    >
      <div className="bg-error-muted mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
        <AlertCircle className="text-error h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
      {children}
    </div>
  )
}

export { ErrorState }
