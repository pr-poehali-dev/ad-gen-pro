ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tags VARCHAR(500) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(32) DEFAULT 'new';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to BIGINT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(32) DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS admin_events (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT,
    event_type VARCHAR(64) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(100),
    description TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_tasks (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_user_id BIGINT,
    related_lead_id BIGINT,
    due_at TIMESTAMP,
    completed_at TIMESTAMP,
    priority VARCHAR(16) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_lifecycle ON users(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_admin_events_admin ON admin_events(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_admin ON admin_tasks(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due ON admin_tasks(due_at);

UPDATE users SET is_admin = TRUE WHERE LOWER(email) = 'atyurin2@yandex.ru';
