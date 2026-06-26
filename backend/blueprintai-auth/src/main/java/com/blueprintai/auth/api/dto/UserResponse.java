package com.blueprintai.auth.api.dto;

import com.blueprintai.auth.api.AccountStatus;
import com.blueprintai.auth.api.UserRole;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String profileImageUrl,
        UserRole role,
        AccountStatus accountStatus,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLogin) {}
