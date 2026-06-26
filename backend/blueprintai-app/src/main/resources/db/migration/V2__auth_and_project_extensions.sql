-- Phase 2: Authentication & Project Management extensions

-- Extend users table for auth features
ALTER TABLE users
    ADD COLUMN profile_image_url VARCHAR(500),
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN last_login TIMESTAMPTZ;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_account_status ON users(account_status);

-- Extend projects table for project management features
ALTER TABLE projects
    ADD COLUMN system_type VARCHAR(100),
    ADD COLUMN prompt TEXT,
    ADD COLUMN current_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN theme VARCHAR(50),
    ADD COLUMN last_opened TIMESTAMPTZ,
    ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_projects_owner_updated ON projects(owner_id, updated_at DESC);
CREATE INDEX idx_projects_owner_last_opened ON projects(owner_id, last_opened DESC NULLS LAST);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_is_favorite ON projects(owner_id, is_favorite) WHERE is_favorite = TRUE;

-- Refresh tokens for JWT rotation
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
