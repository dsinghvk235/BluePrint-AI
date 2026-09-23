import { Command } from 'cmdk'
import { Loader2, Search } from 'lucide-react'
import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog'
import { cn } from '@/shared/utils'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  onSelect: () => void
  group?: string
  labelNode?: React.ReactNode
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  placeholder?: string
  query?: string
  onQueryChange?: (query: string) => void
  isLoading?: boolean
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Search commands, pages, actions…',
  query,
  onQueryChange,
  isLoading,
}: CommandPaletteProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const item of items) {
      const group = item.group ?? 'Actions'
      const list = map.get(group) ?? []
      list.push(item)
      map.set(group, list)
    }
    return map
  }, [items])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search and navigate BlueprintAI</DialogDescription>
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
          shouldFilter={!onQueryChange}
        >
          <div className="border-border flex items-center border-b px-3">
            <Search className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
            <Command.Input
              placeholder={placeholder}
              value={query}
              onValueChange={onQueryChange}
              className="placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            />
            {isLoading && (
              <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
            )}
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="text-muted-foreground py-6 text-center text-sm">
              {isLoading ? 'Searching…' : 'No results found.'}
            </Command.Empty>
            {Array.from(groups.entries()).map(([group, groupItems]) => (
              <Command.Group key={group} heading={group}>
                {groupItems.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.description ?? ''}`}
                    onSelect={() => {
                      item.onSelect()
                      onOpenChange(false)
                    }}
                    className={cn(
                      'aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none select-none',
                    )}
                  >
                    {item.icon}
                    <div className="flex-1">
                      <span>{item.labelNode ?? item.label}</span>
                      {item.description && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {item.description}
                        </span>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd className="bg-muted text-muted-foreground pointer-events-none rounded px-1.5 py-0.5 text-[10px] font-medium">
                        {item.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
