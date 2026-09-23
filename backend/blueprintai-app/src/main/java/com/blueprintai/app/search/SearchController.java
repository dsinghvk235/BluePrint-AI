package com.blueprintai.app.search;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.search.api.SearchService;
import com.blueprintai.search.api.dto.SearchHistoryItem;
import com.blueprintai.search.api.dto.UnifiedSearchResponse;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;
    private final CurrentUserProvider currentUserProvider;

    public SearchController(SearchService searchService, CurrentUserProvider currentUserProvider) {
        this.searchService = searchService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ApiResponse<UnifiedSearchResponse> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "true") boolean record) {
        var userId = currentUserProvider.getCurrentUserId();
        UnifiedSearchResponse response = searchService.search(q, userId, page, size);
        if (record && q != null && !q.isBlank()) {
            searchService.recordSearch(userId, q, response.totalCount());
        }
        return ApiResponse.success(response);
    }

    @GetMapping("/history")
    public ApiResponse<List<SearchHistoryItem>> history(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(searchService.getRecentSearches(currentUserProvider.getCurrentUserId(), limit));
    }

    @DeleteMapping("/history")
    public ApiResponse<Void> clearHistory() {
        searchService.clearSearchHistory(currentUserProvider.getCurrentUserId());
        return ApiResponse.success(null, "Search history cleared");
    }
}
