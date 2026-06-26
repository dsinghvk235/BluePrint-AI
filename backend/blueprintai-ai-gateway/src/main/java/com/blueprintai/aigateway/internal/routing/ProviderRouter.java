package com.blueprintai.aigateway.internal.routing;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.blueprintai.aigateway.internal.analytics.UsageAnalyticsService;
import com.blueprintai.aigateway.internal.provider.ProviderManager;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

/** Selects the best provider based on availability, cost, latency, and task type. */
@Component
public class ProviderRouter {

    private final ProviderManager providerManager;
    private final CircuitBreakerRegistry circuitBreaker;
    private final UsageAnalyticsService usageAnalytics;
    private final AiGatewayProperties properties;

    public ProviderRouter(
            ProviderManager providerManager,
            CircuitBreakerRegistry circuitBreaker,
            UsageAnalyticsService usageAnalytics,
            AiGatewayProperties properties) {
        this.providerManager = providerManager;
        this.circuitBreaker = circuitBreaker;
        this.usageAnalytics = usageAnalytics;
        this.properties = properties;
    }

    public List<AiProviderType> rankProviders(AiTaskType taskType, List<AiProviderType> exclude) {
        List<AiProviderType> candidates = new ArrayList<>();
        for (AiProviderType type : properties.getEnabledProviders()) {
            if (exclude.contains(type)) {
                continue;
            }
            if (circuitBreaker.isCircuitOpen(type)) {
                continue;
            }
            if (providerManager.getClient(type) != null && providerManager.getClient(type).isAvailable()) {
                candidates.add(type);
            }
        }

        candidates.sort(Comparator.comparingDouble((AiProviderType p) -> scoreProvider(p, taskType)).reversed());
        return candidates;
    }

    private double scoreProvider(AiProviderType provider, AiTaskType taskType) {
        double score = 100.0;
        long avgLatency = circuitBreaker.getAverageLatency(provider);
        if (avgLatency > 0) {
            score -= Math.min(avgLatency / 100.0, 40.0);
        }
        double quotaUsage = usageAnalytics.getQuotaUsagePercent(provider);
        score -= quotaUsage * 0.3;
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(provider);
        if (config != null) {
            double costFactor = config.getInputCostPer1kTokens().doubleValue()
                    + config.getOutputCostPer1kTokens().doubleValue();
            score -= costFactor * 10;
        }
        if (taskType == AiTaskType.ARCHITECTURE_GENERATION || taskType == AiTaskType.REQUIREMENTS) {
            if (provider == AiProviderType.CLAUDE || provider == AiProviderType.OPENAI) {
                score += 15;
            }
        }
        if (taskType == AiTaskType.CHAT) {
            if (provider == AiProviderType.DEEPSEEK || provider == AiProviderType.GEMINI) {
                score += 10;
            }
        }
        return score;
    }
}
