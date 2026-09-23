package com.blueprintai.orchestrator.internal.pipeline;

import com.blueprintai.orchestrator.internal.entity.ArchitectureGeneration;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/** Mutable state passed through the generation pipeline. */
public class GenerationPipelineContext {

    private final ArchitectureGeneration generation;
    private final ObjectNode payload;
    private final boolean useCache;
    private final StringBuilder accumulatedContext = new StringBuilder();
    private final Map<String, String> generatorVersions = new HashMap<>();

    public GenerationPipelineContext(ArchitectureGeneration generation, ObjectNode payload, boolean useCache) {
        this.generation = generation;
        this.payload = payload;
        this.useCache = useCache;
    }

    public ArchitectureGeneration generation() {
        return generation;
    }

    public ObjectNode payload() {
        return payload;
    }

    public boolean useCache() {
        return useCache;
    }

    public String systemDescription() {
        return generation.getSystemDescription();
    }

    public String systemType() {
        return generation.getSystemType();
    }

    public UUID userId() {
        return generation.getUserId();
    }

    public UUID projectId() {
        return generation.getProjectId();
    }

    public UUID correlationId() {
        return generation.getCorrelationId();
    }

    public String accumulatedContext() {
        return accumulatedContext.toString();
    }

    public void appendContext(String label, String content) {
        accumulatedContext.append("\n").append(label).append(": ").append(content);
    }

    public void recordVersion(String generatorName, String version) {
        generatorVersions.put(generatorName, version);
    }

    public Map<String, String> generatorVersions() {
        return generatorVersions;
    }
}
