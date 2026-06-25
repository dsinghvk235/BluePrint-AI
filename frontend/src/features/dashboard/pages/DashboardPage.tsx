import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Clock,
  FolderKanban,
  LayoutTemplate,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/ui'

const recentProjects = [
  { name: 'Netflix Architecture', updated: '2 hours ago', progress: 75 },
  { name: 'Uber Ride Matching', updated: 'Yesterday', progress: 45 },
  { name: 'Smart Hospital System', updated: '3 days ago', progress: 90 },
] as const

const templates = [
  { name: 'E-commerce Platform', category: 'Retail', nodes: 12 },
  { name: 'Social Media Feed', category: 'Social', nodes: 15 },
  { name: 'Real-time Chat', category: 'Communication', nodes: 8 },
  { name: 'ML Pipeline', category: 'AI/ML', nodes: 10 },
] as const

const learningPaths = [
  { title: 'Microservices Fundamentals', lessons: 8, completed: 3 },
  { title: 'Database Scaling Patterns', lessons: 6, completed: 1 },
  { title: 'API Design Best Practices', lessons: 5, completed: 0 },
] as const

const aiSuggestions = [
  'Explore caching strategies for your Netflix design',
  'Add a CDN layer to reduce latency',
  'Review CAP theorem trade-offs in your database choice',
] as const

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-5 py-8 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome back. Continue where you left off.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Input placeholder="Search projects…" className="pr-8" aria-label="Search projects" />
            </div>
            <Button asChild>
              <Link to={ROUTES.WORKSPACE}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New project</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { label: 'Open Workspace', to: ROUTES.WORKSPACE, icon: Sparkles },
            { label: 'Browse Templates', to: ROUTES.PROJECTS, icon: LayoutTemplate },
            { label: 'Continue Learning', to: ROUTES.WORKSPACE, icon: BookOpen },
          ].map((action) => (
            <Button key={action.label} variant="outline" size="sm" asChild>
              <Link to={action.to}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FolderKanban className="h-4 w-4" aria-hidden />
                Recent Projects
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.PROJECTS}>View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="bg-primary-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <Sparkles className="text-primary h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{project.name}</p>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {project.updated}
                        </p>
                      </div>
                      <div className="hidden items-center gap-3 sm:flex">
                        <div className="text-right">
                          <p className="text-xs font-medium">{project.progress}%</p>
                          <div className="bg-muted mt-1 h-1.5 w-20 overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={ROUTES.WORKSPACE} aria-label={`Open ${project.name}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" aria-hidden />
              AI Suggestions
            </h2>
            <Card>
              <CardContent className="space-y-3 p-4">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="hover:bg-accent w-full rounded-lg p-2 text-left text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Templates */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <LayoutTemplate className="h-4 w-4" aria-hidden />
              Templates
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.name}
                  className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]"
                >
                  <CardHeader className="p-4">
                    <Badge variant="secondary" className="w-fit text-[10px]">
                      {template.category}
                    </Badge>
                    <CardTitle className="mt-2 text-sm">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.nodes} components
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Continue Learning */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4" aria-hidden />
              Continue Learning
            </h2>
            <div className="space-y-3">
              {learningPaths.map((path) => (
                <Card key={path.title}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{path.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {path.completed} of {path.lessons} lessons completed
                    </p>
                    <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-accent h-full rounded-full"
                        style={{ width: `${(path.completed / path.lessons) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
