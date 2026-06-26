package com.blueprintai.orchestrator.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GenerateArchitectureRequest(
        @NotNull UUID projectId,
        @NotBlank String systemDescription,
        String systemType,
        boolean useCache) {}
