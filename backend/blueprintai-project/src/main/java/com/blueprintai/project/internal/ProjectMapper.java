package com.blueprintai.project.internal;

import com.blueprintai.project.api.dto.ProjectResponse;
import com.blueprintai.project.internal.entity.Project;
import java.util.List;

public final class ProjectMapper {

    private ProjectMapper() {}

    public static ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getOwnerId(),
                project.getName(),
                project.getDescription(),
                project.getSystemType(),
                project.getPrompt(),
                project.getCurrentVersion(),
                project.getStatus(),
                project.getTheme(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                project.getLastOpened(),
                List.copyOf(project.getTags()),
                project.isFavorite(),
                project.isArchived());
    }
}
