package com.blueprintai.project.api.dto;

import com.blueprintai.project.api.ProjectStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID ownerId,
        String name,
        String description,
        String systemType,
        String prompt,
        int currentVersion,
        ProjectStatus status,
        String theme,
        Instant createdAt,
        Instant updatedAt,
        Instant lastOpened,
        List<String> tags,
        boolean favorite,
        boolean archived) {}
