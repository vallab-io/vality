-- Flyway Migration: V2__Add_like_count_to_issues.sql
-- issues 테이블에 like_count 컬럼 추가

-- like_count 컬럼 추가 (기본값 0)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS like_count BIGINT NOT NULL DEFAULT 0;

-- 기존 레코드의 like_count를 0으로 설정 (이미 DEFAULT 0이지만 명시적으로)
UPDATE issues 
SET like_count = 0 
WHERE like_count IS NULL;

