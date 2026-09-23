package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Request body for mentor chat — projectId comes from URL path. */
public record MentorChatBody(
        String nodeId,
        @NotNull LearningMode mode,
        @NotBlank String message,
        List<MentorChatRequest.ChatMessage> history,
        boolean useCache) {}
