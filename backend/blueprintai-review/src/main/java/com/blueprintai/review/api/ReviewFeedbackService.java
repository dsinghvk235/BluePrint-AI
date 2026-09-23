package com.blueprintai.review.api;

import com.blueprintai.review.api.dto.FeedbackResponse;
import com.blueprintai.review.api.dto.FeedbackSummary;
import com.blueprintai.review.api.dto.SubmitFeedbackRequest;
import java.util.UUID;

/** Review and feedback collection for architectures, components, and AI artifacts. */
public interface ReviewFeedbackService {

    String getModuleName();

    boolean isReady();

    FeedbackResponse submitFeedback(SubmitFeedbackRequest request, UUID userId);

    FeedbackSummary getTargetSummary(String targetType, UUID targetId);

    FeedbackSummary getProjectSummary(UUID projectId);
}
