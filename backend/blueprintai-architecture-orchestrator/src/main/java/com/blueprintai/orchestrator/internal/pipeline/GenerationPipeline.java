package com.blueprintai.orchestrator.internal.pipeline;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GenerationPipeline {

    private final List<GenerationPipelineStep> steps;

    public GenerationPipeline(
            FoundationArchitectureStep foundationStep,
            TechnicalArchitectureStep technicalStep,
            DiagramLayoutStep diagramStep) {
        this.steps = List.of(foundationStep, technicalStep, diagramStep);
    }

    public List<GenerationPipelineStep> steps() {
        return steps;
    }
}
