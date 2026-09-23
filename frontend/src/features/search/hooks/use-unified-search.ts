import { useQuery } from '@tanstack/react-query'

import { searchApi } from '@/features/search/api/search-api'
import { queryKeys } from '@/shared/api/query-keys'
import { QUERY_STALE_TIME } from '@/shared/constants'

export function useUnifiedSearch(query: string, enabled = true) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: () => searchApi.search(trimmed),
    enabled: enabled && trimmed.length > 0,
    staleTime: QUERY_STALE_TIME.SHORT,
    placeholderData: (prev) => prev,
  })
}

export function useSearchHistory(limit = 8) {
  return useQuery({
    queryKey: [...queryKeys.search('history'), limit],
    queryFn: () => searchApi.history(limit),
    staleTime: QUERY_STALE_TIME.MEDIUM,
  })
}
