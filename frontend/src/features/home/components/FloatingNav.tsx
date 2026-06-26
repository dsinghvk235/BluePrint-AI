import { AnimatePresence, motion } from 'framer-motion'
import { Link2, LogIn, MessageCircle, Play, Share2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { useAuthDialogStore } from '@/shared/stores/auth-dialog-store'
import { BrandLogo, Button } from '@/shared/ui'
import { cn } from '@/shared/utils'

const NAV_WIDTH = 340
const NAV_SPRING = { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.85 }

const navLeft = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Preview', href: '#preview' },
  { label: 'Impact', href: '#impact' },
  { label: 'FAQ', href: '#faq' },
] as const

const navRightLinks = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Workspace', href: ROUTES.WORKSPACE },
  { label: 'Projects', href: ROUTES.PROJECTS },
] as const

const socials = [
  { icon: X, label: 'X', href: '#' },
  { icon: Link2, label: 'LinkedIn', href: '#' },
  { icon: Share2, label: 'Instagram', href: '#' },
  { icon: Play, label: 'YouTube', href: '#' },
  { icon: MessageCircle, label: 'Discord', href: '#' },
] as const

function BentoMenuIcon({ className }: { className?: string }) {
  return (
    <span className={cn('inline-grid grid-cols-3 gap-[3px]', className)} aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-[5px] w-[5px] rounded-full bg-[var(--color-purple-2)]" />
      ))}
    </span>
  )
}

export function FloatingNav() {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const openLogin = useAuthDialogStore((s) => s.openLogin)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, close])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={NAV_SPRING}
            className="fixed inset-0 z-[calc(var(--z-sticky)-1)] bg-white/20 backdrop-blur-[2px]"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div
        ref={navRef}
        className="fixed top-3 left-1/2 z-[var(--z-sticky)] w-[min(340px,calc(100vw-1.5rem))] -translate-x-1/2 sm:top-4"
        style={{ maxWidth: NAV_WIDTH }}
      >
        <motion.nav
          layout
          transition={{ layout: NAV_SPRING, default: NAV_SPRING }}
          className="floating-nav p-1"
          aria-label="Main navigation"
          aria-expanded={open}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="expanded"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={NAV_SPRING}
                className="flex flex-col items-center"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <Link to={ROUTES.HOME} onClick={close}>
                    <BrandLogo size="md" asLink={false} />
                  </Link>
                  <Button size="sm" className="h-8 shrink-0 px-3 text-xs" asChild onClick={close}>
                    <Link to={ROUTES.DASHBOARD}>Open workspace</Link>
                  </Button>
                </div>

                <div className="mt-5 grid w-full grid-cols-2 gap-x-8 gap-y-0.5">
                  <ul className="space-y-2">
                    {navLeft.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          onClick={close}
                          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2">
                    {navRightLinks.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          onClick={close}
                          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          close()
                          openLogin()
                        }}
                        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                      >
                        Contact
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 flex w-full items-center justify-center gap-4 border-t border-[var(--color-border-subtle)] pt-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="text-[var(--color-purple-2)] transition-colors hover:text-[var(--color-brand)]"
                      aria-label={s.label}
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={toggle}
                  className="text-muted-foreground hover:text-foreground mx-auto mt-4 flex items-center gap-1.5 text-xs"
                  aria-label="Collapse menu"
                >
                  <BentoMenuIcon />
                  Close menu
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={NAV_SPRING}
                className="grid h-[52px] w-full grid-cols-[1fr_auto_1fr] items-center"
              >
                <Link to={ROUTES.HOME} className="justify-self-start pl-1.5">
                  <BrandLogo size="sm" asLink={false} />
                </Link>

                <button
                  type="button"
                  onClick={toggle}
                  className="justify-self-center rounded-full p-1.5 text-[var(--color-purple-2)] transition-colors hover:text-[var(--color-brand)]"
                  aria-label="Expand menu"
                  aria-expanded={false}
                >
                  <BentoMenuIcon />
                </button>

                <button
                  type="button"
                  onClick={openLogin}
                  aria-label="Sign in"
                  className="floating-nav-cta icon-cta mr-0.5 flex h-9 w-9 items-center justify-center justify-self-end rounded-[var(--radius-squircle)] transition-transform hover:scale-[1.03]"
                >
                  <LogIn className="h-4 w-4" strokeWidth={2} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  )
}
