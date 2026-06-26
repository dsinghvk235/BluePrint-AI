package com.blueprintai.auth.api;

import com.blueprintai.auth.api.dto.AuthSessionResult;
import com.blueprintai.auth.api.dto.AuthTokensResponse;
import com.blueprintai.auth.api.dto.LoginRequest;
import com.blueprintai.auth.api.dto.RegisterRequest;
import com.blueprintai.auth.api.dto.TokenRefreshResponse;
import com.blueprintai.auth.api.dto.UserResponse;
import java.util.UUID;

/** Authentication module public contract. */
public interface AuthService {

    String getModuleName();

    boolean isReady();

    AuthSessionResult register(RegisterRequest request);

    AuthSessionResult login(LoginRequest request);

    TokenRefreshResponse refreshAccessToken(String refreshToken);

    void logout(UUID userId, String refreshToken);

    UserResponse getCurrentUserProfile(UUID userId);
}
