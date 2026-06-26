package com.blueprintai.auth.api.dto;

public record TokenRefreshResponse(String accessToken, String tokenType, long expiresInMs) {}
