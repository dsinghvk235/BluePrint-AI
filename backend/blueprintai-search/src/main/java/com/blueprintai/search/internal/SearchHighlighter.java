package com.blueprintai.search.internal;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

final class SearchHighlighter {

    private SearchHighlighter() {}

    static List<String> highlight(String text, String query) {
        if (text == null || query == null || query.isBlank()) {
            return List.of();
        }
        String lowerText = text.toLowerCase(Locale.ROOT);
        String lowerQuery = query.trim().toLowerCase(Locale.ROOT);
        List<String> spans = new ArrayList<>();
        int index = lowerText.indexOf(lowerQuery);
        while (index >= 0) {
            spans.add(text.substring(index, index + lowerQuery.length()));
            index = lowerText.indexOf(lowerQuery, index + lowerQuery.length());
        }
        return spans;
    }

    static double scoreText(String text, String query) {
        if (text == null || query == null || query.isBlank()) {
            return 0;
        }
        String normalized = text.toLowerCase(Locale.ROOT);
        String q = query.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals(q)) {
            return 5;
        }
        if (normalized.startsWith(q)) {
            return 4;
        }
        if (normalized.contains(q)) {
            return 2;
        }
        return 0;
    }
}
