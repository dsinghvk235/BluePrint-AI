package com.blueprintai.project.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.common.response.PaginatedResponse;
import com.blueprintai.project.api.ProjectService;
import com.blueprintai.project.api.ProjectStatus;
import com.blueprintai.project.api.dto.CreateProjectRequest;
import com.blueprintai.project.api.dto.ProjectQueryParams;
import com.blueprintai.project.api.dto.ProjectResponse;
import com.blueprintai.project.api.dto.RenameProjectRequest;
import com.blueprintai.project.api.dto.UpdateProjectRequest;
import com.blueprintai.project.internal.entity.Project;
import com.blueprintai.project.internal.repository.ProjectRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectServiceImpl implements ProjectService {

    private static final String MODULE_NAME = "project";
    private static final int MAX_PAGE_SIZE = 100;

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return true;
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, UUID ownerId) {
        Project project = new Project();
        project.setOwnerId(ownerId);
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setSystemType(request.systemType());
        project.setPrompt(request.prompt());
        project.setTheme(request.theme());
        project.setTags(request.tags());
        project.setStatus(ProjectStatus.DRAFT);
        project.setCurrentVersion(1);

        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId, UUID ownerId) {
        return ProjectMapper.toResponse(findOwnedProject(projectId, ownerId));
    }

    @Override
    @Transactional
    public ProjectResponse openProject(UUID projectId, UUID ownerId) {
        Project project = findOwnedProject(projectId, ownerId);
        project.setLastOpened(Instant.now());
        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request, UUID ownerId) {
        Project project = findOwnedProject(projectId, ownerId);

        if (request.name() != null) {
            project.setName(request.name().trim());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }
        if (request.systemType() != null) {
            project.setSystemType(request.systemType());
        }
        if (request.prompt() != null) {
            project.setPrompt(request.prompt());
        }
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        if (request.theme() != null) {
            project.setTheme(request.theme());
        }
        if (request.tags() != null) {
            project.setTags(request.tags());
        }
        if (request.favorite() != null) {
            project.setFavorite(request.favorite());
        }

        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public ProjectResponse renameProject(UUID projectId, RenameProjectRequest request, UUID ownerId) {
        Project project = findOwnedProject(projectId, ownerId);
        project.setName(request.name().trim());
        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public ProjectResponse archiveProject(UUID projectId, UUID ownerId) {
        Project project = findOwnedProject(projectId, ownerId);
        project.setArchived(true);
        project.setStatus(ProjectStatus.ARCHIVED);
        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public ProjectResponse duplicateProject(UUID projectId, UUID ownerId) {
        Project source = findOwnedProject(projectId, ownerId);

        Project duplicate = new Project();
        duplicate.setOwnerId(ownerId);
        duplicate.setName(source.getName() + " (Copy)");
        duplicate.setDescription(source.getDescription());
        duplicate.setSystemType(source.getSystemType());
        duplicate.setPrompt(source.getPrompt());
        duplicate.setTheme(source.getTheme());
        duplicate.setTags(source.getTags());
        duplicate.setStatus(ProjectStatus.DRAFT);
        duplicate.setCurrentVersion(1);

        return ProjectMapper.toResponse(projectRepository.save(duplicate));
    }

    @Override
    @Transactional
    public void deleteProject(UUID projectId, UUID ownerId) {
        Project project = findOwnedProject(projectId, ownerId);
        projectRepository.delete(project);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProjectResponse> listProjects(ProjectQueryParams query, UUID ownerId) {
        int page = Math.max(query.page(), 0);
        int size = Math.min(Math.max(query.size(), 1), MAX_PAGE_SIZE);
        Sort sort = resolveSort(query.sortBy(), query.sortDirection());
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Project> spec = ProjectSpecifications.combine(
                ownerId, query.search(), query.status(), query.favorite(), query.archived());

        Page<Project> result = projectRepository.findAll(spec, pageable);
        List<ProjectResponse> items = result.getContent().stream().map(ProjectMapper::toResponse).toList();

        return new PaginatedResponse<>(
                items, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getRecentProjects(int limit, UUID ownerId) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        Pageable pageable = PageRequest.of(0, safeLimit);
        return projectRepository.findRecentByOwnerId(ownerId, pageable).stream()
                .map(ProjectMapper::toResponse)
                .toList();
    }

    private Project findOwnedProject(UUID projectId, UUID ownerId) {
        return projectRepository
                .findByIdAndOwnerId(projectId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Project not found"));
    }

    private Sort resolveSort(String sortBy, String sortDirection) {
        String property = switch (sortBy != null ? sortBy : "updatedAt") {
            case "name" -> "name";
            case "createdAt" -> "createdAt";
            case "lastOpened" -> "lastOpened";
            default -> "updatedAt";
        };
        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }
}
