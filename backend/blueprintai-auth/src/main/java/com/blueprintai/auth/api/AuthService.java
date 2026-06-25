package com.blueprintai.auth.api;

/** Authentication module public contract. Implemented in Phase 1. */
public interface AuthService {

    String getModuleName();

    boolean isReady();
}
