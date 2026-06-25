import * as React from 'react'

import { cn } from '@/shared/utils'

interface BentoCardProps extends React.ComponentProps<'div'> {
  span?: 'default' | 'wide' | 'tall' | 'large'
}

const spanClasses = {
  default: '',
  wide: 'md:col-span-2',
  tall: 'md:row-span-2',
  large: 'md:col-span-2 md:row-span-2',
} as const

export function BentoCard({ className, span = 'default', children, ...props }: BentoCardProps) {
  return (
    <div className={cn('bento-card p-6', spanClasses[span], className)} {...props}>
      {children}
    </div>
  )
}
