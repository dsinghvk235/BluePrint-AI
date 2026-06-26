package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningMode;
import java.util.List;

public record ArchitectureOverviewResponse(
        String projectSummary,
        LearningMode mode,
        List<ComponentSummary> components,
        List<String> keyDecisions,
        List<String> suggestedExplorations) {

    public record ComponentSummary(String nodeId, String label, String category, String role) {}
}
