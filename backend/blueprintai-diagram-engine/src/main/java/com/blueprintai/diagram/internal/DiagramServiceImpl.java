package com.blueprintai.diagram.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.diagram.api.DiagramService;
import com.blueprintai.diagram.api.dto.DiagramResponse;
import com.blueprintai.diagram.api.dto.SaveDiagramRequest;
import com.blueprintai.diagram.internal.entity.Diagram;
import com.blueprintai.diagram.internal.repository.DiagramRepository;
import com.blueprintai.project.api.ProjectService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DiagramServiceImpl implements DiagramService {

    private static final String MODULE_NAME = "diagram-engine";
    private static final String EMPTY_CANVAS = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    private final DiagramRepository diagramRepository;
    private final ProjectService projectService;
    private final ObjectMapper objectMapper;

    public DiagramServiceImpl(
            DiagramRepository diagramRepository, ProjectService projectService, ObjectMapper objectMapper) {
        this.diagramRepository = diagramRepository;
        this.projectService = projectService;
        this.objectMapper = objectMapper;
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
    @Transactional(readOnly = true)
    public DiagramResponse getDiagramByProject(UUID projectId, UUID ownerId) {
        projectService.getProject(projectId, ownerId);
        return diagramRepository
                .findByProjectId(projectId)
                .map(this::toResponse)
                .orElse(emptyDiagramResponse(projectId));
    }

    @Override
    @Transactional
    public DiagramResponse saveDiagram(UUID projectId, SaveDiagramRequest request, UUID ownerId) {
        projectService.getProject(projectId, ownerId);

        Diagram diagram = diagramRepository
                .findByProjectId(projectId)
                .orElseGet(() -> {
                    Diagram created = new Diagram();
                    created.setProjectId(projectId);
                    created.setName("Main Diagram");
                    return created;
                });

        if (request.expectedVersion() != null && request.expectedVersion() != diagram.getVersion()) {
            throw new BusinessException(
                    ErrorCode.CONFLICT,
                    "Diagram version conflict. Expected version "
                            + request.expectedVersion()
                            + " but current is "
                            + diagram.getVersion());
        }

        diagram.setCanvasData(toJsonString(request.canvasData()));
        if (request.versionMetadata() != null) {
            diagram.setVersionMetadata(toJsonString(request.versionMetadata()));
        }
        diagram.setVersion(diagram.getVersion() + 1);

        return toResponse(diagramRepository.save(diagram));
    }

    private DiagramResponse emptyDiagramResponse(UUID projectId) {
        return new DiagramResponse(
                null,
                projectId,
                "Main Diagram",
                0,
                parseJson(EMPTY_CANVAS),
                parseJson("{\"source\":\"empty\"}"),
                null,
                null);
    }

    private DiagramResponse toResponse(Diagram diagram) {
        return new DiagramResponse(
                diagram.getId(),
                diagram.getProjectId(),
                diagram.getName(),
                diagram.getVersion(),
                parseJson(diagram.getCanvasData()),
                parseJson(diagram.getVersionMetadata()),
                diagram.getCreatedAt(),
                diagram.getUpdatedAt());
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json != null ? json : "{}");
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to parse diagram JSON", ex);
        }
    }

    private String toJsonString(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to serialize diagram JSON", ex);
        }
    }
}
