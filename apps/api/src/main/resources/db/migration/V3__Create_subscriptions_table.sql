-- Flyway Migration: V3__Create_subscriptions_table.sql
-- 구독 정보 테이블 생성

CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lemon_squeezy_subscription_id VARCHAR(255) UNIQUE,
    lemon_squeezy_order_id VARCHAR(255),
    plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_subscription_id ON subscriptions(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- 기존 사용자들에게 기본 FREE 플랜 할당
-- CUID 형식으로 ID 생성 (24자리)
INSERT INTO subscriptions (id, user_id, plan_type, status)
SELECT 
    'sub' || LPAD(SUBSTRING(MD5(RANDOM()::TEXT || id || NOW()::TEXT), 1, 21), 21, '0'),
    id,
    'FREE',
    'ACTIVE'
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE subscriptions.user_id = users.id
)
ON CONFLICT DO NOTHING;

