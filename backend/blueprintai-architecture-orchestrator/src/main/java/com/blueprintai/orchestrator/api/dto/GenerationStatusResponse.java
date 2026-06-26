package com.blueprintai.orchestrator.api.dto;

import com.blueprintai.orchestrator.api.GenerationStatus;
import java.time.Instant;
import java.util.UUID;

public record GenerationStatusResponse(
        UUID generationId,
        UUID projectId,
        GenerationStatus status,
        String currentStep,
        int progressPercent,
        ArchitectureModel architecture,
        String errorMessage,
        Instant startedAt,
        Instant completedAt) {}
