-- Flyway Migration: V5__Remove_sender_name_from_newsletters.sql
-- newsletters 테이블에서 sender_name 컬럼 제거

ALTER TABLE newsletters DROP COLUMN IF EXISTS sender_name;

