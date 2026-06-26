package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OpenAiProviderClient extends AbstractHttpProviderClient {

    public OpenAiProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(AiProviderType.OPENAI, properties, restClientBuilder, objectMapper);
    }

    @Override
    protected String resolveBaseUrl() {
        String baseUrl = config().getBaseUrl();
        return baseUrl.isBlank() ? "https://api.openai.com/v1" : baseUrl;
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        String model = config().getDefaultModel();
        return model.isBlank() ? "gpt-4o-mini" : model;
    }

    @Override
    protected ObjectNode buildRequestBody(
            String systemPrompt, String userPrompt, AiTaskType taskType, boolean jsonMode) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", resolveModel(taskType));
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", systemPrompt);
        messages.addObject().put("role", "user").put("content", userPrompt);
        if (jsonMode) {
            ObjectNode responseFormat = body.putObject("response_format");
            responseFormat.put("type", "json_object");
        }
        body.put("temperature", 0.2);
        return body;
    }

    @Override
    protected HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(config().getApiKey());
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
