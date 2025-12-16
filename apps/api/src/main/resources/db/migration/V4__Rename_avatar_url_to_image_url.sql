-- Flyway Migration: V4__Rename_avatar_url_to_image_url.sql
-- users 테이블의 avatar_url 컬럼을 image_url로 변경

-- ============================================
-- users 테이블 컬럼명 변경
-- ============================================
ALTER TABLE users RENAME COLUMN avatar_url TO image_url;

