-- Flyway Migration: V9__Rename_excerpt_to_description.sql
-- Issue 테이블의 excerpt 컬럼을 description으로 변경
--
-- 변경 사항:
-- - issues.excerpt -> issues.description
-- - 기존 데이터는 그대로 유지

-- ============================================
-- 1. 컬럼명 변경
-- ============================================
ALTER TABLE issues RENAME COLUMN excerpt TO description;

-- ============================================
-- 참고사항
-- ============================================
-- 1. 컬럼명만 변경되며 데이터 타입과 제약조건은 동일합니다 (TEXT, nullable).
-- 2. 기존 데이터는 자동으로 유지됩니다.
-- 3. 애플리케이션 코드에서 excerpt를 description으로 변경해야 합니다.
