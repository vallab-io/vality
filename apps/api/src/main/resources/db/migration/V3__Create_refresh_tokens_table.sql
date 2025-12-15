-- Flyway Migration: V3__Create_refresh_tokens_table.sql
-- RefreshToken 테이블 생성

-- ============================================
-- RefreshToken - 리프레시 토큰
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- 만료된 토큰 자동 정리 (선택사항)
-- 주기적으로 실행할 수 있는 쿼리:
-- DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP;

