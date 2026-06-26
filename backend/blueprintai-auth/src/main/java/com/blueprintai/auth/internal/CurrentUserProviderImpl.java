package com.blueprintai.auth.internal;

import com.blueprintai.auth.api.AuthenticatedUser;
import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.auth.internal.security.BlueprintUserPrincipal;
import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserProviderImpl implements CurrentUserProvider {

    @Override
    public AuthenticatedUser getCurrentUser() {
        BlueprintUserPrincipal principal = getPrincipal();
        return principal.toAuthenticatedUser();
    }

    @Override
    public UUID getCurrentUserId() {
        return getPrincipal().getId();
    }

    private BlueprintUserPrincipal getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof BlueprintUserPrincipal principal)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return principal;
    }
}
