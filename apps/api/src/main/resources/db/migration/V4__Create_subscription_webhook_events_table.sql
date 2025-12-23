-- Flyway Migration: V4__Create_subscription_webhook_events_table.sql
-- 구독 웹훅 이벤트 로그 테이블 생성

CREATE TABLE IF NOT EXISTS subscription_webhook_events (
    id VARCHAR(24) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    lemon_squeezy_event_id VARCHAR(255) UNIQUE,
    subscription_id VARCHAR(24),
    payload TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_lemon_squeezy_event_id ON subscription_webhook_events(lemon_squeezy_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription_id ON subscription_webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON subscription_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON subscription_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON subscription_webhook_events(created_at);

