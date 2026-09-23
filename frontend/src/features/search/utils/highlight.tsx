import type { ReactNode } from 'react'

/** Highlight query matches inside result titles. */
export function highlightText(text: string, highlights: string[]): ReactNode {
  if (!highlights.length) {
    return text
  }
  const pattern = new RegExp(`(${highlights.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, index) =>
    highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
      <mark key={`${part}-${index}`} className="bg-primary/20 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
