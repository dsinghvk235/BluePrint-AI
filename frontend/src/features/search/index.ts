export { searchApi, downloadProjectExport } from '@/features/search/api/search-api'
export type {
  ExportFormat,
  SearchCategory,
  SearchHistoryItem,
  SearchResultItem,
  UnifiedSearchResponse,
} from '@/features/search/api/search-api'
export { useSearchHistory, useUnifiedSearch } from '@/features/search/hooks/use-unified-search'
export { SearchPage } from '@/features/search/pages/SearchPage'
export { highlightText } from '@/features/search/utils/highlight'
