package com.blueprintai.aigateway.internal.logging;

import com.blueprintai.aigateway.api.AiProviderType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiLogService {

    private final AiLogRepository aiLogRepository;

    public AiLogService(AiLogRepository aiLogRepository) {
        this.aiLogRepository = aiLogRepository;
    }

    @Transactional
    public void logSuccess(
            UUID requestId,
            AiCompletionRequest request,
            AiProviderType provider,
            String model,
            int tokensInput,
            int tokensOutput,
            long latencyMs,
            BigDecimal costUsd,
            String promptHash) {
        AiLog log = baseLog(requestId, request, provider, model, promptHash);
        log.setStatus("SUCCESS");
        log.setTokensInput(tokensInput);
        log.setTokensOutput(tokensOutput);
        log.setLatencyMs((int) latencyMs);
        log.setCostUsd(costUsd);
        aiLogRepository.save(log);
    }

    @Transactional
    public void logFailure(
            UUID requestId,
            AiCompletionRequest request,
            AiProviderType provider,
            String model,
            String errorMessage,
            String promptHash) {
        AiLog log = baseLog(requestId, request, provider, model, promptHash);
        log.setStatus("FAILURE");
        log.setErrorMessage(errorMessage);
        aiLogRepository.save(log);
    }

    private AiLog baseLog(
            UUID requestId,
            AiCompletionRequest request,
            AiProviderType provider,
            String model,
            String promptHash) {
        AiLog log = new AiLog();
        log.setRequestId(requestId);
        log.setProvider(provider != null ? provider.name() : "UNKNOWN");
        log.setModel(model != null ? model : "unknown");
        log.setPromptVersion(request.promptVersion());
        log.setCorrelationId(request.correlationId());
        log.setUserId(request.userId());
        log.setProjectId(request.projectId());
        log.setTaskType(request.taskType().name());
        log.setGeneratorName(request.generatorName());
        log.setPromptHash(promptHash);
        return log;
    }
}
