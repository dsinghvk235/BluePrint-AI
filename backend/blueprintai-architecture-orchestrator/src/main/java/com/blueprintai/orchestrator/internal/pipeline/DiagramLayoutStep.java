package com.blueprintai.orchestrator.internal.pipeline;

import com.blueprintai.orchestrator.api.ArchitectureSection;
import com.blueprintai.orchestrator.internal.generator.DiagramFromHighLevelDesignBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

/** Deterministic diagram synthesis from high-level design — zero AI calls. */
@Component
public class DiagramLayoutStep implements GenerationPipelineStep {

    private static final String GENERATOR_NAME = "diagram-layout-builder";
    private static final String PROMPT_VERSION = "2.0.0";

    private final ObjectMapper objectMapper;

    public DiagramLayoutStep(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String stepName() {
        return GENERATOR_NAME;
    }

    @Override
    public String promptVersion() {
        return PROMPT_VERSION;
    }

    @Override
    public void execute(GenerationPipelineContext context) {
        ObjectNode diagram =
                DiagramFromHighLevelDesignBuilder.build(context.payload().get("highLevelDesign"), objectMapper);
        context.payload().set("diagram", diagram);
        context.recordVersion(GENERATOR_NAME, PROMPT_VERSION);
        context.appendContext(ArchitectureSection.DIAGRAM.name(), diagram.toString());
    }
}
