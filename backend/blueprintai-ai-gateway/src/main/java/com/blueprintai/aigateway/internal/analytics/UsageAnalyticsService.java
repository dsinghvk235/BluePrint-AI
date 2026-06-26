package com.blueprintai.aigateway.internal.analytics;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.stereotype.Service;

@Service
public class UsageAnalyticsService {

    private final AiGatewayProperties properties;
    private final Map<AiProviderType, DailyUsage> dailyUsage = new EnumMap<>(AiProviderType.class);
    private final Map<AiProviderType, AtomicReference<BigDecimal>> totalCost = new EnumMap<>(AiProviderType.class);

    public UsageAnalyticsService(AiGatewayProperties properties) {
        this.properties = properties;
        for (AiProviderType type : AiProviderType.values()) {
            dailyUsage.put(type, new DailyUsage());
            totalCost.put(type, new AtomicReference<>(BigDecimal.ZERO));
        }
    }

    public void recordUsage(
            AiProviderType provider, int inputTokens, int outputTokens, long latencyMs, BigDecimal cost) {
        DailyUsage usage = dailyUsage.get(provider);
        usage.resetIfNewDay();
        usage.tokensUsed.addAndGet(inputTokens + outputTokens);
        usage.requestCount.incrementAndGet();
        usage.totalLatencyMs.addAndGet(latencyMs);
        totalCost.get(provider).updateAndGet(current -> current.add(cost));
    }

    public double getQuotaUsagePercent(AiProviderType provider) {
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(provider);
        if (config == null || config.getDailyQuotaTokens() <= 0) {
            return 0;
        }
        DailyUsage usage = dailyUsage.get(provider);
        usage.resetIfNewDay();
        return (usage.tokensUsed.get() * 100.0) / config.getDailyQuotaTokens();
    }

    public BigDecimal getTotalCost(AiProviderType provider) {
        return totalCost.get(provider).get();
    }

    public long getAverageLatency(AiProviderType provider) {
        DailyUsage usage = dailyUsage.get(provider);
        int count = usage.requestCount.get();
        return count == 0 ? 0 : usage.totalLatencyMs.get() / count;
    }

    private static class DailyUsage {
        private final AtomicInteger tokensUsed = new AtomicInteger();
        private final AtomicInteger requestCount = new AtomicInteger();
        private final java.util.concurrent.atomic.AtomicLong totalLatencyMs = new java.util.concurrent.atomic.AtomicLong();
        private volatile LocalDate date = LocalDate.now();

        void resetIfNewDay() {
            LocalDate today = LocalDate.now();
            if (!today.equals(date)) {
                tokensUsed.set(0);
                requestCount.set(0);
                totalLatencyMs.set(0);
                date = today;
            }
        }
    }
}
