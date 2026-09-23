package com.blueprintai.app.diagram;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.diagram.api.DiagramService;
import com.blueprintai.diagram.api.dto.DiagramResponse;
import com.blueprintai.diagram.api.dto.SaveDiagramRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/diagram")
public class DiagramController {

    private final DiagramService diagramService;
    private final CurrentUserProvider currentUserProvider;

    public DiagramController(DiagramService diagramService, CurrentUserProvider currentUserProvider) {
        this.diagramService = diagramService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ApiResponse<DiagramResponse> getDiagram(@PathVariable UUID projectId) {
        return ApiResponse.success(diagramService.getDiagramByProject(
                projectId, currentUserProvider.getCurrentUserId()));
    }

    @PutMapping
    public ApiResponse<DiagramResponse> saveDiagram(
            @PathVariable UUID projectId, @Valid @RequestBody SaveDiagramRequest request) {
        return ApiResponse.success(diagramService.saveDiagram(
                projectId, request, currentUserProvider.getCurrentUserId()), "Diagram saved");
    }
}
