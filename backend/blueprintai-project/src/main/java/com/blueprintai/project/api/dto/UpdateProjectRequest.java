package com.blueprintai.project.api.dto;

import com.blueprintai.project.api.ProjectStatus;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProjectRequest(
        @Size(min = 1, max = 200) String name,
        @Size(max = 2000) String description,
        @Size(max = 100) String systemType,
        @Size(max = 5000) String prompt,
        ProjectStatus status,
        @Size(max = 50) String theme,
        List<@Size(max = 50) String> tags,
        Boolean favorite,
        Boolean pinned) {}
