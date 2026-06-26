package com.blueprintai.aigateway.api;

import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.aigateway.api.dto.ProviderHealthResponse;
import com.fasterxml.jackson.databind.JsonNode;

/** Single entry point for all AI requests across BlueprintAI. */
public interface AiGatewayService {

    String getModuleName();

    boolean isReady();

    AiCompletionResponse complete(AiCompletionRequest request);

    AiCompletionResponse completeJson(AiCompletionRequest request, JsonNode schema);

    ProviderHealthResponse getProviderHealth();
}
