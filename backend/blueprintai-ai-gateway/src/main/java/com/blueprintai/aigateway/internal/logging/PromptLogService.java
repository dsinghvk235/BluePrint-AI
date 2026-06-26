package com.blueprintai.aigateway.internal.logging;

import com.blueprintai.aigateway.internal.prompt.PromptManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PromptLogService {

    private final PromptLogRepository promptLogRepository;
    private final ObjectMapper objectMapper;

    public PromptLogService(PromptLogRepository promptLogRepository, ObjectMapper objectMapper) {
        this.promptLogRepository = promptLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void logPrompt(UUID correlationId, PromptManager.RenderedPrompt rendered, Map<String, String> variables) {
        PromptLog entry = new PromptLog();
        entry.setCorrelationId(correlationId);
        entry.setPromptId(rendered.promptId());
        entry.setPromptVersion(rendered.version());
        entry.setGeneratorName(rendered.generatorName());
        entry.setTaskType(rendered.taskType().name());
        entry.setVariables(objectMapper.valueToTree(variables));
        entry.setRenderedSystemPrompt(rendered.systemPrompt());
        entry.setRenderedUserPrompt(rendered.userPrompt());
        promptLogRepository.save(entry);
    }
}
