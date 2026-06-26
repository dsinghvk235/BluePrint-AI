package com.blueprintai.aigateway.api.dto;

import com.blueprintai.aigateway.api.AiProviderType;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.UUID;

/** Normalized AI completion response — provider details are internal only. */
public record AiCompletionResponse(
        String content,
        JsonNode parsedJson,
        boolean fromCache,
        int tokensInput,
        int tokensOutput,
        long latencyMs,
        BigDecimal costUsd,
        UUID requestId,
        AiProviderType providerUsed,
        String modelUsed) {}
