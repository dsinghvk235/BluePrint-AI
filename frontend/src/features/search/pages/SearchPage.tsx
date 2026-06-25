import { motion } from 'framer-motion'
import { FileText, FolderKanban, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { useDebounce } from '@/shared/hooks'
import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'

const allResults = [
  { type: 'project', title: 'Netflix Architecture', path: ROUTES.WORKSPACE },
  { type: 'project', title: 'Uber Ride Matching', path: ROUTES.WORKSPACE },
  { type: 'template', title: 'E-commerce Platform', path: ROUTES.PROJECTS },
  { type: 'lesson', title: 'Microservices Fundamentals', path: ROUTES.DASHBOARD },
  { type: 'component', title: 'API Gateway', path: ROUTES.WORKSPACE },
] as const

const typeIcons = {
  project: FolderKanban,
  template: FileText,
  lesson: Sparkles,
  component: Search,
} as const

const typeColors = {
  project: 'default',
  template: 'secondary',
  lesson: 'accent',
  component: 'info',
} as const

export function SearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 200)

  const results = debouncedQuery
    ? allResults.filter((r) => r.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Find projects, templates, components, and lessons.
        </p>

        <div className="relative mt-6">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything…"
            className="pl-10"
            autoFocus
            aria-label="Search"
          />
        </div>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {!debouncedQuery && (
              <EmptyState
                icon={Search}
                title="Start typing to search"
                description="Search across projects, templates, components, and learning content."
              />
            )}
            {debouncedQuery && results.length === 0 && (
              <EmptyState
                icon={Search}
                title="No results found"
                description={`Nothing matches "${debouncedQuery}". Try a different term.`}
              />
            )}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => {
                  const Icon = typeIcons[result.type]
                  return (
                    <Link key={result.title} to={result.path}>
                      <Card className="transition-shadow hover:shadow-[var(--shadow-elevation-2)]">
                        <CardContent className="flex items-center gap-3 p-4">
                          <Icon className="text-muted-foreground h-4 w-4" aria-hidden />
                          <span className="flex-1 text-sm font-medium">{result.title}</span>
                          <Badge
                            variant={typeColors[result.type]}
                            className="text-[10px] capitalize"
                          >
                            {result.type}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
