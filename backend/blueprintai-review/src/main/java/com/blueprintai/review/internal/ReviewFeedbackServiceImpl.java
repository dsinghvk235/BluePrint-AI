package com.blueprintai.review.internal;

import com.blueprintai.review.api.ReviewFeedbackService;
import org.springframework.stereotype.Service;

@Service
public class ReviewFeedbackServiceImpl implements ReviewFeedbackService {

    private static final String MODULE_NAME = "review-feedback";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
