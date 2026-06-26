package com.blueprintai.orchestrator.internal;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.common.logging.CorrelationIdFilter;
import com.blueprintai.orchestrator.api.ArchitectureOrchestratorService;
import com.blueprintai.orchestrator.api.ArchitectureSection;
import com.blueprintai.orchestrator.api.GenerationStatus;
import com.blueprintai.orchestrator.api.dto.ArchitectureModel;
import com.blueprintai.orchestrator.api.dto.ContinueConversationRequest;
import com.blueprintai.orchestrator.api.dto.ContinueConversationResponse;
import com.blueprintai.orchestrator.api.dto.GenerateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.GenerationStatusResponse;
import com.blueprintai.orchestrator.api.dto.RegenerateSectionRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureResponse;
import com.blueprintai.orchestrator.internal.entity.ArchitectureGeneration;
import com.blueprintai.orchestrator.internal.generator.ArchitectureGenerator;
import com.blueprintai.orchestrator.internal.generator.GeneratorLookup;
import com.blueprintai.orchestrator.internal.repository.ArchitectureGenerationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArchitectureOrchestratorServiceImpl implements ArchitectureOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(ArchitectureOrchestratorServiceImpl.class);
    private static final String MODULE_NAME = "architecture-orchestrator";

    private final AiGatewayService aiGatewayService;
    private final GeneratorLookup generatorLookup;
    private final ArchitectureGenerationRepository generationRepository;
    private final ArchitectureValidator architectureValidator;
    private final ObjectMapper objectMapper;
    private final ArchitectureGenerationRunner generationRunner;
    private final ArchitectureGenerationEngine generationEngine;

    public ArchitectureOrchestratorServiceImpl(
            AiGatewayService aiGatewayService,
            GeneratorLookup generatorLookup,
            ArchitectureGenerationRepository generationRepository,
            ArchitectureValidator architectureValidator,
            ObjectMapper objectMapper,
            ArchitectureGenerationRunner generationRunner,
            ArchitectureGenerationEngine generationEngine) {
        this.aiGatewayService = aiGatewayService;
        this.generatorLookup = generatorLookup;
        this.generationRepository = generationRepository;
        this.architectureValidator = architectureValidator;
        this.objectMapper = objectMapper;
        this.generationRunner = generationRunner;
        this.generationEngine = generationEngine;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return aiGatewayService.isReady();
    }

    @Override
    @Transactional
    public GenerationStatusResponse startGeneration(GenerateArchitectureRequest request, UUID userId) {
        UUID correlationId = resolveCorrelationId();

        ArchitectureGeneration generation = new ArchitectureGeneration();
        generation.setProjectId(request.projectId());
        generation.setUserId(userId);
        generation.setCorrelationId(correlationId);
        generation.setStatus(GenerationStatus.PENDING);
        generation.setSystemDescription(request.systemDescription());
        generation.setSystemType(request.systemType());
        generation.setProgressPercent(0);
        generation.setCurrentStep("initializing");
        generation = generationRepository.save(generation);

        generationRunner.runGeneration(generation.getId(), request.useCache());

        return toStatusResponse(generation, null);
    }

    @Override
    @Transactional(readOnly = true)
    public GenerationStatusResponse getGenerationStatus(UUID generationId, UUID userId) {
        ArchitectureGeneration generation = findOwnedGeneration(generationId, userId);
        ArchitectureModel model = generation.getArchitecturePayload() != null
                ? ArchitectureModelMapper.fromGeneration(generation, objectMapper)
                : null;
        return toStatusResponse(generation, model);
    }

    @Override
    @Transactional
    public ArchitectureModel regenerateSection(RegenerateSectionRequest request, UUID userId) {
        ArchitectureGeneration generation = findOwnedGeneration(request.generationId(), userId);
        ArchitectureGenerator generator = generatorLookup.get(request.section());

        String context = generation.getArchitecturePayload() != null
                ? generation.getArchitecturePayload().toString()
                : "";
        if (request.additionalContext() != null) {
            context = context + "\n" + request.additionalContext();
        }

        ArchitectureGenerator.GenerationContext genContext = new ArchitectureGenerator.GenerationContext(
                generation.getSystemDescription(),
                generation.getSystemType(),
                context,
                userId,
                request.projectId(),
                generation.getCorrelationId(),
                false);

        JsonNode sectionResult = generator.generate(genContext);
        ObjectNode payload = generation.getArchitecturePayload() != null
                ? (ObjectNode) generation.getArchitecturePayload().deepCopy()
                : objectMapper.createObjectNode();
        generationEngine.applySection(payload, request.section(), sectionResult);
        generation.setArchitecturePayload(payload);
        generation.setUpdatedAt(Instant.now());
        generationRepository.save(generation);

        return ArchitectureModelMapper.fromGeneration(generation, objectMapper);
    }

    @Override
    public ValidateArchitectureResponse validateArchitecture(ValidateArchitectureRequest request) {
        return architectureValidator.validate(request);
    }

    @Override
    @Transactional
    public ContinueConversationResponse continueConversation(ContinueConversationRequest request, UUID userId) {
        UUID correlationId = resolveCorrelationId();
        String context = "";
        if (request.generationId() != null) {
            ArchitectureGeneration generation = findOwnedGeneration(request.generationId(), userId);
            if (generation.getArchitecturePayload() != null) {
                context = generation.getArchitecturePayload().toString();
            }
        }

        AiCompletionRequest aiRequest = AiCompletionRequest.builder()
                .taskType(AiTaskType.CHAT)
                .promptId("architecture-chat")
                .promptVersion("1.0.0")
                .generatorName("architecture-chat")
                .variables(Map.of("context", context, "message", request.message()))
                .userId(userId)
                .projectId(request.projectId())
                .correlationId(correlationId)
                .useCache(false)
                .build();

        AiCompletionResponse response = aiGatewayService.complete(aiRequest);
        return new ContinueConversationResponse(UUID.randomUUID(), response.content(), correlationId);
    }

    private ArchitectureGeneration findOwnedGeneration(UUID generationId, UUID userId) {
        return generationRepository
                .findById(generationId)
                .filter(g -> g.getUserId().equals(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Generation not found"));
    }

    private GenerationStatusResponse toStatusResponse(ArchitectureGeneration generation, ArchitectureModel model) {
        return new GenerationStatusResponse(
                generation.getId(),
                generation.getProjectId(),
                generation.getStatus(),
                generation.getCurrentStep(),
                generation.getProgressPercent(),
                model,
                generation.getErrorMessage(),
                generation.getStartedAt(),
                generation.getCompletedAt());
    }

    private UUID resolveCorrelationId() {
        String mdcId = MDC.get(CorrelationIdFilter.MDC_KEY);
        if (mdcId != null) {
            try {
                return UUID.fromString(mdcId);
            } catch (IllegalArgumentException ignored) {
                return UUID.randomUUID();
            }
        }
        return UUID.randomUUID();
    }
}
