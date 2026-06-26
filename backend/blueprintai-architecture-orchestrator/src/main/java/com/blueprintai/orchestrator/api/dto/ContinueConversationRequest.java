package com.blueprintai.orchestrator.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ContinueConversationRequest(
        @NotNull UUID projectId,
        UUID generationId,
        @NotBlank String message) {}
