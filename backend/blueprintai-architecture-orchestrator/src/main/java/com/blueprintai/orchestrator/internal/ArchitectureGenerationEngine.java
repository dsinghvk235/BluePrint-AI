package com.blueprintai.orchestrator.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.orchestrator.internal.entity.ArchitectureGeneration;
import com.blueprintai.orchestrator.internal.pipeline.GenerationPipeline;
import com.blueprintai.orchestrator.internal.pipeline.GenerationPipelineContext;
import com.blueprintai.orchestrator.internal.pipeline.GenerationPipelineStep;
import com.blueprintai.orchestrator.internal.repository.ArchitectureGenerationRepository;
import com.blueprintai.orchestrator.api.GenerationStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ArchitectureGenerationEngine {

    private static final Logger log = LoggerFactory.getLogger(ArchitectureGenerationEngine.class);

    private final ArchitectureGenerationRepository generationRepository;
    private final GenerationPipeline generationPipeline;
    private final ObjectMapper objectMapper;

    public ArchitectureGenerationEngine(
            ArchitectureGenerationRepository generationRepository,
            GenerationPipeline generationPipeline,
            ObjectMapper objectMapper) {
        this.generationRepository = generationRepository;
        this.generationPipeline = generationPipeline;
        this.objectMapper = objectMapper;
    }

    public void executeGeneration(UUID generationId, boolean useCache) {
        ArchitectureGeneration generation;
        try {
            generation = generationRepository
                    .findById(generationId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Generation not found"));
        } catch (Exception e) {
            log.error("Could not load generation {} to start execution", generationId, e);
            markFailed(generationId, e.getMessage() != null ? e.getMessage() : "Generation not found");
            return;
        }

        generation.setStatus(GenerationStatus.IN_PROGRESS);
        generation.setStartedAt(Instant.now());
        generationRepository.save(generation);

        ObjectNode payload = objectMapper.createObjectNode();
        GenerationPipelineContext context = new GenerationPipelineContext(generation, payload, useCache);
        var steps = generationPipeline.steps();
        int total = steps.size();

        try {
            for (int i = 0; i < total; i++) {
                GenerationPipelineStep step = steps.get(i);
                generation.setCurrentStep(step.stepName());
                generation.setProgressPercent((i * 100) / total);
                generationRepository.save(generation);

                step.execute(context);

                generation.setArchitecturePayload(payload);
                generationRepository.save(generation);
            }

            ObjectNode metadata = payload.putObject("metadata");
            metadata.put("schemaVersion", "2.0");
            metadata.put("generatedAt", Instant.now().toString());
            metadata.put("systemDescription", generation.getSystemDescription());
            metadata.put("systemType", generation.getSystemType() != null ? generation.getSystemType() : "");
            metadata.put("pipelineVersion", "2.0.0");
            metadata.put("aiCallCount", 2);
            ObjectNode versions = metadata.putObject("generatorVersions");
            context.generatorVersions().forEach(versions::put);

            generation.setArchitecturePayload(payload);
            generation.setStatus(GenerationStatus.COMPLETED);
            generation.setProgressPercent(100);
            generation.setCurrentStep("completed");
            generation.setCompletedAt(Instant.now());
            generation.setUpdatedAt(Instant.now());
            generationRepository.save(generation);

        } catch (Exception e) {
            log.error("Architecture generation failed for {}", generationId, e);
            markFailed(generationId, e.getMessage());
        }
    }

    public void applySection(ObjectNode payload, com.blueprintai.orchestrator.api.ArchitectureSection section, com.fasterxml.jackson.databind.JsonNode result) {
        switch (section) {
            case REQUIREMENTS -> payload.set("requirements", result);
            case FUNCTIONAL_REQUIREMENTS -> payload.set("functionalRequirements", result.get("functionalRequirements"));
            case NON_FUNCTIONAL_REQUIREMENTS -> payload.set("nonFunctionalRequirements", result.get("nonFunctionalRequirements"));
            case ASSUMPTIONS -> payload.set("assumptions", result);
            case HIGH_LEVEL_DESIGN -> payload.set("highLevelDesign", result);
            case LOW_LEVEL_DESIGN -> payload.set("lowLevelDesign", result);
            case DATABASE_SCHEMA -> payload.set("databaseSchema", result);
            case APIS -> payload.set("apis", result);
            case SECURITY -> payload.set("security", result);
            case DEPLOYMENT -> payload.set("deployment", result);
            case SCALING -> payload.set("scaling", result);
            case DIAGRAM -> payload.set("diagram", result);
        }
    }

    private void markFailed(UUID generationId, String errorMessage) {
        generationRepository.findById(generationId).ifPresent(generation -> {
            generation.setStatus(GenerationStatus.FAILED);
            generation.setErrorMessage(errorMessage);
            generation.setCompletedAt(Instant.now());
            generation.setUpdatedAt(Instant.now());
            generationRepository.save(generation);
        });
    }
}
