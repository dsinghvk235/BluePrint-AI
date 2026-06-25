import { cn } from '@/shared/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted relative overflow-hidden rounded-md',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--color-background)]/60 before:to-transparent',
        className,
      )}
      aria-hidden="true"
      role="status"
      aria-label="Loading"
      {...props}
    />
  )
}

export { Skeleton }
