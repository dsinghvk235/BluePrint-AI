package com.blueprintai.auth.api.dto;

/** Internal auth result including refresh token for HTTP cookie handling. */
public record AuthSessionResult(AuthTokensResponse tokens, String refreshToken) {}
