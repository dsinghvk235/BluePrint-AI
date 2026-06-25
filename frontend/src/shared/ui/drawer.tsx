import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/utils'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'left' | 'right' | 'bottom'
  title?: string
  description?: string
  className?: string
}

const sideVariants = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    className: 'inset-y-0 left-0 h-full w-full max-w-sm border-r',
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    className: 'inset-y-0 right-0 h-full w-full max-w-sm border-l',
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    className: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t',
  },
} as const

function Drawer({
  open,
  onOpenChange,
  children,
  side = 'right',
  title,
  description,
  className,
}: DrawerProps) {
  const config = sideVariants[side]

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)]" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'bg-background border-border fixed flex flex-col shadow-[var(--shadow-elevation-4)]',
              config.className,
              className,
            )}
          >
            {(title || description) && (
              <div className="border-border flex items-start justify-between border-b px-4 py-3">
                <div>
                  {title && <h2 className="text-sm font-semibold">{title}</h2>}
                  {description && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export { Drawer }
