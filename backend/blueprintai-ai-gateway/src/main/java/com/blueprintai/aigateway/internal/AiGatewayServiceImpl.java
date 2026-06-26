package com.blueprintai.aigateway.internal;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.aigateway.api.dto.ProviderHealthResponse;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.blueprintai.aigateway.internal.analytics.UsageAnalyticsService;
import com.blueprintai.aigateway.internal.cache.AiCacheService;
import com.blueprintai.aigateway.internal.cache.AiResponseCache;
import com.blueprintai.aigateway.internal.logging.AiLogService;
import com.blueprintai.aigateway.internal.logging.PromptLogService;
import com.blueprintai.aigateway.internal.prompt.PromptManager;
import com.blueprintai.aigateway.internal.provider.AiProviderClient;
import com.blueprintai.aigateway.internal.provider.ProviderManager;
import com.blueprintai.aigateway.internal.routing.CircuitBreakerRegistry;
import com.blueprintai.aigateway.internal.routing.ProviderRouter;
import com.blueprintai.aigateway.internal.validation.JsonRepairService;
import com.blueprintai.aigateway.internal.validation.ResponseValidator;
import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.common.logging.CorrelationIdFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

@Service
public class AiGatewayServiceImpl implements AiGatewayService {

    private static final Logger log = LoggerFactory.getLogger(AiGatewayServiceImpl.class);
    private static final String MODULE_NAME = "ai-gateway";

    private final AiGatewayProperties properties;
    private final PromptManager promptManager;
    private final ProviderRouter providerRouter;
    private final ProviderManager providerManager;
    private final CircuitBreakerRegistry circuitBreaker;
    private final AiResponseCache cacheService;
    private final ResponseValidator responseValidator;
    private final JsonRepairService jsonRepairService;
    private final AiLogService aiLogService;
    private final UsageAnalyticsService usageAnalytics;
    private final ObjectMapper objectMapper;
    private final PromptLogService promptLogService;

    public AiGatewayServiceImpl(
            AiGatewayProperties properties,
            PromptManager promptManager,
            ProviderRouter providerRouter,
            ProviderManager providerManager,
            CircuitBreakerRegistry circuitBreaker,
            AiResponseCache cacheService,
            ResponseValidator responseValidator,
            JsonRepairService jsonRepairService,
            AiLogService aiLogService,
            UsageAnalyticsService usageAnalytics,
            ObjectMapper objectMapper,
            PromptLogService promptLogService) {
        this.properties = properties;
        this.promptManager = promptManager;
        this.providerRouter = providerRouter;
        this.providerManager = providerManager;
        this.circuitBreaker = circuitBreaker;
        this.cacheService = cacheService;
        this.responseValidator = responseValidator;
        this.jsonRepairService = jsonRepairService;
        this.aiLogService = aiLogService;
        this.usageAnalytics = usageAnalytics;
        this.objectMapper = objectMapper;
        this.promptLogService = promptLogService;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return properties.isEnabled() && !properties.getEnabledProviders().isEmpty();
    }

    @Override
    public AiCompletionResponse complete(AiCompletionRequest request) {
        return completeInternal(request, null);
    }

    @Override
    public AiCompletionResponse completeJson(AiCompletionRequest request, JsonNode schema) {
        return completeInternal(request, schema);
    }

    @Override
    public ProviderHealthResponse getProviderHealth() {
        List<ProviderHealthResponse.ProviderStatus> statuses = new ArrayList<>();
        boolean anyAvailable = false;
        for (AiProviderType type : AiProviderType.values()) {
            AiProviderClient client = providerManager.getClient(type);
            boolean available = client != null && client.isAvailable() && !circuitBreaker.isCircuitOpen(type);
            if (available) {
                anyAvailable = true;
            }
            statuses.add(new ProviderHealthResponse.ProviderStatus(
                    type,
                    available,
                    circuitBreaker.isOpen(type),
                    circuitBreaker.getAverageLatency(type),
                    circuitBreaker.getFailureCount(type),
                    circuitBreaker.getSuccessCount(type),
                    usageAnalytics.getQuotaUsagePercent(type)));
        }
        return new ProviderHealthResponse(statuses, anyAvailable);
    }

    private AiCompletionResponse completeInternal(AiCompletionRequest request, JsonNode schema) {
        if (!isReady()) {
            throw new BusinessException(ErrorCode.AI_PROVIDER_UNAVAILABLE, "No AI providers are configured");
        }

        UUID requestId = UUID.randomUUID();
        UUID correlationId = resolveCorrelationId(request.correlationId());

        PromptManager.RenderedPrompt rendered = resolvePrompt(request);
        promptLogService.logPrompt(correlationId, rendered, request.variables());

        String systemPrompt = request.systemPromptOverride() != null
                ? request.systemPromptOverride()
                : rendered.systemPrompt();
        String userPrompt = request.userPromptOverride() != null
                ? request.userPromptOverride()
                : rendered.userPrompt();

        String promptHash = cacheService.hashPrompt(systemPrompt, userPrompt, request.promptId(), request.promptVersion());

        if (request.useCache()) {
            Optional<AiCacheService.CachedResponse> cached = cacheService.get(promptHash);
            if (cached.isPresent()) {
                JsonNode parsed = responseValidator.parseJson(cached.get().parsedJson());
                return new AiCompletionResponse(
                        cached.get().content(),
                        parsed,
                        true,
                        0,
                        0,
                        0,
                        BigDecimal.ZERO,
                        requestId,
                        null,
                        null);
            }
        }

        List<AiProviderType> failedProviders = new ArrayList<>();
        int maxAttempts = Math.max(request.maxRetries(), properties.getMaxRetryAttempts());
        Exception lastError = null;

        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            List<AiProviderType> ranked = providerRouter.rankProviders(request.taskType(), failedProviders);
            if (ranked.isEmpty()) {
                break;
            }

            for (AiProviderType providerType : ranked) {
                AiProviderClient client = providerManager.getClient(providerType);
                try {
                    boolean jsonMode = schema != null;
                    AiProviderClient.ProviderCompletionResult result = client.complete(
                            new AiProviderClient.ProviderCompletionRequest(systemPrompt, userPrompt, request.taskType(), jsonMode));

                    JsonNode parsedJson = null;
                    if (jsonMode) {
                        parsedJson = jsonRepairService.repair(result.content());
                        if (parsedJson == null) {
                            throw new BusinessException(ErrorCode.AI_VALIDATION_FAILED, "Failed to parse JSON response");
                        }
                        ResponseValidator.ValidationResult validation = responseValidator.validate(parsedJson, schema);
                        if (!validation.valid()) {
                            parsedJson = retryJsonRepair(result.content(), schema, request, correlationId, attempt);
                        }
                    }

                    circuitBreaker.recordSuccess(providerType, result.latencyMs());
                    usageAnalytics.recordUsage(
                            providerType, result.tokensInput(), result.tokensOutput(), result.latencyMs(), result.costUsd());
                    aiLogService.logSuccess(
                            requestId, request, providerType, result.model(),
                            result.tokensInput(), result.tokensOutput(), result.latencyMs(), result.costUsd(), promptHash);

                    if (request.useCache()) {
                        cacheService.put(
                                promptHash,
                                new AiCacheService.CachedResponse(
                                        result.content(),
                                        parsedJson != null ? parsedJson.toString() : result.content()),
                                request.taskType());
                    }

                    return new AiCompletionResponse(
                            result.content(),
                            parsedJson,
                            false,
                            result.tokensInput(),
                            result.tokensOutput(),
                            result.latencyMs(),
                            result.costUsd(),
                            requestId,
                            providerType,
                            result.model());

                } catch (Exception e) {
                    lastError = e;
                    log.warn("Provider {} failed for request {}: {}", providerType, requestId, e.getMessage());
                    circuitBreaker.recordFailure(providerType);
                    failedProviders.add(providerType);
                    aiLogService.logFailure(requestId, request, providerType, null, e.getMessage(), promptHash);
                    sleepBackoff(attempt);
                }
            }
        }

        String message = lastError != null ? lastError.getMessage() : "All providers failed";
        throw new BusinessException(ErrorCode.AI_GENERATION_FAILED, "AI generation failed: " + message);
    }

    private JsonNode retryJsonRepair(String content, JsonNode schema, AiCompletionRequest request, UUID correlationId, int attempt) {
        JsonNode repaired = jsonRepairService.repair(content);
        if (repaired != null) {
            ResponseValidator.ValidationResult validation = responseValidator.validate(repaired, schema);
            if (validation.valid()) {
                return repaired;
            }
        }
        if (attempt < request.maxRetries()) {
            throw new BusinessException(ErrorCode.AI_VALIDATION_FAILED, "JSON validation failed, will retry");
        }
        throw new BusinessException(ErrorCode.AI_VALIDATION_FAILED, "AI response failed schema validation");
    }

    private PromptManager.RenderedPrompt resolvePrompt(AiCompletionRequest request) {
        if (request.promptId() == null || request.promptVersion() == null) {
            return new PromptManager.RenderedPrompt(
                    "inline", "1.0", request.taskType(), request.generatorName(),
                    request.systemPromptOverride() != null ? request.systemPromptOverride() : "",
                    request.userPromptOverride() != null ? request.userPromptOverride() : "");
        }
        return promptManager.render(request.promptId(), request.promptVersion(), request.variables());
    }

    private UUID resolveCorrelationId(UUID requestCorrelationId) {
        if (requestCorrelationId != null) {
            return requestCorrelationId;
        }
        String mdcId = MDC.get(CorrelationIdFilter.MDC_KEY);
        if (mdcId != null) {
            try {
                return UUID.fromString(mdcId);
            } catch (IllegalArgumentException ignored) {
                return UUID.randomUUID();
            }
        }
        return UUID.randomUUID();
    }

    private void sleepBackoff(int attempt) {
        long delay = (long) (properties.getRetryInitialDelay().toMillis() * Math.pow(properties.getRetryMultiplier(), attempt));
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
