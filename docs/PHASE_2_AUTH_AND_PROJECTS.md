# Phase 2 — Authentication & Project Management

This document covers the Phase 2 implementation of BlueprintAI: user authentication, JWT lifecycle, and project management.

---

## 1. Authentication Flow

```
┌──────────┐    POST /auth/register     ┌─────────────┐
│ Frontend │ ─────────────────────────► │ AuthController│
└──────────┘                            └──────┬──────┘
     ▲                                         │
     │  accessToken (JSON body)                ▼
     │  refreshToken (httpOnly cookie)   AuthServiceImpl
     │                                         │
     └─────────────────────────────────────────┘

Protected requests:
  Authorization: Bearer <accessToken>
       │
       ▼
  JwtAuthenticationFilter → SecurityContext → Controller
```

### Registration & Login

1. Client sends credentials to `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
2. `AuthServiceImpl` validates input, hashes passwords with BCrypt, persists user
3. Access JWT is returned in the response body (`AuthTokensResponse`)
4. Refresh token is stored hashed in `refresh_tokens` table and set as an **httpOnly cookie**
5. Frontend stores access token in memory (Zustand); user profile is persisted to localStorage

### Session Restoration

On app load, `AuthInitializer` calls `POST /api/v1/auth/refresh` with the cookie. If valid, a new access token is issued and `/auth/me` hydrates the user profile.

### Logout

`POST /api/v1/auth/logout` revokes refresh tokens server-side and clears the cookie. Frontend clears in-memory session state.

---

## 2. JWT Lifecycle

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Access | Memory (frontend) | 15 min (configurable) | API authorization via `Authorization: Bearer` |
| Refresh | httpOnly cookie | 7 days | Silent re-authentication |

### Access Token Claims

- `sub` — user UUID
- `email` — user email
- `role` — `USER` or `ADMIN`
- `name` — display name
- `iss` — `blueprintai`

### Refresh Token Security

- Raw token never stored; SHA-256 hash persisted in `refresh_tokens`
- Revoked on logout and on new login (token rotation)
- Cookie path scoped to `/api/v1/auth`

### Automatic Refresh (Frontend)

`apiClient` intercepts `401` responses, calls `/auth/refresh`, retries the original request with the new access token.

---

## 3. User Module Structure

```
blueprintai-auth/
├── api/
│   ├── AuthService.java           # Public contract
│   ├── CurrentUserProvider.java   # Cross-module identity access
│   ├── AuthenticatedUser.java
│   ├── UserRole.java
│   ├── AccountStatus.java
│   └── dto/                       # Request/response DTOs
├── internal/
│   ├── entity/                    # User, RefreshToken JPA entities
│   ├── repository/
│   ├── security/                  # JWT, filters, UserDetails
│   ├── AuthServiceImpl.java
│   ├── CurrentUserProviderImpl.java
│   └── UserMapper.java
└── config/
    ├── SecurityConfig.java
    ├── JwtProperties.java
    └── AuthModuleConfig.java
```

### User Entity Fields

| Field | Column | Notes |
|-------|--------|-------|
| id | id | UUID PK |
| email | email | Unique, indexed |
| password | password_hash | BCrypt hashed |
| fullName | display_name | Display name |
| profileImageUrl | profile_image_url | Optional, OAuth-ready |
| role | role | USER, ADMIN |
| accountStatus | account_status | ACTIVE, SUSPENDED, DEACTIVATED |
| emailVerified | email_verified | Future email verification |
| createdAt | created_at | Auto-set |
| updatedAt | updated_at | Auto-updated |
| lastLogin | last_login | Updated on login |

---

## 4. Project Module Structure

```
blueprintai-project/
├── api/
│   ├── ProjectService.java
│   ├── ProjectStatus.java
│   └── dto/
├── internal/
│   ├── entity/Project.java
│   ├── repository/ProjectRepository.java
│   ├── ProjectSpecifications.java  # Dynamic search/filter
│   ├── ProjectMapper.java
│   └── ProjectServiceImpl.java
└── config/ProjectModuleConfig.java
```

### Ownership Enforcement

All project operations receive `ownerId` from `CurrentUserProvider`. Repository queries always scope by `ownerId` — users cannot access other users' projects.

---

## 5. Database Schema

### Migration V2 (`V2__auth_and_project_extensions.sql`)

Extends Phase 0 tables:

**users** — adds `profile_image_url`, `role`, `account_status`, `email_verified`, `last_login`

**projects** — adds `system_type`, `prompt`, `current_version`, `status`, `theme`, `last_opened`, `tags`, `is_favorite`, `is_archived`

**refresh_tokens** — new table for JWT refresh rotation

### Indexes

- `idx_users_role`, `idx_users_account_status`
- `idx_projects_owner_updated`, `idx_projects_owner_last_opened`
- `idx_refresh_tokens_user_id`, `idx_refresh_tokens_expires_at`

---

## 6. API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Sign in |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | Bearer | Revoke session |
| GET | `/me` | Bearer | Current user profile |

### Projects (`/api/v1/projects`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List projects (paginated, search, filter, sort) |
| GET | `/recent` | Recent projects by last opened |
| POST | `/` | Create project |
| GET | `/{id}` | Get project |
| POST | `/{id}/open` | Open project (updates lastOpened) |
| PUT | `/{id}` | Update project |
| PATCH | `/{id}/rename` | Rename project |
| PATCH | `/{id}/archive` | Archive project |
| POST | `/{id}/duplicate` | Duplicate project |
| DELETE | `/{id}` | Delete project |

### Query Parameters (List)

- `search` — name, description, system type
- `status` — DRAFT, ACTIVE, ARCHIVED
- `favorite` — boolean
- `archived` — boolean (default false)
- `sortBy` — name, createdAt, updatedAt, lastOpened
- `sortDirection` — asc, desc
- `page`, `size` — pagination

---

## 7. Folder Structure (Frontend)

```
frontend/src/
├── app/
│   ├── providers/AuthInitializer.tsx   # Session restoration
│   └── router/ProtectedRoute.tsx       # Auth guards
├── features/
│   ├── auth/
│   │   ├── api/auth-api.ts
│   │   ├── hooks/use-auth.ts
│   │   └── pages/                      # Login, Register, ForgotPassword
│   └── projects/
│       ├── api/projects-api.ts
│       ├── hooks/use-projects.ts
│       ├── components/                 # Cards, dialogs
│       └── pages/ProjectsPage.tsx
└── shared/
    ├── api/client.ts                   # JWT injection + auto-refresh
    ├── stores/auth-store.ts            # In-memory token + persisted user
    └── types/index.ts
```

---

## 8. Security Decisions

| Decision | Rationale |
|----------|-----------|
| Stateless JWT sessions | Horizontally scalable; no server-side session store |
| Access token in memory | Mitigates XSS token theft vs localStorage |
| Refresh token in httpOnly cookie | Not accessible to JavaScript |
| BCrypt password hashing | Industry standard, Spring Security default |
| CSRF disabled | Stateless JWT API; refresh cookie uses SameSite=Lax |
| CORS with credentials | Required for cross-origin cookie delivery in dev |
| Refresh token hashing | DB breach does not expose usable tokens |
| Role-ready architecture | `ROLE_USER`, `ROLE_ADMIN` authorities for future RBAC |
| Input validation | Jakarta Validation on all request DTOs |
| Rate limiting | Architecture-ready; integration point in SecurityConfig filter chain |

---

## 9. Future Extension Points

### OAuth (Google/GitHub)

- Add `auth_provider` and `provider_id` columns to users
- `AuthService` interface supports new `oauthLogin(provider, token)` method
- Password field becomes optional for OAuth-only accounts
- `SecurityConfig` gains OAuth2 login filter alongside JWT filter

### Collaboration

- `project_collaborators` join table with role per collaborator
- `ProjectService` ownership checks extend to collaborator permissions
- WebSocket presence module (Phase V2)

### Versioning

- `current_version` field ready on projects
- `project_versions` table can snapshot project state per version
- `duplicateProject` serves as manual version fork today

### Email Verification

- `email_verified` flag and verification token table
- Registration flow sends verification email before full access

### Archive

- `is_archived` and `ARCHIVED` status implemented
- UI filter for archived projects ready; dedicated archive view in future

---

*Phase 2 complete — authentication and project management are production-ready for V1.*
