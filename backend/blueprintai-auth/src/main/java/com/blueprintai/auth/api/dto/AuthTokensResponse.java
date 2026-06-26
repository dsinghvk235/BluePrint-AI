package com.blueprintai.auth.api.dto;

public record AuthTokensResponse(String accessToken, String tokenType, long expiresInMs, UserResponse user) {}
