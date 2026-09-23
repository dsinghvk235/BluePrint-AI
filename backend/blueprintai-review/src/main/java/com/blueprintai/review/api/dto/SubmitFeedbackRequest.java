package com.blueprintai.review.api.dto;

import com.blueprintai.review.api.FeedbackTargetType;
import java.util.UUID;

public record SubmitFeedbackRequest(
        FeedbackTargetType targetType,
        UUID targetId,
        UUID projectId,
        Integer rating,
        Boolean helpful,
        String comment,
        String suggestion,
        AiFeedbackMetadata aiMetadata) {}
