package com.blueprintai.auth.internal;

import com.blueprintai.auth.api.AccountStatus;
import com.blueprintai.auth.api.AuthService;
import com.blueprintai.auth.api.UserRole;
import com.blueprintai.auth.api.dto.AuthSessionResult;
import com.blueprintai.auth.api.dto.AuthTokensResponse;
import com.blueprintai.auth.api.dto.LoginRequest;
import com.blueprintai.auth.api.dto.RegisterRequest;
import com.blueprintai.auth.api.dto.TokenRefreshResponse;
import com.blueprintai.auth.api.dto.UserResponse;
import com.blueprintai.auth.internal.entity.User;
import com.blueprintai.auth.internal.repository.UserRepository;
import com.blueprintai.auth.internal.security.BlueprintUserDetailsService;
import com.blueprintai.auth.internal.security.JwtService;
import com.blueprintai.auth.internal.security.RefreshTokenService;
import com.blueprintai.auth.internal.UserMapper;
import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String MODULE_NAME = "authentication";
    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final BlueprintUserDetailsService userDetailsService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            BlueprintUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return true;
    }

    @Override
    @Transactional
    public AuthSessionResult register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setDisplayName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);
        user.setLastLogin(Instant.now());

        User saved = userRepository.save(user);
        return buildSessionResult(saved);
    }

    @Override
    @Transactional
    public AuthSessionResult login(LoginRequest request) {
        User user = userRepository
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Account is not active");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user.getId());

        return buildSessionResult(user);
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshAccessToken(String refreshToken) {
        UUID userId = refreshTokenService.validateAndGetUserId(refreshToken);
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Account is not active");
        }

        String accessToken = jwtService.generateAccessToken(user);
        return new TokenRefreshResponse(accessToken, TOKEN_TYPE, jwtService.getAccessTokenExpirationMs());
    }

    @Override
    @Transactional
    public void logout(UUID userId, String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
        refreshTokenService.revokeAllForUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(UUID userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        return UserMapper.toResponse(user);
    }

    private AuthSessionResult buildSessionResult(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        AuthTokensResponse tokens = new AuthTokensResponse(
                accessToken,
                TOKEN_TYPE,
                jwtService.getAccessTokenExpirationMs(),
                UserMapper.toResponse(user));
        return new AuthSessionResult(tokens, refreshToken);
    }
}
