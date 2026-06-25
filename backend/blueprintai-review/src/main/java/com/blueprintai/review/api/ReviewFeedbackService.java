package com.blueprintai.review.api;

/** review-feedback module public contract. */
public interface ReviewFeedbackService {

    String getModuleName();

    boolean isReady();
}
