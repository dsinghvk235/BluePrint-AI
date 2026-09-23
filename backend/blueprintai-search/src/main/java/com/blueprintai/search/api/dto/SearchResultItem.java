package com.blueprintai.search.api.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** A single unified search hit with optional highlight spans. */
public record SearchResultItem(
        String id,
        SearchCategory category,
        String title,
        String subtitle,
        String description,
        String route,
        double score,
        List<String> highlights,
        Map<String, String> metadata) {

    public static SearchResultItem of(
            String id,
            SearchCategory category,
            String title,
            String subtitle,
            String route,
            double score,
            List<String> highlights) {
        return new SearchResultItem(id, category, title, subtitle, null, route, score, highlights, Map.of());
    }

    public static SearchResultItem project(UUID projectId, String name, String subtitle, double score, List<String> highlights) {
        return of(
                projectId.toString(),
                SearchCategory.PROJECT,
                name,
                subtitle,
                "/workspace/" + projectId,
                score,
                highlights);
    }
}
