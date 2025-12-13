-- Flyway Migration: V2__Update_id_columns_to_cuid_length.sql
-- CUID 길이에 맞춰 모든 ID 컬럼을 VARCHAR(26)에서 VARCHAR(25)로 변경
-- CUID는 소문자, URL-friendly, 약 25자입니다

-- V1에서 이미 VARCHAR(26)으로 생성된 경우를 대비해 VARCHAR(25)로 변경
-- CUID는 약 25자이므로 25자로 충분합니다

-- ============================================
-- users 테이블
-- ============================================
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(25);

-- ============================================
-- accounts 테이블
-- ============================================
ALTER TABLE accounts ALTER COLUMN id TYPE VARCHAR(25);
ALTER TABLE accounts ALTER COLUMN user_id TYPE VARCHAR(25);

-- ============================================
-- verification_codes 테이블
-- ============================================
ALTER TABLE verification_codes ALTER COLUMN id TYPE VARCHAR(25);

-- ============================================
-- newsletters 테이블
-- ============================================
ALTER TABLE newsletters ALTER COLUMN id TYPE VARCHAR(25);
ALTER TABLE newsletters ALTER COLUMN owner_id TYPE VARCHAR(25);

-- ============================================
-- issues 테이블
-- ============================================
ALTER TABLE issues ALTER COLUMN id TYPE VARCHAR(25);
ALTER TABLE issues ALTER COLUMN newsletter_id TYPE VARCHAR(25);

-- ============================================
-- subscribers 테이블
-- ============================================
ALTER TABLE subscribers ALTER COLUMN id TYPE VARCHAR(25);
ALTER TABLE subscribers ALTER COLUMN newsletter_id TYPE VARCHAR(25);

-- ============================================
-- email_logs 테이블
-- ============================================
ALTER TABLE email_logs ALTER COLUMN id TYPE VARCHAR(25);
ALTER TABLE email_logs ALTER COLUMN issue_id TYPE VARCHAR(25);
ALTER TABLE email_logs ALTER COLUMN subscriber_id TYPE VARCHAR(25);

