package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

abstract class AbstractHttpProviderClient implements AiProviderClient {

    protected final Logger log = LoggerFactory.getLogger(getClass());
    protected final AiProviderType providerType;
    protected final AiGatewayProperties properties;
    protected final ObjectMapper objectMapper;
    protected final RestClient restClient;

    protected AbstractHttpProviderClient(
            AiProviderType providerType,
            AiGatewayProperties properties,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper) {
        this.providerType = providerType;
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public AiProviderType getProviderType() {
        return providerType;
    }

    @Override
    public boolean isAvailable() {
        AiGatewayProperties.ProviderConfig config = config();
        return config != null && config.isConfigured() && (config.hasApiKey() || providerType == AiProviderType.OLLAMA);
    }

    @Override
    public ProviderCompletionResult complete(ProviderCompletionRequest request) {
        long start = System.currentTimeMillis();
        String url = buildUrl(resolveBaseUrl());
        ObjectNode body = buildRequestBody(
                request.systemPrompt(), request.userPrompt(), request.taskType(), request.jsonMode());

        JsonNode response = restClient
                .post()
                .uri(url)
                .headers(h -> h.addAll(buildHeaders()))
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        long latency = System.currentTimeMillis() - start;
        int inputTokens = extractInputTokens(response);
        int outputTokens = extractOutputTokens(response);
        return new ProviderCompletionResult(
                extractContent(response),
                extractModel(response),
                inputTokens,
                outputTokens,
                latency,
                calculateCost(inputTokens, outputTokens));
    }

    private BigDecimal calculateCost(int inputTokens, int outputTokens) {
        AiGatewayProperties.ProviderConfig cfg = config();
        if (cfg == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal inputCost = cfg.getInputCostPer1kTokens()
                .multiply(BigDecimal.valueOf(inputTokens))
                .divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
        BigDecimal outputCost = cfg.getOutputCostPer1kTokens()
                .multiply(BigDecimal.valueOf(outputTokens))
                .divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
        return inputCost.add(outputCost);
    }

    protected AiGatewayProperties.ProviderConfig config() {
        return properties.getProviders().get(providerType);
    }

    protected String buildUrl(String baseUrl) {
        String path = completionPath();
        if (path == null || path.isBlank()) {
            return baseUrl;
        }
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) + path : baseUrl + path;
    }

    protected abstract String resolveBaseUrl();

    protected abstract String resolveModel(AiTaskType taskType);

    protected abstract ObjectNode buildRequestBody(
            String systemPrompt, String userPrompt, AiTaskType taskType, boolean jsonMode);

    protected abstract HttpHeaders buildHeaders();

    protected abstract String extractContent(JsonNode response);

    protected abstract String extractModel(JsonNode response);

    protected abstract int extractInputTokens(JsonNode response);

    protected abstract int extractOutputTokens(JsonNode response);

    protected abstract String completionPath();
}
