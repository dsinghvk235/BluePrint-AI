package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ClaudeProviderClient extends AbstractHttpProviderClient {

    public ClaudeProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(AiProviderType.CLAUDE, properties, restClientBuilder, objectMapper);
    }

    @Override
    protected String resolveBaseUrl() {
        String baseUrl = config().getBaseUrl();
        return baseUrl.isBlank() ? "https://api.anthropic.com/v1" : baseUrl;
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        String model = config().getDefaultModel();
        return model.isBlank() ? "claude-3-5-haiku-20241022" : model;
    }

    @Override
    protected ObjectNode buildRequestBody(
            String systemPrompt, String userPrompt, AiTaskType taskType, boolean jsonMode) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", resolveModel(taskType));
        body.put("max_tokens", 8192);
        body.put("system", systemPrompt + (jsonMode ? "\nRespond with valid JSON only." : ""));
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", userPrompt);
        body.put("temperature", 0.2);
        return body;
    }

    @Override
    protected HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", config().getApiKey());
        headers.set("anthropic-version", "2023-06-01");
        return headers;
    }

    @Override
    protected String extractContent(JsonNode response) {
        JsonNode content = response.path("content");
        if (content.isArray() && !content.isEmpty()) {
            return content.get(0).path("text").asText("");
        }
        return "";
    }

    @Override
    protected String extractModel(JsonNode response) {
        return response.path("model").asText(resolveModel(AiTaskType.ARCHITECTURE_GENERATION));
    }

    @Override
    protected int extractInputTokens(JsonNode response) {
        return response.path("usage").path("input_tokens").asInt(0);
    }

    @Override
    protected int extractOutputTokens(JsonNode response) {
        return response.path("usage").path("output_tokens").asInt(0);
    }

    @Override
    protected String completionPath() {
        return "/messages";
    }
}
