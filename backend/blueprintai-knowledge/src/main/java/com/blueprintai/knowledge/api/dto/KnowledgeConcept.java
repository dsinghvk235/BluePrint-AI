package com.blueprintai.knowledge.api.dto;

import java.util.List;

/** Structured engineering knowledge entry — extensible without code changes. */
public record KnowledgeConcept(
        String id,
        String name,
        String category,
        List<String> aliases,
        String overview,
        String purpose,
        List<String> engineeringPrinciples,
        List<String> designPatterns,
        List<String> solidPrinciples,
        List<String> advantages,
        List<String> disadvantages,
        List<String> tradeoffs,
        List<Alternative> alternatives,
        List<String> realWorldExamples,
        List<String> commonMistakes,
        List<String> interviewQuestions,
        List<String> relatedConcepts,
        List<String> references) {

    public record Alternative(String name, String description, String whenToUse) {}
}
