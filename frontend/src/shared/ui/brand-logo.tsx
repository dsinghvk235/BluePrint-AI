import { Link } from 'react-router-dom'

import { APP_NAME, ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  lowercase?: boolean
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
} as const

export function BrandLogo({
  className,
  size = 'md',
  asLink = true,
  lowercase = true,
}: BrandLogoProps) {
  const label = lowercase ? APP_NAME.toLowerCase() : APP_NAME
  const content = (
    <span
      className={cn('brand-gradient-text font-bold tracking-tight', sizeClasses[size], className)}
    >
      {label}
    </span>
  )

  if (!asLink) return content

  return (
    <Link to={ROUTES.HOME} className="inline-flex shrink-0">
      {content}
    </Link>
  )
}
