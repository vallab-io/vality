-- Flyway Migration: V1__Create_all_tables.sql
-- 모든 데이터베이스 테이블 생성

-- ============================================
-- User - 사용자 (뉴스레터 발행자)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(25) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- ============================================
-- Account - 소셜 로그인 계정 (OAuth)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(25) PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ============================================
-- VerificationCode - 이메일 인증 코드
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id VARCHAR(25) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, code)
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- ============================================
-- Newsletter - 뉴스레터 (채널)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletters (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    sender_name VARCHAR(255),
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul',
    owner_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_newsletters_owner_id ON newsletters(owner_id);

-- ============================================
-- Issue - 뉴스레터 이슈 (개별 발행 글)
-- ============================================
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(25) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    newsletter_id VARCHAR(25) NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(newsletter_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_issues_newsletter_id ON issues(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_published_at ON issues(published_at);
CREATE INDEX IF NOT EXISTS idx_issues_newsletter_status ON issues(newsletter_id, status);

-- ============================================
-- Subscriber - 구독자
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id VARCHAR(25) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    newsletter_id VARCHAR(25) NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    UNIQUE(newsletter_id, email)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_newsletter_id ON subscribers(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_newsletter_status ON subscribers(newsletter_id, status);

-- ============================================
-- EmailLog - 이메일 발송 로그
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
    id VARCHAR(25) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issue_id VARCHAR(25) NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    subscriber_id VARCHAR(25) NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_logs_issue_id ON email_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber_id ON email_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- ============================================
-- updated_at 자동 업데이트 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- users 테이블 트리거
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- newsletters 테이블 트리거
DROP TRIGGER IF EXISTS update_newsletters_updated_at_trigger ON newsletters;
CREATE TRIGGER update_newsletters_updated_at_trigger
    BEFORE UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- issues 테이블 트리거
DROP TRIGGER IF EXISTS update_issues_updated_at_trigger ON issues;
CREATE TRIGGER update_issues_updated_at_trigger
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

