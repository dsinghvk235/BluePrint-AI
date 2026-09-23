-- Phase 5: Learning Engine persistence

CREATE TABLE learning_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    learning_mode VARCHAR(30) NOT NULL,
    layer_id VARCHAR(50),
    content JSONB NOT NULL DEFAULT '{}',
    source VARCHAR(20) NOT NULL DEFAULT 'knowledge',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_learning_explanations_lookup
    ON learning_explanations(project_id, node_id, learning_mode);

CREATE TABLE decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    component_label VARCHAR(255) NOT NULL,
    decision TEXT NOT NULL,
    reason TEXT,
    engineering_principle TEXT,
    assumptions JSONB NOT NULL DEFAULT '[]',
    alternatives JSONB NOT NULL DEFAULT '[]',
    tradeoffs JSONB NOT NULL DEFAULT '[]',
    potential_risks JSONB NOT NULL DEFAULT '[]',
    future_improvements JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decision_logs_project_node ON decision_logs(project_id, node_id);
