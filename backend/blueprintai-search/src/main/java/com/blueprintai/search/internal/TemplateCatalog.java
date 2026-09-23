package com.blueprintai.search.internal;

import com.blueprintai.search.api.dto.SearchCategory;
import com.blueprintai.search.api.dto.SearchResultItem;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Curated architecture templates for instant search suggestions. */
final class TemplateCatalog {

    private static final List<TemplateEntry> TEMPLATES = List.of(
            new TemplateEntry("netflix", "Netflix Streaming Platform", "Video streaming at scale", "Media"),
            new TemplateEntry("uber", "Uber Ride Matching", "Real-time ride dispatch system", "Mobility"),
            new TemplateEntry("whatsapp", "WhatsApp Messaging", "Global messaging at billions of users", "Messaging"),
            new TemplateEntry("instagram", "Instagram Social Feed", "Photo sharing and social graph", "Social"),
            new TemplateEntry("banking", "Digital Banking Core", "Secure banking and payments platform", "Finance"),
            new TemplateEntry("ecommerce", "E-commerce Platform", "Catalog, cart, checkout, and fulfillment", "Retail"));

    private TemplateCatalog() {}

    static List<SearchResultItem> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String normalized = query.trim().toLowerCase(Locale.ROOT);
        List<SearchResultItem> hits = new ArrayList<>();
        for (TemplateEntry template : TEMPLATES) {
            double score = scoreTemplate(template, normalized);
            if (score > 0) {
                hits.add(new SearchResultItem(
                        "template:" + template.id(),
                        SearchCategory.TEMPLATE,
                        template.name(),
                        template.category(),
                        template.description(),
                        "/projects?template=" + template.id(),
                        score,
                        SearchHighlighter.highlight(template.name(), query),
                        java.util.Map.of("templateId", template.id())));
            }
        }
        return hits;
    }

    private static double scoreTemplate(TemplateEntry template, String query) {
        double score = 0;
        if (template.id().contains(query)) {
            score += 3;
        }
        if (template.name().toLowerCase(Locale.ROOT).contains(query)) {
            score += 2;
        }
        if (template.description().toLowerCase(Locale.ROOT).contains(query)) {
            score += 1;
        }
        if (template.category().toLowerCase(Locale.ROOT).contains(query)) {
            score += 0.5;
        }
        return score;
    }

    private record TemplateEntry(String id, String name, String description, String category) {}
}
