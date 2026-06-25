import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Search,
  Sparkles,
  TrendingUp,
  Workflow,
} from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { Avatar, AvatarFallback } from '@/shared/ui'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FolderKanban, label: 'Projects', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Workflow, label: 'Workspace', active: false },
  { icon: BookOpen, label: 'Learning', active: false },
  { icon: TrendingUp, label: 'Progress', active: false },
]

const metrics = [
  {
    label: 'Systems explored',
    value: '2,480',
    change: '+32%',
    icon: Layers,
    iconBg: 'bg-[#ede9fe] text-[#8b5cf6]',
  },
  {
    label: 'Active projects',
    value: '18',
    change: '+3',
    icon: Sparkles,
    iconBg: 'bg-[#dbeafe] text-[#3b82f6]',
  },
  {
    label: 'AI explanations',
    value: '840',
    change: '+24%',
    icon: BookOpen,
    iconBg: 'bg-[#ffedd5] text-[#f97316]',
  },
]

const barData = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95]
const barData2 = [30, 50, 35, 60, 40, 55, 70, 45, 60, 70, 38, 75]

function BarChart() {
  return (
    <svg viewBox="0 0 400 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      {barData.map((h, i) => {
        const x = i * 34 + 4
        const h2 = barData2[i] ?? 30
        return (
          <g key={i}>
            <rect
              x={x}
              y={120 - h}
              width={12}
              height={h}
              rx={4}
              fill="url(#barGrad1)"
              opacity={0.9}
            />
            <rect
              x={x + 14}
              y={120 - h2}
              width={12}
              height={h2}
              rx={4}
              fill="url(#barGrad2)"
              opacity={0.85}
            />
          </g>
        )
      })}
      <defs>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function DonutChart() {
  return (
    <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ede9fe" strokeWidth="12" />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#donutGrad1)"
          strokeWidth="12"
          strokeDasharray="150 240"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#donutGrad2)"
          strokeWidth="12"
          strokeDasharray="90 240"
          strokeDashoffset="-150"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="donutGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
          <linearGradient id="donutGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-foreground text-lg font-bold sm:text-xl">72%</span>
        <span className="text-muted-foreground text-[9px]">Mastery</span>
      </div>
    </div>
  )
}

function DashboardCard() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[var(--shadow-nav)] sm:rounded-[2rem]">
      <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] px-4 py-3 sm:gap-4 sm:px-5">
        <span className="brand-gradient-text shrink-0 text-xs font-bold sm:text-sm">
          blueprintai
        </span>
        <div className="text-muted-foreground flex flex-1 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-section-alt)] px-3 py-2 text-xs">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search architectures…</span>
        </div>
        <Link
          to={ROUTES.WORKSPACE}
          className="btn-brand pointer-events-auto hidden shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-semibold sm:inline-flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          New project
        </Link>
        <button
          type="button"
          className="hover:bg-secondary relative hidden rounded-full p-2 sm:block"
          aria-label="Notifications"
        >
          <Bell className="text-muted-foreground h-4 w-4" />
          <span className="bg-error absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full" />
        </button>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary-muted text-[10px]">EN</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex">
        <aside className="border-border hidden w-44 shrink-0 border-r p-3 sm:block lg:w-48 lg:p-4">
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium ${
                  item.active
                    ? 'bg-[var(--color-brand-muted)] text-[var(--color-brand)]'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <p className="text-muted-foreground text-xs font-medium">Performance overview</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-section-alt)]/60 p-3 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`rounded-xl p-2 ${m.iconBg}`}>
                    <m.icon className="h-4 w-4" />
                  </div>
                  <span className="text-success text-[10px] font-semibold sm:text-xs">
                    {m.change}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-[10px] sm:text-xs">{m.label}</p>
                <p className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3 lg:gap-4">
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  Learning analytics
                </p>
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                    Architectures
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
                    AI insights
                  </span>
                </div>
              </div>
              <div className="h-24 sm:h-28">
                <BarChart />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-4">
              <p className="text-foreground mb-2 text-xs font-semibold sm:text-sm">
                Skill distribution
              </p>
              <DonutChart />
              <div className="mt-2 space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                    System design
                  </span>
                  <span className="text-muted-foreground">62%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
                    AI concepts
                  </span>
                  <span className="text-muted-foreground">38%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SCROLL_SPRING = { stiffness: 70, damping: 22, mass: 0.35, restDelta: 0.0005 }

function PerspectiveDashboard({
  rotateX,
  rotateY,
  scale,
  y,
}: {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  scale: MotionValue<number>
  y: MotionValue<number>
}) {
  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        scale,
        y,
        transformPerspective: 1400,
        transformOrigin: 'center bottom',
        willChange: 'transform',
      }}
      className="relative z-10 mx-auto w-full max-w-6xl px-2 sm:px-4"
    >
      <DashboardCard />
    </motion.div>
  )
}

/** Scroll-driven 3D tilt: x-axis (angled) → y-axis (flat) as user scrolls */
export function ScrollPerspectiveDashboard() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, SCROLL_SPRING)

  const rotateX = useTransform(smoothProgress, [0, 0.25, 0.55, 0.8, 1], [44, 32, 18, 6, 0])
  const rotateY = useTransform(smoothProgress, [0, 0.25, 0.55, 0.8, 1], [-14, -10, -6, -2, 0])
  const scale = useTransform(smoothProgress, [0, 0.25, 0.55, 0.8, 1], [0.86, 0.9, 0.94, 0.98, 1])
  const y = useTransform(smoothProgress, [0, 0.25, 0.55, 0.8, 1], [140, 100, 60, 20, 0])
  const opacity = useTransform(smoothProgress, [0, 0.2], [0.9, 1])

  return (
    <section ref={containerRef} className="relative h-[220vh]" aria-label="Dashboard preview">
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden pt-14 pb-6">
        <motion.div style={{ opacity, willChange: 'opacity' }} className="relative w-full">
          <PerspectiveDashboard rotateX={rotateX} rotateY={rotateY} scale={scale} y={y} />
        </motion.div>
      </div>
    </section>
  )
}

export function FloatingCta() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.4 }}
      className="fixed right-5 bottom-5 z-[var(--z-sticky)] sm:right-8 sm:bottom-8"
    >
      <Link
        to={ROUTES.DASHBOARD}
        className="btn-brand inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-transform hover:scale-[1.03] sm:text-sm"
      >
        Get started free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}
