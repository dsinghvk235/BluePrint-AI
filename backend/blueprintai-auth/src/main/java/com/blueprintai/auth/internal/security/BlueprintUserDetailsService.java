package com.blueprintai.auth.internal.security;

import com.blueprintai.auth.internal.entity.User;
import com.blueprintai.auth.internal.repository.UserRepository;
import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import java.util.UUID;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class BlueprintUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public BlueprintUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toPrincipal(user);
    }

    public BlueprintUserPrincipal loadById(UUID userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        return toPrincipal(user);
    }

    private BlueprintUserPrincipal toPrincipal(User user) {
        boolean active = user.getAccountStatus().name().equals("ACTIVE");
        return new BlueprintUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getPasswordHash(),
                active);
    }
}
