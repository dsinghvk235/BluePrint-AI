package com.blueprintai.orchestrator.internal;

import java.util.UUID;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ArchitectureGenerationRunner {

    private final ArchitectureGenerationEngine generationEngine;

    public ArchitectureGenerationRunner(ArchitectureGenerationEngine generationEngine) {
        this.generationEngine = generationEngine;
    }

    @Async("generationTaskExecutor")
    public void runGeneration(UUID generationId, boolean useCache) {
        generationEngine.executeGeneration(generationId, useCache);
    }
}
