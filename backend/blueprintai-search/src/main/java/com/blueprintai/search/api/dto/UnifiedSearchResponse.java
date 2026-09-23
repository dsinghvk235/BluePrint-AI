package com.blueprintai.search.api.dto;

import java.util.List;

public record UnifiedSearchResponse(
        String query,
        List<SearchResultItem> results,
        int totalCount,
        int page,
        int size,
        long tookMs) {}
