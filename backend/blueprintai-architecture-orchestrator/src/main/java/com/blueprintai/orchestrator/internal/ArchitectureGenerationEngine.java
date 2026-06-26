package com.blueprintai.orchestrator.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.orchestrator.api.ArchitectureSection;
import com.blueprintai.orchestrator.api.GenerationStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArchitectureGenerationEngine {

    private static final Logger log = LoggerFactory.getLogger(ArchitectureGenerationEngine.class);

    private final ArchitectureGenerationRepository generationRepository;
    private final GeneratorLookup generatorLookup;
    private final ObjectMapper objectMapper;

    public ArchitectureGenerationEngine(
            ArchitectureGenerationRepository generationRepository,
            GeneratorLookup generatorLookup,
            ObjectMapper objectMapper) {
        this.generationRepository = generationRepository;
        this.generatorLookup = generatorLookup;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void executeGeneration(UUID generationId, boolean useCache) {
        ArchitectureGeneration generation = generationRepository
                .findById(generationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Generation not found"));

        generation.setStatus(GenerationStatus.IN_PROGRESS);
        generation.setStartedAt(Instant.now());
        generationRepository.save(generation);

        ObjectNode payload = objectMapper.createObjectNode();
        Map<String, String> generatorVersions = new HashMap<>();
        StringBuilder accumulatedContext = new StringBuilder();
        List<ArchitectureGenerator> generators = generatorLookup.allInOrder();
        int total = generators.size();

        try {
            for (int i = 0; i < total; i++) {
                ArchitectureGenerator generator = generators.get(i);
                generation.setCurrentStep(generator.generatorName());
                generation.setProgressPercent((i * 100) / total);
                generationRepository.save(generation);

                ArchitectureGenerator.GenerationContext context = new ArchitectureGenerator.GenerationContext(
                        generation.getSystemDescription(),
                        generation.getSystemType(),
                        accumulatedContext.toString(),
                        generation.getUserId(),
                        generation.getProjectId(),
                        generation.getCorrelationId(),
                        useCache);

                JsonNode result = generator.generate(context);
                applySection(payload, generator.section(), result);
                generatorVersions.put(generator.generatorName(), generator.promptVersion());
                accumulatedContext.append("\n").append(generator.section()).append(": ").append(result);

                generation.setArchitecturePayload(payload);
                generationRepository.save(generation);
            }

            ObjectNode metadata = payload.putObject("metadata");
            metadata.put("schemaVersion", "1.0");
            metadata.put("generatedAt", Instant.now().toString());
            metadata.put("systemDescription", generation.getSystemDescription());
            metadata.put("systemType", generation.getSystemType() != null ? generation.getSystemType() : "");
            ObjectNode versions = metadata.putObject("generatorVersions");
            generatorVersions.forEach(versions::put);

            generation.setArchitecturePayload(payload);
            generation.setStatus(GenerationStatus.COMPLETED);
            generation.setProgressPercent(100);
            generation.setCurrentStep("completed");
            generation.setCompletedAt(Instant.now());
            generation.setUpdatedAt(Instant.now());
            generationRepository.save(generation);

        } catch (Exception e) {
            log.error("Architecture generation failed for {}", generationId, e);
            generation.setStatus(GenerationStatus.FAILED);
            generation.setErrorMessage(e.getMessage());
            generation.setCompletedAt(Instant.now());
            generation.setUpdatedAt(Instant.now());
            generationRepository.save(generation);
        }
    }

    public void applySection(ObjectNode payload, ArchitectureSection section, JsonNode result) {
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
}
