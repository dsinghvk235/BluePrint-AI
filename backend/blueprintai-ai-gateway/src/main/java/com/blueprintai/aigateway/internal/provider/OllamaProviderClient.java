package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Local Ollama via OpenAI-compatible /v1/chat/completions. */
@Component
public class OllamaProviderClient extends AbstractHttpProviderClient {

    private static final Duration REQUEST_TIMEOUT = Duration.ofMinutes(5);

    public OllamaProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(
                AiProviderType.OLLAMA,
                properties,
                restClientBuilder.requestFactory(ollamaRequestFactory()),
                objectMapper);
    }

    private static JdkClientHttpRequestFactory ollamaRequestFactory() {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(REQUEST_TIMEOUT);
        return requestFactory;
    }

    @Override
    public boolean isAvailable() {
        AiGatewayProperties.ProviderConfig config = config();
        if (config == null || !config.isConfigured()) {
            return false;
        }
        try {
            restClient
                    .get()
                    .uri(resolveBaseUrl().replace("/v1", "") + "/api/tags")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.debug("Ollama unavailable at {}: {}", resolveBaseUrl(), e.getMessage());
            return false;
        }
    }

    @Override
    protected String resolveBaseUrl() {
        String baseUrl = config().getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            return "http://localhost:11434/v1";
        }
        String normalized = baseUrl.trim().replaceAll("/+$", "");
        if (normalized.endsWith("/v1")) {
            return normalized;
        }
        return normalized + "/v1";
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        String model = config().getDefaultModel();
        return model.isBlank() ? "llama3.2" : model;
    }

    @Override
    protected ObjectNode buildRequestBody(
            String systemPrompt, String userPrompt, AiTaskType taskType, boolean jsonMode) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", resolveModel(taskType));
        body.put("stream", false);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", systemPrompt);
        messages.addObject().put("role", "user").put("content", userPrompt);
        if (jsonMode) {
            ObjectNode responseFormat = body.putObject("response_format");
            responseFormat.put("type", "json_object");
        }
        body.put("temperature", taskType == AiTaskType.ARCHITECTURE_GENERATION ? 0.25 : 0.2);
        if (taskType == AiTaskType.ARCHITECTURE_GENERATION) {
            body.put("num_predict", 16384);
        }
        return body;
    }

    @Override
    protected HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Override
    protected String extractContent(JsonNode response) {
        return response.path("choices").path(0).path("message").path("content").asText("");
    }

    @Override
    protected String extractModel(JsonNode response) {
        return response.path("model").asText(resolveModel(AiTaskType.ARCHITECTURE_GENERATION));
    }

    @Override
    protected int extractInputTokens(JsonNode response) {
        return response.path("usage").path("prompt_tokens").asInt(0);
    }

    @Override
    protected int extractOutputTokens(JsonNode response) {
        return response.path("usage").path("completion_tokens").asInt(0);
    }

    @Override
    protected String completionPath() {
        return "/chat/completions";
    }
}
