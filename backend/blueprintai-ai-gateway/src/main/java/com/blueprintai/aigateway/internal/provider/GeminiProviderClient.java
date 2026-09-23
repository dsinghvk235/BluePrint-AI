package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class GeminiProviderClient extends AbstractHttpProviderClient {

    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash");

    public GeminiProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(AiProviderType.GEMINI, properties, restClientBuilder, objectMapper);
    }

    @Override
    public ProviderCompletionResult complete(ProviderCompletionRequest request) {
        Set<String> models = new LinkedHashSet<>();
        models.add(resolveModel(request.taskType()));
        models.addAll(FALLBACK_MODELS);

        RuntimeException lastError = null;
        for (String model : models) {
            try {
                return completeWithModel(request, model);
            } catch (RuntimeException e) {
                lastError = e;
                if (!isTransientModelError(e)) {
                    throw e;
                }
                log.warn("Gemini model {} unavailable, trying next model: {}", model, shorten(e.getMessage()));
            }
        }
        throw lastError != null ? lastError : new IllegalStateException("All Gemini models failed");
    }

    @Override
    protected String resolveBaseUrl() {
        String baseUrl = config().getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            return "https://generativelanguage.googleapis.com/v1beta";
        }
        String normalized = baseUrl.trim().replaceAll("/+$", "");
        if (normalized.endsWith("/v1beta") || normalized.endsWith("/v1")) {
            return normalized;
        }
        return normalized + "/v1beta";
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        String model = config().getDefaultModel();
        return model.isBlank() ? "gemini-2.5-flash" : model;
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

        ObjectNode generationConfig = body.putObject("generationConfig");
        generationConfig.put("temperature", 0.2);
        if (jsonMode) {
            generationConfig.put("responseMimeType", "application/json");
        }
        return body;
    }

    @Override
    protected HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", config().getApiKey());
        return headers;
    }

    @Override
    protected String buildUrl(String baseUrl) {
        return buildUrlForModel(baseUrl, resolveModel(AiTaskType.ARCHITECTURE_GENERATION));
    }

    private String buildUrlForModel(String baseUrl, String model) {
        return baseUrl + "/models/" + model + ":generateContent";
    }

    private ProviderCompletionResult completeWithModel(ProviderCompletionRequest request, String model) {
        long start = System.currentTimeMillis();
        String url = buildUrlForModel(resolveBaseUrl(), model);
        ObjectNode body = buildRequestBody(
                request.systemPrompt(), request.userPrompt(), request.taskType(), request.jsonMode());

        JsonNode response;
        try {
            response = restClient
                    .post()
                    .uri(url)
                    .headers(h -> h.addAll(buildHeaders()))
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException e) {
            throw new IllegalStateException(e.getResponseBodyAsString(), e);
        }

        long latency = System.currentTimeMillis() - start;
        int inputTokens = extractInputTokens(response);
        int outputTokens = extractOutputTokens(response);
        return new ProviderCompletionResult(
                extractContent(response),
                model,
                inputTokens,
                outputTokens,
                latency,
                calculateCost(inputTokens, outputTokens));
    }

    @Override
    protected String extractContent(JsonNode response) {
        JsonNode error = response.path("error");
        if (!error.isMissingNode()) {
            String message = error.path("message").asText("Gemini API error");
            throw new IllegalStateException(message);
        }
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

    private boolean isTransientModelError(RuntimeException error) {
        String message = error.getMessage();
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase();
        return lower.contains("429")
                || lower.contains("quota")
                || lower.contains("503")
                || lower.contains("high demand")
                || lower.contains("resource_exhausted")
                || lower.contains("unavailable")
                || lower.contains("not found for api version");
    }

    private String shorten(String message) {
        if (message == null) {
            return "";
        }
        return message.length() > 160 ? message.substring(0, 160) + "…" : message;
    }
}
