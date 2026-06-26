package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import java.math.BigDecimal;

/** Provider-agnostic contract — business modules never call SDKs directly. */
public interface AiProviderClient {

    AiProviderType getProviderType();

    boolean isAvailable();

    ProviderCompletionResult complete(ProviderCompletionRequest request);

    record ProviderCompletionRequest(
            String systemPrompt,
            String userPrompt,
            AiTaskType taskType,
            boolean jsonMode) {}

    record ProviderCompletionResult(
            String content,
            String model,
            int tokensInput,
            int tokensOutput,
            long latencyMs,
            BigDecimal costUsd) {}
}
