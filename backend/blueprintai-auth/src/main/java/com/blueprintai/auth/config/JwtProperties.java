package com.blueprintai.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** JWT configuration — values supplied via environment variables. */
@ConfigurationProperties(prefix = "blueprintai.security.jwt")
public record JwtProperties(String secret, long expirationMs, String issuer) {}
