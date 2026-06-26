package com.blueprintai.orchestrator.api.dto;

import com.blueprintai.orchestrator.api.ArchitectureSection;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegenerateSectionRequest(
        @NotNull UUID projectId,
        @NotNull UUID generationId,
        @NotNull ArchitectureSection section,
        String additionalContext) {}
