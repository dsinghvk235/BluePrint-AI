package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningMode;
import java.util.List;

public record ComponentKnowledgeResponse(
        String nodeId,
        String label,
        String category,
        String technology,
        String conceptId,
        LearningMode mode,
        List<LayerContent> layers,
        DecisionLogEntry decisionLog,
        DependencyGraph dependencies,
        String source,
        boolean cached) {}
