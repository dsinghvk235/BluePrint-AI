package com.blueprintai.aigateway.api.dto;

import com.blueprintai.aigateway.api.AiProviderType;
import java.util.List;

/** Aggregated health status for all configured providers. */
public record ProviderHealthResponse(List<ProviderStatus> providers, boolean anyAvailable) {

    public record ProviderStatus(
            AiProviderType provider,
            boolean available,
            boolean circuitOpen,
            long averageLatencyMs,
            int failureCount,
            int successCount,
            double quotaUsagePercent) {}
}
