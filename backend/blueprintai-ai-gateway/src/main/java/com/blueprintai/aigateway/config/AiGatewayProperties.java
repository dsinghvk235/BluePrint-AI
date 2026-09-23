package com.blueprintai.aigateway.config;

import com.blueprintai.aigateway.api.AiProviderType;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "blueprintai.ai")
public class AiGatewayProperties {

    private boolean enabled = true;
    private Duration cacheTtl = Duration.ofHours(24);
    private Duration cacheTtlChat = Duration.ofMinutes(30);
    private int circuitBreakerFailureThreshold = 5;
    private Duration circuitBreakerResetTimeout = Duration.ofMinutes(2);
    private int maxRetryAttempts = 3;
    private Duration retryInitialDelay = Duration.ofMillis(500);
    private double retryMultiplier = 2.0;
    private List<AiProviderType> providerPriority = List.of(
            AiProviderType.OLLAMA,
            AiProviderType.OPENAI,
            AiProviderType.CLAUDE,
            AiProviderType.GEMINI,
            AiProviderType.DEEPSEEK);
    private Map<AiProviderType, ProviderConfig> providers = new EnumMap<>(AiProviderType.class);

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Duration getCacheTtl() {
        return cacheTtl;
    }

    public void setCacheTtl(Duration cacheTtl) {
        this.cacheTtl = cacheTtl;
    }

    public Duration getCacheTtlChat() {
        return cacheTtlChat;
    }

    public void setCacheTtlChat(Duration cacheTtlChat) {
        this.cacheTtlChat = cacheTtlChat;
    }

    public int getCircuitBreakerFailureThreshold() {
        return circuitBreakerFailureThreshold;
    }

    public void setCircuitBreakerFailureThreshold(int circuitBreakerFailureThreshold) {
        this.circuitBreakerFailureThreshold = circuitBreakerFailureThreshold;
    }

    public Duration getCircuitBreakerResetTimeout() {
        return circuitBreakerResetTimeout;
    }

    public void setCircuitBreakerResetTimeout(Duration circuitBreakerResetTimeout) {
        this.circuitBreakerResetTimeout = circuitBreakerResetTimeout;
    }

    public int getMaxRetryAttempts() {
        return maxRetryAttempts;
    }

    public void setMaxRetryAttempts(int maxRetryAttempts) {
        this.maxRetryAttempts = maxRetryAttempts;
    }

    public Duration getRetryInitialDelay() {
        return retryInitialDelay;
    }

    public void setRetryInitialDelay(Duration retryInitialDelay) {
        this.retryInitialDelay = retryInitialDelay;
    }

    public double getRetryMultiplier() {
        return retryMultiplier;
    }

    public void setRetryMultiplier(double retryMultiplier) {
        this.retryMultiplier = retryMultiplier;
    }

    public List<AiProviderType> getProviderPriority() {
        return providerPriority;
    }

    public void setProviderPriority(List<AiProviderType> providerPriority) {
        this.providerPriority = providerPriority;
    }

    public Map<AiProviderType, ProviderConfig> getProviders() {
        return providers;
    }

    public void setProviders(Map<AiProviderType, ProviderConfig> providers) {
        this.providers = providers;
    }

    public List<AiProviderType> getEnabledProviders() {
        List<AiProviderType> enabled = new ArrayList<>();
        for (AiProviderType type : providerPriority) {
            ProviderConfig config = providers.get(type);
            if (config != null && config.isConfigured()) {
                enabled.add(type);
            }
        }
        return enabled;
    }

    public static class ProviderConfig {
        private boolean enabled = false;
        private String apiKey = "";
        private String baseUrl = "";
        private String defaultModel = "";
        private BigDecimal inputCostPer1kTokens = BigDecimal.valueOf(0.001);
        private BigDecimal outputCostPer1kTokens = BigDecimal.valueOf(0.002);
        private int dailyQuotaTokens = 1_000_000;
        private Map<String, List<AiProviderType>> taskPreferences = Map.of();

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getDefaultModel() {
            return defaultModel;
        }

        public void setDefaultModel(String defaultModel) {
            this.defaultModel = defaultModel;
        }

        public BigDecimal getInputCostPer1kTokens() {
            return inputCostPer1kTokens;
        }

        public void setInputCostPer1kTokens(BigDecimal inputCostPer1kTokens) {
            this.inputCostPer1kTokens = inputCostPer1kTokens;
        }

        public BigDecimal getOutputCostPer1kTokens() {
            return outputCostPer1kTokens;
        }

        public void setOutputCostPer1kTokens(BigDecimal outputCostPer1kTokens) {
            this.outputCostPer1kTokens = outputCostPer1kTokens;
        }

        public int getDailyQuotaTokens() {
            return dailyQuotaTokens;
        }

        public void setDailyQuotaTokens(int dailyQuotaTokens) {
            this.dailyQuotaTokens = dailyQuotaTokens;
        }

        public Map<String, List<AiProviderType>> getTaskPreferences() {
            return taskPreferences;
        }

        public void setTaskPreferences(Map<String, List<AiProviderType>> taskPreferences) {
            this.taskPreferences = taskPreferences;
        }

        public boolean hasApiKey() {
            return apiKey != null && !apiKey.isBlank();
        }

        /** Active only when explicitly enabled and credentials (or local base URL) are present. */
        public boolean isConfigured() {
            if (!enabled) {
                return false;
            }
            return hasApiKey() || (baseUrl != null && !baseUrl.isBlank());
        }
    }
}
