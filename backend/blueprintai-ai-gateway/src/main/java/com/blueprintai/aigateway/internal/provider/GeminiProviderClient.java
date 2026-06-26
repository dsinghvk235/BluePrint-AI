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
public class GeminiProviderClient extends AbstractHttpProviderClient {

    public GeminiProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(AiProviderType.GEMINI, properties, restClientBuilder, objectMapper);
    }

    @Override
    protected String resolveBaseUrl() {
        String baseUrl = config().getBaseUrl();
        return baseUrl.isBlank() ? "https://generativelanguage.googleapis.com/v1beta" : baseUrl;
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        String model = config().getDefaultModel();
        return model.isBlank() ? "gemini-2.0-flash" : model;
    }

    @Override
    protected ObjectNode buildRequestBody(
            String systemPrompt, String userPrompt, AiTaskType taskType, boolean jsonMode) {
        ObjectNode body = objectMapper.createObjectNode();
        ArrayNode contents = body.putArray("contents");
        ObjectNode userContent = contents.addObject();
        userContent.putArray("parts").addObject().put("text", userPrompt);
        ObjectNode systemInstruction = body.putObject("systemInstruction");
        systemInstruction.putArray("parts").addObject().put("text", systemPrompt);
        if (jsonMode) {
            ObjectNode generationConfig = body.putObject("generationConfig");
            generationConfig.put("responseMimeType", "application/json");
        }
        body.putObject("generationConfig").put("temperature", 0.2);
        return body;
    }

    @Override
    protected HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Override
    protected String buildUrl(String baseUrl) {
        return baseUrl + "/models/" + resolveModel(AiTaskType.ARCHITECTURE_GENERATION) + ":generateContent?key="
                + config().getApiKey();
    }

    @Override
    protected String extractContent(JsonNode response) {
        JsonNode candidates = response.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                return parts.get(0).path("text").asText("");
            }
        }
        return "";
    }

    @Override
    protected String extractModel(JsonNode response) {
        return resolveModel(AiTaskType.ARCHITECTURE_GENERATION);
    }

    @Override
    protected int extractInputTokens(JsonNode response) {
        return response.path("usageMetadata").path("promptTokenCount").asInt(0);
    }

    @Override
    protected int extractOutputTokens(JsonNode response) {
        return response.path("usageMetadata").path("candidatesTokenCount").asInt(0);
    }

    @Override
    protected String completionPath() {
        return "";
    }
}
