import { cn } from '@/shared/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
