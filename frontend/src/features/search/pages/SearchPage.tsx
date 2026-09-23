import { motion } from 'framer-motion'
import { BookOpen, FileText, FolderKanban, Loader2, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  highlightText,
  useSearchHistory,
  useUnifiedSearch,
  type SearchCategory,
  type SearchResultItem,
} from '@/features/search'
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

const categoryIcons: Record<SearchCategory, typeof Search> = {
  PROJECT: FolderKanban,
  RECENT_PROJECT: FolderKanban,
  COMPONENT: Search,
  KNOWLEDGE: BookOpen,
  TEMPLATE: FileText,
  ACTION: Sparkles,
}

const categoryLabels: Record<SearchCategory, string> = {
  PROJECT: 'project',
  RECENT_PROJECT: 'recent',
  COMPONENT: 'component',
  KNOWLEDGE: 'lesson',
  TEMPLATE: 'template',
  ACTION: 'action',
}

const categoryVariants: Record<
  SearchCategory,
  'default' | 'secondary' | 'accent' | 'info' | 'outline'
> = {
  PROJECT: 'default',
  RECENT_PROJECT: 'secondary',
  COMPONENT: 'info',
  KNOWLEDGE: 'accent',
  TEMPLATE: 'secondary',
  ACTION: 'outline',
}

function filterByTab(results: SearchResultItem[], tab: string): SearchResultItem[] {
  if (tab === 'all') return results
  if (tab === 'projects') {
    return results.filter((r) => r.category === 'PROJECT' || r.category === 'RECENT_PROJECT')
  }
  if (tab === 'templates') {
    return results.filter((r) => r.category === 'TEMPLATE')
  }
  return results
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const debouncedQuery = useDebounce(query, 200)
  const { data, isFetching, isLoading } = useUnifiedSearch(debouncedQuery)
  const { data: history } = useSearchHistory()

  const results = useMemo(() => filterByTab(data?.results ?? [], tab), [data?.results, tab])

  const showHistory = !debouncedQuery && history && history.length > 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Find projects, templates, components, and engineering knowledge.
        </p>

        <div className="relative mt-6">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything… (⌘K)"
            className="pl-10"
            autoFocus
            aria-label="Search"
          />
          {(isLoading || isFetching) && debouncedQuery && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {showHistory && (
          <div className="mt-4 flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuery(item.query)}
                className="bg-muted hover:bg-accent rounded-full px-3 py-1 text-xs transition-colors"
              >
                {item.query}
              </button>
            ))}
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {!debouncedQuery && !showHistory && (
              <EmptyState
                icon={Search}
                title="Start typing to search"
                description="Search across projects, templates, components, and learning content."
              />
            )}
            {debouncedQuery && results.length === 0 && !isFetching && (
              <EmptyState
                icon={Search}
                title="No results found"
                description={`Nothing matches "${debouncedQuery}". Try a different term.`}
              />
            )}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => {
                  const Icon = categoryIcons[result.category]
                  return (
                    <Link key={result.id} to={result.route}>
                      <Card className="transition-shadow hover:shadow-[var(--shadow-elevation-2)]">
                        <CardContent className="flex items-center gap-3 p-4">
                          <Icon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {highlightText(result.title, result.highlights)}
                            </p>
                            {result.subtitle && (
                              <p className="text-muted-foreground truncate text-xs">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={categoryVariants[result.category]}
                            className="text-[10px] capitalize"
                          >
                            {categoryLabels[result.category]}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
            {data && debouncedQuery && (
              <p className="text-muted-foreground mt-4 text-center text-xs">
                {data.totalCount} results in {data.tookMs}ms
              </p>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
