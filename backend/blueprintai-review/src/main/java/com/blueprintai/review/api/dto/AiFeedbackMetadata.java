package com.blueprintai.review.api.dto;

import com.blueprintai.review.api.FeedbackTargetType;
import java.util.Map;
import java.util.UUID;

public record AiFeedbackMetadata(
        String aiProvider,
        String aiModel,
        String promptVersion,
        String generatorName,
        Long generationTimeMs,
        Long responseLatencyMs,
        Map<String, Object> tokenUsage) {}
