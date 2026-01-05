-- Flyway Migration: V6__Remove_timezone_default_from_newsletters.sql
-- newsletters 테이블의 timezone 컬럼에서 DEFAULT 'Asia/Seoul' 제거

ALTER TABLE newsletters
ALTER COLUMN timezone DROP DEFAULT;

