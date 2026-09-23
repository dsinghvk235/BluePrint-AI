package com.blueprintai.knowledge.api.dto;

import java.util.List;

public record KnowledgeConceptSummary(
        String id, String name, String category, String overview, List<String> relatedConcepts) {}
