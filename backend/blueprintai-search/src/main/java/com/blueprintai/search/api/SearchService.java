package com.blueprintai.search.api;

import com.blueprintai.search.api.dto.SearchHistoryItem;
import com.blueprintai.search.api.dto.UnifiedSearchResponse;
import java.util.List;
import java.util.UUID;

/** Unified intelligent search across projects, components, knowledge, and templates. */
public interface SearchService {

    String getModuleName();

    boolean isReady();

    UnifiedSearchResponse search(String query, UUID userId, int page, int size);

    List<SearchHistoryItem> getRecentSearches(UUID userId, int limit);

    void recordSearch(UUID userId, String query, int resultCount);

    void clearSearchHistory(UUID userId);
}
