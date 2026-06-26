package com.blueprintai.auth.api;

import java.util.UUID;

/** Provides the currently authenticated user from the security context. */
public interface CurrentUserProvider {

    AuthenticatedUser getCurrentUser();

    UUID getCurrentUserId();
}
