package com.blueprintai.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "blueprintai.security")
public record SecurityProperties(String refreshCookieName) {}
