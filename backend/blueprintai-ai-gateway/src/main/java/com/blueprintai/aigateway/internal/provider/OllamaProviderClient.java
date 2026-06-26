package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Future-ready stub for local Ollama models. */
@Component
public class OllamaProviderClient extends OpenAiProviderClient {

    public OllamaProviderClient(
            AiGatewayProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        super(properties, restClientBuilder, objectMapper);
    }

    @Override
    public AiProviderType getProviderType() {
        return AiProviderType.OLLAMA;
    }

    @Override
    protected String resolveBaseUrl() {
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(AiProviderType.OLLAMA);
        if (config == null || config.getBaseUrl().isBlank()) {
            return "http://localhost:11434/v1";
        }
        return config.getBaseUrl();
    }

    @Override
    protected String resolveModel(AiTaskType taskType) {
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(AiProviderType.OLLAMA);
        if (config == null || config.getDefaultModel().isBlank()) {
            return "llama3.2";
        }
        return config.getDefaultModel();
    }

    @Override
    public boolean isAvailable() {
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(AiProviderType.OLLAMA);
        return config != null && config.isEnabled();
    }
}
