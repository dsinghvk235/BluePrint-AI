package com.blueprintai.common.exception;

/** Application-specific error codes — avoids magic strings in exception handling. */
public enum ErrorCode {
    VALIDATION_ERROR("VALIDATION_ERROR"),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND"),
    UNAUTHORIZED("UNAUTHORIZED"),
    FORBIDDEN("FORBIDDEN"),
    CONFLICT("CONFLICT"),
    INTERNAL_ERROR("INTERNAL_ERROR"),
    AI_PROVIDER_UNAVAILABLE("AI_PROVIDER_UNAVAILABLE"),
    AI_GENERATION_FAILED("AI_GENERATION_FAILED"),
    AI_VALIDATION_FAILED("AI_VALIDATION_FAILED"),
    AI_RATE_LIMITED("AI_RATE_LIMITED");

    private final String code;

    ErrorCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
