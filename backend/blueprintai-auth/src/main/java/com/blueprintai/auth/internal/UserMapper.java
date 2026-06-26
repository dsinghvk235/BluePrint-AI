package com.blueprintai.auth.internal;

import com.blueprintai.auth.api.dto.UserResponse;
import com.blueprintai.auth.internal.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getRole(),
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLogin());
    }
}
