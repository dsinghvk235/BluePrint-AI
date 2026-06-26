package com.blueprintai.aigateway.api.dto;

import com.blueprintai.aigateway.api.AiTaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

/** Request to the AI Gateway for structured completion. */
public record AiCompletionRequest(
        @NotNull AiTaskType taskType,
        @NotBlank String promptId,
        @NotBlank String promptVersion,
        @NotBlank String generatorName,
        Map<String, String> variables,
        String systemPromptOverride,
        String userPromptOverride,
        UUID userId,
        UUID projectId,
        UUID correlationId,
        boolean useCache,
        int maxRetries) {

    public AiCompletionRequest {
        variables = variables == null ? Map.of() : Map.copyOf(variables);
        maxRetries = maxRetries <= 0 ? 2 : maxRetries;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private AiTaskType taskType;
        private String promptId;
        private String promptVersion;
        private String generatorName;
        private Map<String, String> variables = Map.of();
        private String systemPromptOverride;
        private String userPromptOverride;
        private UUID userId;
        private UUID projectId;
        private UUID correlationId;
        private boolean useCache = true;
        private int maxRetries = 2;

        public Builder taskType(AiTaskType taskType) {
            this.taskType = taskType;
            return this;
        }

        public Builder promptId(String promptId) {
            this.promptId = promptId;
            return this;
        }

        public Builder promptVersion(String promptVersion) {
            this.promptVersion = promptVersion;
            return this;
        }

        public Builder generatorName(String generatorName) {
            this.generatorName = generatorName;
            return this;
        }

        public Builder variables(Map<String, String> variables) {
            this.variables = variables;
            return this;
        }

        public Builder systemPromptOverride(String systemPromptOverride) {
            this.systemPromptOverride = systemPromptOverride;
            return this;
        }

        public Builder userPromptOverride(String userPromptOverride) {
            this.userPromptOverride = userPromptOverride;
            return this;
        }

        public Builder userId(UUID userId) {
            this.userId = userId;
            return this;
        }

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder correlationId(UUID correlationId) {
            this.correlationId = correlationId;
            return this;
        }

        public Builder useCache(boolean useCache) {
            this.useCache = useCache;
            return this;
        }

        public Builder maxRetries(int maxRetries) {
            this.maxRetries = maxRetries;
            return this;
        }

        public AiCompletionRequest build() {
            return new AiCompletionRequest(
                    taskType,
                    promptId,
                    promptVersion,
                    generatorName,
                    variables,
                    systemPromptOverride,
                    userPromptOverride,
                    userId,
                    projectId,
                    correlationId,
                    useCache,
                    maxRetries);
        }
    }
}
