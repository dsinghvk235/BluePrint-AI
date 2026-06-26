package com.blueprintai.orchestrator.api;

import com.blueprintai.orchestrator.api.dto.ArchitectureModel;
import com.blueprintai.orchestrator.api.dto.ContinueConversationRequest;
import com.blueprintai.orchestrator.api.dto.ContinueConversationResponse;
import com.blueprintai.orchestrator.api.dto.GenerateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.GenerationStatusResponse;
import com.blueprintai.orchestrator.api.dto.RegenerateSectionRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureResponse;
import java.util.UUID;

/** Coordinates specialized architecture generators into a unified model. */
public interface ArchitectureOrchestratorService {

    String getModuleName();

    boolean isReady();

    GenerationStatusResponse startGeneration(GenerateArchitectureRequest request, UUID userId);

    GenerationStatusResponse getGenerationStatus(UUID generationId, UUID userId);

    ArchitectureModel regenerateSection(RegenerateSectionRequest request, UUID userId);

    ValidateArchitectureResponse validateArchitecture(ValidateArchitectureRequest request);

    ContinueConversationResponse continueConversation(ContinueConversationRequest request, UUID userId);
}
