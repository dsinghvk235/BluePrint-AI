import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'

import { highlightText, useUnifiedSearch, type SearchCategory } from '@/features/search'
import { ROUTES } from '@/shared/constants'
import { useDebounce } from '@/shared/hooks'
import { CommandPalette, type CommandItem } from '@/shared/ui'

interface AppCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const searchIcons: Record<SearchCategory, typeof Search> = {
  PROJECT: FolderKanban,
  RECENT_PROJECT: FolderKanban,
  COMPONENT: Search,
  KNOWLEDGE: BookOpen,
  TEMPLATE: FileText,
  ACTION: Sparkles,
}

export function AppCommandPalette({ open, onOpenChange }: AppCommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 150)
  const { data, isFetching } = useUnifiedSearch(debouncedQuery, open)

  const navigationItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Go to Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        group: 'Navigation',
        shortcut: 'G D',
        onSelect: () => navigate(ROUTES.DASHBOARD),
      },
      {
        id: 'workspace',
        label: 'Open Workspace',
        icon: <Sparkles className="h-4 w-4" />,
        group: 'Navigation',
        onSelect: () => navigate(ROUTES.WORKSPACE),
      },
      {
        id: 'projects',
        label: 'View Projects',
        icon: <FolderKanban className="h-4 w-4" />,
        group: 'Navigation',
        onSelect: () => navigate(ROUTES.PROJECTS),
      },
      {
        id: 'search-page',
        label: 'Search page',
        icon: <Search className="h-4 w-4" />,
        group: 'Navigation',
        onSelect: () => navigate(ROUTES.SEARCH),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        group: 'Navigation',
        onSelect: () => navigate(ROUTES.SETTINGS),
      },
    ],
    [navigate],
  )

  const searchItems: CommandItem[] = useMemo(() => {
    if (!data?.results.length) return []
    return data.results.map((result) => {
      const Icon = searchIcons[result.category]
      return {
        id: result.id,
        label: result.title,
        description: result.subtitle ?? undefined,
        icon: <Icon className="h-4 w-4" />,
        group: 'Search results',
        onSelect: () => navigate(result.route),
        labelNode: highlightText(result.title, result.highlights),
      }
    })
  }, [data, navigate])

  const items = debouncedQuery.trim() ? searchItems : navigationItems

  return (
    <CommandPalette
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery('')
      }}
      items={items}
      query={query}
      onQueryChange={setQuery}
      isLoading={isFetching && Boolean(debouncedQuery.trim())}
      placeholder="Search projects, components, knowledge…"
    />
  )
}
