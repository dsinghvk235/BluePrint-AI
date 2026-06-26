-- Phase 3: AI Gateway & Architecture Orchestrator extensions

ALTER TABLE ai_logs
    ADD COLUMN IF NOT EXISTS correlation_id UUID,
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS task_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS generator_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(12, 6),
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS prompt_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_ai_logs_correlation_id ON ai_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_project_id ON ai_logs(project_id);

CREATE TABLE architecture_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    correlation_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    system_description TEXT NOT NULL,
    system_type VARCHAR(100),
    current_step VARCHAR(100),
    progress_percent SMALLINT NOT NULL DEFAULT 0,
    architecture_payload JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_architecture_generations_project_id ON architecture_generations(project_id);
CREATE INDEX idx_architecture_generations_user_id ON architecture_generations(user_id);
CREATE INDEX idx_architecture_generations_status ON architecture_generations(status);

CREATE TABLE prompt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    prompt_id VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(20) NOT NULL,
    generator_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    variables JSONB NOT NULL DEFAULT '{}',
    rendered_system_prompt TEXT,
    rendered_user_prompt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_logs_correlation_id ON prompt_logs(correlation_id);
