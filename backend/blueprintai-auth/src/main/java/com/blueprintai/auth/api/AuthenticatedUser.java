package com.blueprintai.auth.api;

/** Authenticated user principal exposed to other modules via the auth API. */
public record AuthenticatedUser(java.util.UUID id, String email, String fullName, UserRole role) {}
