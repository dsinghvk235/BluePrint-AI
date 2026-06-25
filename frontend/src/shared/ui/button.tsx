import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'btn-brand active:translate-y-px',
        destructive:
          'bg-destructive text-destructive-foreground rounded-[var(--radius-pill)] shadow-sm hover:bg-destructive/90',
        outline:
          'border border-border bg-white text-foreground rounded-[var(--radius-pill)] shadow-[var(--shadow-elevation-1)] hover:bg-secondary hover:shadow-[var(--shadow-nav)]',
        secondary:
          'bg-white border border-border text-secondary-foreground rounded-[var(--radius-pill)] shadow-[var(--shadow-elevation-1)] hover:bg-secondary',
        ghost: 'text-foreground rounded-[var(--radius-pill)] hover:bg-secondary',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-[var(--radius-pill)] px-4 text-xs',
        lg: 'h-12 rounded-[var(--radius-pill)] px-8 text-base',
        icon: 'h-10 w-10 rounded-[var(--radius-squircle)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
