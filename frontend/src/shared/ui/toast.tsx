import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { useToastStore, type ToastVariant } from '@/shared/stores/toast-store'
import { cn } from '@/shared/utils'

const variantStyles: Record<ToastVariant, { icon: typeof Info; className: string }> = {
  default: { icon: Info, className: 'border-border bg-background' },
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success-muted' },
  warning: { icon: AlertCircle, className: 'border-warning/30 bg-warning-muted' },
  error: { icon: XCircle, className: 'border-error/30 bg-error-muted' },
  info: { icon: Info, className: 'border-info/30 bg-info-muted' },
}

export function Toaster() {
  const { toasts, remove } = useToastStore()

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[var(--z-toast)] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const variant = t.variant ?? 'default'
          const { icon: Icon, className } = variantStyles[variant]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
              className={cn(
                'border-border pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-[var(--shadow-elevation-3)]',
                className,
              )}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && <p className="text-muted-foreground text-xs">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-muted-foreground hover:text-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
