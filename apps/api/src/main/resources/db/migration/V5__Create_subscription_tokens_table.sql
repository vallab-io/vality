-- Flyway Migration: V5__Create_subscription_tokens_table.sql
-- 구독 확인 토큰을 위한 별도 테이블 생성

CREATE TABLE IF NOT EXISTS subscriber_verification_tokens (
    id VARCHAR(24) PRIMARY KEY,
    subscriber_id VARCHAR(24) NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriber_verification_tokens_token ON subscriber_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_subscriber_verification_tokens_subscriber_id ON subscriber_verification_tokens(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_verification_tokens_expires_at ON subscriber_verification_tokens(expires_at);

