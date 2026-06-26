package com.blueprintai.app.project;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.common.response.PaginatedResponse;
import com.blueprintai.project.api.ProjectService;
import com.blueprintai.project.api.ProjectStatus;
import com.blueprintai.project.api.dto.CreateProjectRequest;
import com.blueprintai.project.api.dto.ProjectQueryParams;
import com.blueprintai.project.api.dto.ProjectResponse;
import com.blueprintai.project.api.dto.RenameProjectRequest;
import com.blueprintai.project.api.dto.UpdateProjectRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final CurrentUserProvider currentUserProvider;

    public ProjectController(ProjectService projectService, CurrentUserProvider currentUserProvider) {
        this.projectService = projectService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ApiResponse<PaginatedResponse<ProjectResponse>> listProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(required = false, defaultValue = "false") Boolean archived,
            @RequestParam(required = false, defaultValue = "updatedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ProjectQueryParams query =
                new ProjectQueryParams(search, status, favorite, archived, sortBy, sortDirection, page, size);
        return ApiResponse.success(projectService.listProjects(query, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/recent")
    public ApiResponse<List<ProjectResponse>> recentProjects(
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.success(
                projectService.getRecentProjects(limit, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse project =
                projectService.createProject(request, currentUserProvider.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(project, "Project created"));
    }

    @GetMapping("/{projectId}")
    public ApiResponse<ProjectResponse> getProject(@PathVariable UUID projectId) {
        return ApiResponse.success(projectService.getProject(projectId, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping("/{projectId}/open")
    public ApiResponse<ProjectResponse> openProject(@PathVariable UUID projectId) {
        return ApiResponse.success(projectService.openProject(projectId, currentUserProvider.getCurrentUserId()));
    }

    @PutMapping("/{projectId}")
    public ApiResponse<ProjectResponse> updateProject(
            @PathVariable UUID projectId, @Valid @RequestBody UpdateProjectRequest request) {
        return ApiResponse.success(
                projectService.updateProject(projectId, request, currentUserProvider.getCurrentUserId()));
    }

    @PatchMapping("/{projectId}/rename")
    public ApiResponse<ProjectResponse> renameProject(
            @PathVariable UUID projectId, @Valid @RequestBody RenameProjectRequest request) {
        return ApiResponse.success(
                projectService.renameProject(projectId, request, currentUserProvider.getCurrentUserId()));
    }

    @PatchMapping("/{projectId}/archive")
    public ApiResponse<ProjectResponse> archiveProject(@PathVariable UUID projectId) {
        return ApiResponse.success(projectService.archiveProject(projectId, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping("/{projectId}/duplicate")
    public ResponseEntity<ApiResponse<ProjectResponse>> duplicateProject(@PathVariable UUID projectId) {
        ProjectResponse project =
                projectService.duplicateProject(projectId, currentUserProvider.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(project, "Project duplicated"));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID projectId) {
        projectService.deleteProject(projectId, currentUserProvider.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted"));
    }
}
