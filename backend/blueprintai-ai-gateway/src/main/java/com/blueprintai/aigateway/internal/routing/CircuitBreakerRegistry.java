package com.blueprintai.aigateway.internal.routing;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

/** In-memory circuit breaker per provider — prevents cascading failures. */
@Component
public class CircuitBreakerRegistry {

    private final AiGatewayProperties properties;
    private final Map<AiProviderType, CircuitState> states = new EnumMap<>(AiProviderType.class);

    public CircuitBreakerRegistry(AiGatewayProperties properties) {
        this.properties = properties;
        for (AiProviderType type : AiProviderType.values()) {
            states.put(type, new CircuitState());
        }
    }

    public boolean isCircuitOpen(AiProviderType provider) {
        CircuitState state = states.get(provider);
        if (!state.open) {
            return false;
        }
        if (Instant.now().isAfter(state.openedAt.plus(properties.getCircuitBreakerResetTimeout()))) {
            state.open = false;
            state.failureCount.set(0);
            return false;
        }
        return true;
    }

    public void recordSuccess(AiProviderType provider, long latencyMs) {
        CircuitState state = states.get(provider);
        state.failureCount.set(0);
        state.open = false;
        state.successCount.incrementAndGet();
        state.totalLatencyMs.addAndGet(latencyMs);
        state.latencySamples.incrementAndGet();
    }

    public void recordFailure(AiProviderType provider) {
        CircuitState state = states.get(provider);
        state.failureCount.incrementAndGet();
        if (state.failureCount.get() >= properties.getCircuitBreakerFailureThreshold()) {
            state.open = true;
            state.openedAt = Instant.now();
        }
    }

    public long getAverageLatency(AiProviderType provider) {
        CircuitState state = states.get(provider);
        int samples = state.latencySamples.get();
        return samples == 0 ? 0 : state.totalLatencyMs.get() / samples;
    }

    public int getFailureCount(AiProviderType provider) {
        return states.get(provider).failureCount.get();
    }

    public int getSuccessCount(AiProviderType provider) {
        return states.get(provider).successCount.get();
    }

    public boolean isOpen(AiProviderType provider) {
        return states.get(provider).open;
    }

    private static class CircuitState {
        private final AtomicInteger failureCount = new AtomicInteger();
        private final AtomicInteger successCount = new AtomicInteger();
        private final AtomicLong totalLatencyMs = new AtomicLong();
        private final AtomicInteger latencySamples = new AtomicInteger();
        private volatile boolean open;
        private volatile Instant openedAt = Instant.now();
    }
}
