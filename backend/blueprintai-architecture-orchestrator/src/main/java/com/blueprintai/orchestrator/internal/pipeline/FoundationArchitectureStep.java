package com.blueprintai.orchestrator.internal.pipeline;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.orchestrator.internal.generator.SystemDesignEnricher;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FoundationArchitectureStep implements GenerationPipelineStep {

    private static final String PROMPT_ID = "architecture-foundation";
    private static final String PROMPT_VERSION = "2.0.0";
    private static final String GENERATOR_NAME = "architecture-foundation-generator";

    private final AiGatewayService aiGateway;
    private final ObjectMapper objectMapper;

    public FoundationArchitectureStep(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        this.aiGateway = aiGateway;
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
        String systemType = context.systemType() != null ? context.systemType() : "general";
        String domainGuidance = SystemDesignEnricher.domainGuidance(context.systemDescription(), systemType);

        AiCompletionRequest request = AiCompletionRequest.builder()
                .taskType(AiTaskType.ARCHITECTURE_GENERATION)
                .promptId(PROMPT_ID)
                .promptVersion(PROMPT_VERSION)
                .generatorName(GENERATOR_NAME)
                .variables(Map.of(
                        "systemDescription", context.systemDescription(),
                        "systemType", systemType,
                        "domainGuidance", domainGuidance,
                        "context", context.accumulatedContext()))
                .userId(context.userId())
                .projectId(context.projectId())
                .correlationId(context.correlationId())
                .useCache(context.useCache())
                .build();

        AiCompletionResponse response = aiGateway.completeJson(request, foundationSchema());
        JsonNode result = response.parsedJson();
        mergeFoundation(context.payload(), result);
        context.appendContext("foundation", result.toString());
        context.recordVersion(GENERATOR_NAME, PROMPT_VERSION);
    }

    private void mergeFoundation(ObjectNode payload, JsonNode result) {
        if (result.has("requirements")) {
            payload.set("requirements", result.get("requirements"));
        }
        if (result.has("functionalRequirements")) {
            payload.set("functionalRequirements", result.get("functionalRequirements"));
        }
        if (result.has("nonFunctionalRequirements")) {
            payload.set("nonFunctionalRequirements", result.get("nonFunctionalRequirements"));
        }
        if (result.has("assumptions")) {
            payload.set("assumptions", result.get("assumptions"));
        }
        if (result.has("highLevelDesign")) {
            payload.set("highLevelDesign", result.get("highLevelDesign"));
        }
    }

    private JsonNode foundationSchema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required")
                .add("requirements")
                .add("functionalRequirements")
                .add("nonFunctionalRequirements")
                .add("assumptions")
                .add("highLevelDesign");
        return schema;
    }
}
