package com.blueprintai.project.api.dto;

import com.blueprintai.project.api.ProjectStatus;

public record ProjectQueryParams(
        String search,
        ProjectStatus status,
        Boolean favorite,
        Boolean archived,
        String sortBy,
        String sortDirection,
        int page,
        int size) {

    public static ProjectQueryParams defaults() {
        return new ProjectQueryParams(null, null, null, false, "updatedAt", "desc", 0, 20);
    }
}
