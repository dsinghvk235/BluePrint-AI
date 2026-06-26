package com.blueprintai.app.ai;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.dto.ProviderHealthResponse;
import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.orchestrator.api.ArchitectureOrchestratorService;
import com.blueprintai.orchestrator.api.dto.ArchitectureModel;
import com.blueprintai.orchestrator.api.dto.ContinueConversationRequest;
import com.blueprintai.orchestrator.api.dto.ContinueConversationResponse;
import com.blueprintai.orchestrator.api.dto.GenerateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.GenerationStatusResponse;
import com.blueprintai.orchestrator.api.dto.RegenerateSectionRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final ArchitectureOrchestratorService orchestratorService;
    private final AiGatewayService aiGatewayService;
    private final CurrentUserProvider currentUserProvider;

    public AiController(
            ArchitectureOrchestratorService orchestratorService,
            AiGatewayService aiGatewayService,
            CurrentUserProvider currentUserProvider) {
        this.orchestratorService = orchestratorService;
        this.aiGatewayService = aiGatewayService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/architecture/generate")
    public ResponseEntity<ApiResponse<GenerationStatusResponse>> generateArchitecture(
            @Valid @RequestBody GenerateArchitectureRequest request) {
        GenerationStatusResponse status = orchestratorService.startGeneration(
                request, currentUserProvider.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success(status, "Architecture generation started"));
    }

    @GetMapping("/architecture/generations/{generationId}")
    public ApiResponse<GenerationStatusResponse> getGenerationStatus(@PathVariable UUID generationId) {
        return ApiResponse.success(orchestratorService.getGenerationStatus(
                generationId, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping("/architecture/regenerate")
    public ApiResponse<ArchitectureModel> regenerateSection(@Valid @RequestBody RegenerateSectionRequest request) {
        return ApiResponse.success(orchestratorService.regenerateSection(
                request, currentUserProvider.getCurrentUserId()));
    }

    @PostMapping("/architecture/validate")
    public ApiResponse<ValidateArchitectureResponse> validateArchitecture(
            @Valid @RequestBody ValidateArchitectureRequest request) {
        return ApiResponse.success(orchestratorService.validateArchitecture(request));
    }

    @PostMapping("/architecture/conversation")
    public ApiResponse<ContinueConversationResponse> continueConversation(
            @Valid @RequestBody ContinueConversationRequest request) {
        return ApiResponse.success(orchestratorService.continueConversation(
                request, currentUserProvider.getCurrentUserId()));
    }

    @GetMapping("/providers/health")
    public ApiResponse<ProviderHealthResponse> providerHealth() {
        return ApiResponse.success(aiGatewayService.getProviderHealth());
    }
}
