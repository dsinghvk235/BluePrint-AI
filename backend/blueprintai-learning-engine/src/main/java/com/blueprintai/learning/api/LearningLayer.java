package com.blueprintai.learning.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Progressive learning layers — revealed in order, never all at once. */
public enum LearningLayer {
    OVERVIEW("overview", "Overview", 1),
    PURPOSE("purpose", "Purpose", 2),
    REASONING("reasoning", "Reasoning", 3),
    PRINCIPLE("principle", "Engineering Principle", 4),
    TRADEOFFS("tradeoffs", "Trade-offs", 5),
    ALTERNATIVES("alternatives", "Alternatives", 6),
    BEST_PRACTICES("best-practices", "Best Practices", 7),
    INTERVIEW("interview", "Interview Questions", 8),
    ADVANCED("advanced", "Advanced Discussion", 9);

    private final String id;
    private final String label;
    private final int order;

    LearningLayer(String id, String label, int order) {
        this.id = id;
        this.label = label;
        this.order = order;
    }

    public String id() {
        return id;
    }

    @JsonValue
    public String toJson() {
        return id;
    }

    public String label() {
        return label;
    }

    public int order() {
        return order;
    }

    @JsonCreator
    public static LearningLayer fromId(String id) {
        if (id == null) {
            return OVERVIEW;
        }
        for (LearningLayer layer : values()) {
            if (layer.id.equalsIgnoreCase(id)) {
                return layer;
            }
        }
        return OVERVIEW;
    }
}
