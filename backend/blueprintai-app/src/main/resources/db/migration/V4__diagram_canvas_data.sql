-- Canvas snapshot storage for diagram persistence and future collaboration.
ALTER TABLE diagrams
    ADD COLUMN IF NOT EXISTS canvas_data JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS version_metadata JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN diagrams.canvas_data IS 'React Flow canvas snapshot: nodes, edges, viewport';
COMMENT ON COLUMN diagrams.version_metadata IS 'Version tracking for conflict detection and recovery';
