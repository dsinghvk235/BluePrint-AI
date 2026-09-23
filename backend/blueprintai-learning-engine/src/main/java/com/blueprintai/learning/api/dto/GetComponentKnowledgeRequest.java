package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningLayer;
import com.blueprintai.learning.api.LearningMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GetComponentKnowledgeRequest(
        @NotNull UUID projectId,
        @NotBlank String nodeId,
        @NotNull LearningMode mode,
        LearningLayer layer,
        boolean useCache) {}
