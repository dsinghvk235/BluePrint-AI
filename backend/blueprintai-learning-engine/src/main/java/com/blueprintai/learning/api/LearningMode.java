package com.blueprintai.learning.api;

/** Audience-specific explanation depth and tone. */
public enum LearningMode {
    BEGINNER,
    INTERMEDIATE,
    SDE_1,
    SENIOR_ENGINEER,
    STAFF_ENGINEER;

    public String displayName() {
        return switch (this) {
            case BEGINNER -> "Beginner";
            case INTERMEDIATE -> "Intermediate";
            case SDE_1 -> "SDE-1";
            case SENIOR_ENGINEER -> "Senior Engineer";
            case STAFF_ENGINEER -> "Staff Engineer";
        };
    }

    public String toneGuidance() {
        return switch (this) {
            case BEGINNER -> "Use simple language, analogies, and minimal jargon. Define every technical term.";
            case INTERMEDIATE -> "Assume basic CS knowledge. Explain trade-offs clearly with examples.";
            case SDE_1 -> "Interview-ready depth. Cover implementation details and common pitfalls.";
            case SENIOR_ENGINEER -> "Focus on trade-offs, scale, failure modes, and operational concerns.";
            case STAFF_ENGINEER -> "Strategic framing: org impact, evolution paths, cross-system implications.";
        };
    }
}
