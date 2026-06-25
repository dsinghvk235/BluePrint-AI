import { motion } from 'framer-motion'
import { ArrowRight, Layers, Sparkles, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

import { APP_NAME, APP_TAGLINE, ROUTES } from '@/shared/constants'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

const features = [
  {
    icon: Workflow,
    title: 'Understand Systems',
    description: 'Explore real or imaginary architectures with AI-guided engineering explanations.',
  },
  {
    icon: Layers,
    title: 'Interactive Canvas',
    description: 'Design and edit diagrams in a visual workspace inspired by Figma and Notion.',
  },
  {
    icon: Sparkles,
    title: 'Learn by Building',
    description: 'Every decision includes What, Why, Why Not, principles, and trade-offs.',
  },
] as const

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-primary mb-4 text-sm font-medium">Phase 0 — Foundation</p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {APP_NAME}
        </h1>
        <p className="text-muted-foreground mt-6 text-lg sm:text-xl">{APP_TAGLINE}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to={ROUTES.DASHBOARD}>
              Open Workspace
              <ArrowRight className="ml-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" disabled>
            Sign In — Phase 1
          </Button>
        </div>
      </motion.section>

      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35 }}
          >
            <Card className="h-full transition-shadow hover:shadow-[var(--shadow-elevation-2)]">
              <CardHeader>
                <feature.icon className="text-primary mb-2 h-8 w-8" aria-hidden />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
