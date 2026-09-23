package com.blueprintai.review.api.dto;

public record FeedbackSummary(double averageRating, int totalReviews, int helpfulCount, int notHelpfulCount) {}
