import * as React from 'react'

import { cn } from '@/shared/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[5rem] w-full rounded-[var(--radius-squircle)] border bg-white px-3 py-2 text-sm shadow-[var(--shadow-elevation-1)] transition-colors duration-[var(--motion-duration-fast)] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
