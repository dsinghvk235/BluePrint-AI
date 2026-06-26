package com.blueprintai.orchestrator.internal.generator;

import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.orchestrator.api.ArchitectureSection;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;

/** Base class for specialized architecture generators. */
public abstract class ArchitectureGenerator {

    protected final AiGatewayService aiGateway;
    protected final ObjectMapper objectMapper;

    protected ArchitectureGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        this.aiGateway = aiGateway;
        this.objectMapper = objectMapper;
    }

    public abstract ArchitectureSection section();

    public abstract String promptId();

    public abstract String promptVersion();

    public abstract String generatorName();

    protected abstract JsonNode schema();

    public JsonNode generate(GenerationContext context) {
        Map<String, String> variables = Map.of(
                "systemDescription", context.systemDescription(),
                "systemType", context.systemType() != null ? context.systemType() : "general",
                "context", context.accumulatedContext());

        AiCompletionRequest request = AiCompletionRequest.builder()
                .taskType(AiTaskType.ARCHITECTURE_GENERATION)
                .promptId(promptId())
                .promptVersion(promptVersion())
                .generatorName(generatorName())
                .variables(variables)
                .userId(context.userId())
                .projectId(context.projectId())
                .correlationId(context.correlationId())
                .useCache(context.useCache())
                .build();

        AiCompletionResponse response = aiGateway.completeJson(request, schema());
        return response.parsedJson();
    }

    public record GenerationContext(
            String systemDescription,
            String systemType,
            String accumulatedContext,
            UUID userId,
            UUID projectId,
            UUID correlationId,
            boolean useCache) {}
}
