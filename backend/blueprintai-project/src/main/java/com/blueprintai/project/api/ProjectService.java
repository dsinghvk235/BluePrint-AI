package com.blueprintai.project.api;

import com.blueprintai.common.response.PaginatedResponse;
import com.blueprintai.project.api.dto.CreateProjectRequest;
import com.blueprintai.project.api.dto.ProjectQueryParams;
import com.blueprintai.project.api.dto.ProjectResponse;
import com.blueprintai.project.api.dto.RenameProjectRequest;
import com.blueprintai.project.api.dto.UpdateProjectRequest;
import java.util.List;
import java.util.UUID;

/** Project module public contract. */
public interface ProjectService {

    String getModuleName();

    boolean isReady();

    ProjectResponse createProject(CreateProjectRequest request, UUID ownerId);

    ProjectResponse getProject(UUID projectId, UUID ownerId);

    ProjectResponse openProject(UUID projectId, UUID ownerId);

    ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request, UUID ownerId);

    ProjectResponse renameProject(UUID projectId, RenameProjectRequest request, UUID ownerId);

    ProjectResponse archiveProject(UUID projectId, UUID ownerId);

    ProjectResponse duplicateProject(UUID projectId, UUID ownerId);

    void deleteProject(UUID projectId, UUID ownerId);

    PaginatedResponse<ProjectResponse> listProjects(ProjectQueryParams query, UUID ownerId);

    List<ProjectResponse> getRecentProjects(int limit, UUID ownerId);

    ProjectResponse togglePin(UUID projectId, UUID ownerId);

    void recordExport(UUID projectId, UUID ownerId);
}
