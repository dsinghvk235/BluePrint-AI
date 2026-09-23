package com.blueprintai.review.api.dto;

import java.time.Instant;
import java.util.UUID;

public record FeedbackResponse(
        UUID id,
        String targetType,
        UUID targetId,
        UUID projectId,
        Integer rating,
        Boolean helpful,
        String comment,
        String suggestion,
        Instant createdAt) {}
