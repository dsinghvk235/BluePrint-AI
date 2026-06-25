package com.blueprintai.app.health;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.auth.api.AuthService;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.diagram.api.DiagramEngineService;
import com.blueprintai.export.api.ExportService;
import com.blueprintai.knowledge.api.KnowledgeService;
import com.blueprintai.learning.api.LearningEngineService;
import com.blueprintai.orchestrator.api.ArchitectureOrchestratorService;
import com.blueprintai.project.api.ProjectService;
import com.blueprintai.review.api.ReviewFeedbackService;
import com.blueprintai.search.api.SearchService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Health and module status endpoint for foundation verification. */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final AuthService authService;
    private final ProjectService projectService;
    private final AiGatewayService aiGatewayService;
    private final ArchitectureOrchestratorService orchestratorService;
    private final DiagramEngineService diagramEngineService;
    private final LearningEngineService learningEngineService;
    private final KnowledgeService knowledgeService;
    private final SearchService searchService;
    private final ExportService exportService;
    private final ReviewFeedbackService reviewFeedbackService;

    public HealthController(
            AuthService authService,
            ProjectService projectService,
            AiGatewayService aiGatewayService,
            ArchitectureOrchestratorService orchestratorService,
            DiagramEngineService diagramEngineService,
            LearningEngineService learningEngineService,
            KnowledgeService knowledgeService,
            SearchService searchService,
            ExportService exportService,
            ReviewFeedbackService reviewFeedbackService) {
        this.authService = authService;
        this.projectService = projectService;
        this.aiGatewayService = aiGatewayService;
        this.orchestratorService = orchestratorService;
        this.diagramEngineService = diagramEngineService;
        this.learningEngineService = learningEngineService;
        this.knowledgeService = knowledgeService;
        this.searchService = searchService;
        this.exportService = exportService;
        this.reviewFeedbackService = reviewFeedbackService;
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("status", "UP");
        payload.put("service", "blueprintai");
        payload.put("version", "0.0.1-SNAPSHOT");
        payload.put("modules", moduleStatus());
        return ApiResponse.success(payload);
    }

    private Map<String, Boolean> moduleStatus() {
        Map<String, Boolean> modules = new LinkedHashMap<>();
        modules.put(authService.getModuleName(), authService.isReady());
        modules.put(projectService.getModuleName(), projectService.isReady());
        modules.put(aiGatewayService.getModuleName(), aiGatewayService.isReady());
        modules.put(orchestratorService.getModuleName(), orchestratorService.isReady());
        modules.put(diagramEngineService.getModuleName(), diagramEngineService.isReady());
        modules.put(learningEngineService.getModuleName(), learningEngineService.isReady());
        modules.put(knowledgeService.getModuleName(), knowledgeService.isReady());
        modules.put(searchService.getModuleName(), searchService.isReady());
        modules.put(exportService.getModuleName(), exportService.isReady());
        modules.put(reviewFeedbackService.getModuleName(), reviewFeedbackService.isReady());
        return modules;
    }
}
