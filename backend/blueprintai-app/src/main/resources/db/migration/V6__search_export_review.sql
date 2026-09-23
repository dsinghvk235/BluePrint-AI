-- Phase 6: Search, Export, Review & Project Productivity

ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS export_count INT NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_ai_model VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_ai_provider VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_prompt_version VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_projects_owner_pinned ON projects(owner_id, is_pinned) WHERE is_pinned = TRUE;

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON search_history(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT,
    duration_ms BIGINT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_logs_project ON export_logs(project_id, created_at DESC);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_helpful BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS suggestion TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS generation_time_ms BIGINT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response_latency_ms BIGINT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS token_usage JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project ON reviews(project_id);
