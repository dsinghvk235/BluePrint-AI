import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/utils'

interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: 'sm' | 'default' | 'lg'
}

const sizeMap = {
  sm: 'h-4 w-4',
  default: 'h-5 w-5',
  lg: 'h-8 w-8',
} as const

function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn('text-primary animate-spin', sizeMap[size], className)}
      {...props}
    />
  )
}

export { Spinner }
