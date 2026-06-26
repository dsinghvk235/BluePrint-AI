package com.blueprintai.auth.internal.security;

import com.blueprintai.auth.api.AuthenticatedUser;
import com.blueprintai.auth.api.UserRole;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Spring Security principal carrying BlueprintAI user identity. */
public class BlueprintUserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String fullName;
    private final UserRole role;
    private final String passwordHash;
    private final boolean active;

    public BlueprintUserPrincipal(
            UUID id, String email, String fullName, UserRole role, String passwordHash, boolean active) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.passwordHash = passwordHash;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public UserRole getRole() {
        return role;
    }

    public AuthenticatedUser toAuthenticatedUser() {
        return new AuthenticatedUser(id, email, fullName, role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
