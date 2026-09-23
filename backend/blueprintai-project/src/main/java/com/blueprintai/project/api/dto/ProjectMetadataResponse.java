package com.blueprintai.project.api.dto;

import com.blueprintai.project.api.ProjectStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Extended project metadata for detail views and version-history preparation. */
public record ProjectMetadataResponse(
        UUID id,
        UUID ownerId,
        String name,
        int currentVersion,
        ProjectStatus status,
        String theme,
        Instant createdAt,
        Instant updatedAt,
        Instant lastOpened,
        boolean favorite,
        boolean pinned,
        int exportCount,
        String lastAiModel,
        String lastAiProvider,
        String lastPromptVersion,
        FeedbackSummary feedbackSummary) {}
