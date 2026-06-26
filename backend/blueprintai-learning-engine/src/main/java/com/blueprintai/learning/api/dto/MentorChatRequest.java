package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record MentorChatRequest(
        @NotNull UUID projectId,
        String nodeId,
        @NotNull LearningMode mode,
        @NotBlank String message,
        List<ChatMessage> history,
        boolean useCache) {

    public record ChatMessage(String role, String content) {}
}
