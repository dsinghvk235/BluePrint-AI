package com.blueprintai.app.review;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.common.response.ApiResponse;
import com.blueprintai.review.api.ReviewFeedbackService;
import com.blueprintai.review.api.dto.FeedbackResponse;
import com.blueprintai.review.api.dto.FeedbackSummary;
import com.blueprintai.review.api.dto.SubmitFeedbackRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feedback")
public class ReviewController {

    private final ReviewFeedbackService reviewFeedbackService;
    private final CurrentUserProvider currentUserProvider;

    public ReviewController(
            ReviewFeedbackService reviewFeedbackService, CurrentUserProvider currentUserProvider) {
        this.reviewFeedbackService = reviewFeedbackService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(@Valid @RequestBody SubmitFeedbackRequest request) {
        FeedbackResponse response =
                reviewFeedbackService.submitFeedback(request, currentUserProvider.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Feedback submitted"));
    }

    @GetMapping("/summary")
    public ApiResponse<FeedbackSummary> summary(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) UUID targetId) {
        if (projectId != null) {
            return ApiResponse.success(reviewFeedbackService.getProjectSummary(projectId));
        }
        if (targetType != null && targetId != null) {
            return ApiResponse.success(reviewFeedbackService.getTargetSummary(targetType, targetId));
        }
        return ApiResponse.success(new FeedbackSummary(0, 0, 0, 0));
    }
}
