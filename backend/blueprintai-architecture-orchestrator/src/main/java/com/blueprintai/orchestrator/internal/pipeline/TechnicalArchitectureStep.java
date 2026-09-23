package com.blueprintai.orchestrator.internal.pipeline;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class TechnicalArchitectureStep implements GenerationPipelineStep {

    private static final String PROMPT_ID = "architecture-technical";
    private static final String PROMPT_VERSION = "2.0.0";
    private static final String GENERATOR_NAME = "architecture-technical-generator";

    private final AiGatewayService aiGateway;
    private final ObjectMapper objectMapper;

    public TechnicalArchitectureStep(AiGatewayService aiGateway, ObjectMapper objectMapper) {
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

        AiCompletionRequest request = AiCompletionRequest.builder()
                .taskType(AiTaskType.ARCHITECTURE_GENERATION)
                .promptId(PROMPT_ID)
                .promptVersion(PROMPT_VERSION)
                .generatorName(GENERATOR_NAME)
                .variables(Map.of(
                        "systemDescription", context.systemDescription(),
                        "systemType", systemType,
                        "context", context.accumulatedContext()))
                .userId(context.userId())
                .projectId(context.projectId())
                .correlationId(context.correlationId())
                .useCache(context.useCache())
                .build();

        AiCompletionResponse response = aiGateway.completeJson(request, technicalSchema());
        JsonNode result = response.parsedJson();
        mergeTechnical(context.payload(), result);
        context.appendContext("technical", result.toString());
        context.recordVersion(GENERATOR_NAME, PROMPT_VERSION);
    }

    private void mergeTechnical(ObjectNode payload, JsonNode result) {
        if (result.has("lowLevelDesign")) {
            payload.set("lowLevelDesign", result.get("lowLevelDesign"));
        }
        if (result.has("databaseSchema")) {
            payload.set("databaseSchema", result.get("databaseSchema"));
        }
        if (result.has("apis")) {
            payload.set("apis", result.get("apis"));
        }
        if (result.has("security")) {
            payload.set("security", result.get("security"));
        }
        if (result.has("deployment")) {
            payload.set("deployment", result.get("deployment"));
        }
        if (result.has("scaling")) {
            payload.set("scaling", result.get("scaling"));
        }
    }

    private JsonNode technicalSchema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required")
                .add("lowLevelDesign")
                .add("databaseSchema")
                .add("apis")
                .add("security")
                .add("deployment")
                .add("scaling");
        return schema;
    }
}
