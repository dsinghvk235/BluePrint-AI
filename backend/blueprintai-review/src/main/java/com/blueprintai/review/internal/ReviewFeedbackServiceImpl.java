package com.blueprintai.review.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.review.api.ReviewFeedbackService;
import com.blueprintai.review.api.dto.AiFeedbackMetadata;
import com.blueprintai.review.api.dto.FeedbackResponse;
import com.blueprintai.review.api.dto.FeedbackSummary;
import com.blueprintai.review.api.dto.SubmitFeedbackRequest;
import com.blueprintai.review.internal.entity.Review;
import com.blueprintai.review.internal.repository.ReviewRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewFeedbackServiceImpl implements ReviewFeedbackService {

    private static final String MODULE_NAME = "review-feedback";

    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;

    public ReviewFeedbackServiceImpl(ReviewRepository reviewRepository, ObjectMapper objectMapper) {
        this.reviewRepository = reviewRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return true;
    }

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(SubmitFeedbackRequest request, UUID userId) {
        if (request.rating() != null && (request.rating() < 1 || request.rating() > 5)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setTargetType(request.targetType().name());
        review.setTargetId(request.targetId());
        review.setProjectId(request.projectId());
        review.setFeedbackType(request.targetType().name().toLowerCase());
        if (request.rating() != null) {
            review.setRating(request.rating().shortValue());
        }
        review.setHelpful(request.helpful());
        review.setComment(request.comment());
        review.setSuggestion(request.suggestion());

        AiFeedbackMetadata ai = request.aiMetadata();
        if (ai != null) {
            review.setAiProvider(ai.aiProvider());
            review.setAiModel(ai.aiModel());
            review.setPromptVersion(ai.promptVersion());
            review.setGeneratorName(ai.generatorName());
            review.setGenerationTimeMs(ai.generationTimeMs());
            review.setResponseLatencyMs(ai.responseLatencyMs());
            if (ai.tokenUsage() != null && !ai.tokenUsage().isEmpty()) {
                review.setTokenUsage(toJson(ai.tokenUsage()));
            }
        }

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackSummary getTargetSummary(String targetType, UUID targetId) {
        return mapSummary(reviewRepository.summarizeByTarget(targetType, targetId));
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackSummary getProjectSummary(UUID projectId) {
        return mapSummary(reviewRepository.summarizeByProject(projectId));
    }

    private FeedbackSummary mapSummary(List<Object[]> rows) {
        if (rows.isEmpty() || rows.get(0) == null) {
            return new FeedbackSummary(0, 0, 0, 0);
        }
        Object[] row = rows.get(0);
        double avg = row[0] != null ? ((Number) row[0]).doubleValue() : 0;
        int total = row[1] != null ? ((Number) row[1]).intValue() : 0;
        int helpful = row[2] != null ? ((Number) row[2]).intValue() : 0;
        int notHelpful = row[3] != null ? ((Number) row[3]).intValue() : 0;
        return new FeedbackSummary(avg, total, helpful, notHelpful);
    }

    private FeedbackResponse toResponse(Review review) {
        return new FeedbackResponse(
                review.getId(),
                review.getTargetType(),
                review.getTargetId(),
                review.getProjectId(),
                review.getRating() != null ? review.getRating().intValue() : null,
                review.getHelpful(),
                review.getComment(),
                review.getSuggestion(),
                review.getCreatedAt());
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to serialize token usage", ex);
        }
    }
}
