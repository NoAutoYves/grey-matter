CREATE TABLE IF NOT EXISTS error_logs (
    error_id    SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    level       VARCHAR(20) NOT NULL DEFAULT 'error',
    source      VARCHAR(50) NOT NULL DEFAULT 'app',
    message     TEXT NOT NULL,
    stack_trace TEXT,
    endpoint    VARCHAR(200),
    method      VARCHAR(10),
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    extra       JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level      ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_source     ON error_logs(source);