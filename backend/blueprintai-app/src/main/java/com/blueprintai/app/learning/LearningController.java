package com.blueprintai.app.learning;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.knowledge.api.KnowledgeService;
import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.blueprintai.knowledge.api.dto.KnowledgeConceptSummary;
import com.blueprintai.learning.api.LearningEngineService;
import com.blueprintai.learning.api.LearningLayer;
import com.blueprintai.learning.api.LearningMode;
import com.blueprintai.learning.api.dto.ArchitectureOverviewResponse;
import com.blueprintai.learning.api.dto.ComponentKnowledgeResponse;
import com.blueprintai.learning.api.dto.DecisionLogEntry;
import com.blueprintai.learning.api.dto.DependencyGraph;
import com.blueprintai.learning.api.dto.GetComponentKnowledgeRequest;
import com.blueprintai.learning.api.dto.MentorChatBody;
import com.blueprintai.learning.api.dto.MentorChatRequest;
import com.blueprintai.learning.api.dto.MentorChatResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LearningController {

    private final LearningEngineService learningEngineService;
    private final KnowledgeService knowledgeService;
    private final CurrentUserProvider currentUserProvider;

    public LearningController(
            LearningEngineService learningEngineService,
            KnowledgeService knowledgeService,
            CurrentUserProvider currentUserProvider) {
        this.learningEngineService = learningEngineService;
        this.knowledgeService = knowledgeService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/projects/{projectId}/learning/nodes/{nodeId}")
    public ApiResponse<ComponentKnowledgeResponse> getComponentKnowledge(
            @PathVariable UUID projectId,
            @PathVariable String nodeId,
            @RequestParam(defaultValue = "INTERMEDIATE") LearningMode mode,
            @RequestParam(required = false) String layer,
            @RequestParam(defaultValue = "true") boolean useCache) {
        LearningLayer learningLayer = layer != null ? LearningLayer.fromId(layer) : null;
        GetComponentKnowledgeRequest request = new GetComponentKnowledgeRequest(
                projectId, nodeId, mode, learningLayer, useCache);
        return ApiResponse.success(learningEngineService.getComponentKnowledge(
                request, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/projects/{projectId}/learning/overview")
    public ApiResponse<ArchitectureOverviewResponse> getArchitectureOverview(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "INTERMEDIATE") LearningMode mode) {
        return ApiResponse.success(learningEngineService.getArchitectureOverview(
                projectId, mode, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/projects/{projectId}/learning/decisions")
    public ApiResponse<List<DecisionLogEntry>> getDecisionLogs(
            @PathVariable UUID projectId, @RequestParam(required = false) String nodeId) {
        return ApiResponse.success(learningEngineService.getDecisionLogs(
                projectId, nodeId, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/projects/{projectId}/learning/dependencies/{nodeId}")
    public ApiResponse<DependencyGraph> getDependencies(
            @PathVariable UUID projectId, @PathVariable String nodeId) {
        return ApiResponse.success(learningEngineService.getDependencies(
                projectId, nodeId, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping("/projects/{projectId}/learning/mentor")
    public ApiResponse<MentorChatResponse> mentorChat(
            @PathVariable UUID projectId, @Valid @RequestBody MentorChatBody body) {
        MentorChatRequest request = new MentorChatRequest(
                projectId,
                body.nodeId(),
                body.mode(),
                body.message(),
                body.history(),
                body.useCache());
        return ApiResponse.success(learningEngineService.mentorChat(
                request, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/knowledge/concepts")
    public ApiResponse<List<KnowledgeConceptSummary>> listConcepts(
            @RequestParam(required = false) String category, @RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return ApiResponse.success(knowledgeService.searchConcepts(q));
        }
        if (category != null && !category.isBlank()) {
            return ApiResponse.success(knowledgeService.listConceptsByCategory(category));
        }
        return ApiResponse.success(knowledgeService.listConcepts());
    }

    @GetMapping("/knowledge/concepts/{conceptId}")
    public ApiResponse<KnowledgeConcept> getConcept(@PathVariable String conceptId) {
        return ApiResponse.success(knowledgeService
                .getConcept(conceptId)
                .orElseThrow(() -> new com.blueprintai.common.exception.BusinessException(
                        com.blueprintai.common.exception.ErrorCode.RESOURCE_NOT_FOUND, "Concept not found")));
    }

    @GetMapping("/knowledge/concepts/{conceptId}/related")
    public ApiResponse<List<KnowledgeConceptSummary>> getRelatedConcepts(@PathVariable String conceptId) {
        return ApiResponse.success(knowledgeService.getRelatedConcepts(conceptId));
    }
}
