import { motion } from 'framer-motion'
import { LayoutTemplate, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/shared/ui'

const projects = [
  { id: '1', name: 'Netflix Architecture', type: 'Streaming', updated: '2h ago', nodes: 14 },
  { id: '2', name: 'Uber Ride Matching', type: 'Mobility', updated: '1d ago', nodes: 11 },
  { id: '3', name: 'Smart Hospital System', type: 'Healthcare', updated: '3d ago', nodes: 18 },
  { id: '4', name: 'Mars Colony Infrastructure', type: 'Sci-Fi', updated: '1w ago', nodes: 22 },
] as const

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your architecture designs and templates.
            </p>
          </div>
          <Button asChild>
            <Link to={ROUTES.WORKSPACE}>
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={ROUTES.WORKSPACE}>
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="bg-primary-muted flex h-9 w-9 items-center justify-center rounded-lg">
                          <Sparkles className="text-primary h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {project.type}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 text-base">{project.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {project.nodes} components · Updated {project.updated}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-12"
            icon={LayoutTemplate}
            title="No projects yet"
            description="Create your first architecture to get started."
            action={
              <Button asChild>
                <Link to={ROUTES.WORKSPACE}>Create project</Link>
              </Button>
            }
          />
        )}
      </motion.div>
    </div>
  )
}
