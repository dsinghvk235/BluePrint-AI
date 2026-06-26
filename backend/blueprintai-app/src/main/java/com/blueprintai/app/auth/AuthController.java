package com.blueprintai.app.auth;

import com.blueprintai.auth.api.AuthService;
import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.auth.api.dto.AuthSessionResult;
import com.blueprintai.auth.api.dto.AuthTokensResponse;
import com.blueprintai.auth.api.dto.LoginRequest;
import com.blueprintai.auth.api.dto.RegisterRequest;
import com.blueprintai.auth.api.dto.TokenRefreshResponse;
import com.blueprintai.auth.api.dto.UserResponse;
import com.blueprintai.auth.config.SecurityProperties;
import com.blueprintai.common.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;
    private final SecurityProperties securityProperties;

    public AuthController(
            AuthService authService,
            CurrentUserProvider currentUserProvider,
            SecurityProperties securityProperties) {
        this.authService = authService;
        this.currentUserProvider = currentUserProvider;
        this.securityProperties = securityProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthTokensResponse>> register(
            @Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthSessionResult session = authService.register(request);
        setRefreshCookie(response, session.refreshToken());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(session.tokens(), "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokensResponse>> login(
            @Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthSessionResult session = authService.login(request);
        setRefreshCookie(response, session.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(session.tokens(), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refresh(
            @CookieValue(name = "${blueprintai.security.refresh-cookie-name:blueprintai_refresh_token}", required = false)
                    String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token missing"));
        }
        TokenRefreshResponse tokens = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletResponse response,
            @CookieValue(name = "${blueprintai.security.refresh-cookie-name:blueprintai_refresh_token}", required = false)
                    String refreshToken) {
        authService.logout(currentUserProvider.getCurrentUserId(), refreshToken);
        clearRefreshCookie(response);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success(authService.getCurrentUserProfile(currentUserProvider.getCurrentUserId()));
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(securityProperties.refreshCookieName(), refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge((int) Duration.ofDays(7).getSeconds());
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(securityProperties.refreshCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
