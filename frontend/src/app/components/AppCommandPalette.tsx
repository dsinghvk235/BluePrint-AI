import { useNavigate } from 'react-router-dom'
import { FolderKanban, LayoutDashboard, Search, Settings, Sparkles } from 'lucide-react'

import { ROUTES } from '@/shared/constants'
import { CommandPalette, type CommandItem } from '@/shared/ui'

interface AppCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppCommandPalette({ open, onOpenChange }: AppCommandPaletteProps) {
  const navigate = useNavigate()

  const items: CommandItem[] = [
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
      id: 'search',
      label: 'Search',
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
  ]

  return <CommandPalette open={open} onOpenChange={onOpenChange} items={items} />
}
