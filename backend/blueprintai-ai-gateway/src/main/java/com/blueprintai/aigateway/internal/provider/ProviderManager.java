package com.blueprintai.aigateway.internal.provider;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ProviderManager {

    private final Map<AiProviderType, AiProviderClient> clients;
    private final AiGatewayProperties properties;

    public ProviderManager(List<AiProviderClient> clients, AiGatewayProperties properties) {
        this.clients = clients.stream().collect(java.util.stream.Collectors.toMap(AiProviderClient::getProviderType, c -> c));
        this.properties = properties;
    }

    public AiProviderClient getClient(AiProviderType type) {
        return clients.get(type);
    }

    public List<AiProviderType> getConfiguredProviders() {
        return properties.getEnabledProviders();
    }

    public BigDecimal calculateCost(AiProviderType type, int inputTokens, int outputTokens) {
        AiGatewayProperties.ProviderConfig config = properties.getProviders().get(type);
        if (config == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal inputCost = config.getInputCostPer1kTokens()
                .multiply(BigDecimal.valueOf(inputTokens))
                .divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
        BigDecimal outputCost = config.getOutputCostPer1kTokens()
                .multiply(BigDecimal.valueOf(outputTokens))
                .divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
        return inputCost.add(outputCost);
    }
}
