-- ============================================
-- Make issue slug nullable
-- DRAFT 상태일 때는 slug가 필요 없고, PUBLISHED 상태일 때만 필수
-- ============================================

-- 1. 기존 UNIQUE 제약조건 제거 (제약조건을 제거하면 자동으로 인덱스도 제거됨)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_newsletter_id_slug_key;

-- 2. slug 컬럼을 nullable로 변경
ALTER TABLE issues ALTER COLUMN slug DROP NOT NULL;

-- 3. Partial UNIQUE 인덱스 생성 (slug가 NULL이 아닌 경우에만 unique 제약조건 적용)
-- PostgreSQL에서는 NULL 값이 서로 다르게 간주되므로 여러 NULL 값이 허용됨
-- WHERE 절을 사용하여 slug가 NULL이 아닌 경우에만 unique 제약조건을 적용
CREATE UNIQUE INDEX IF NOT EXISTS issues_newsletter_id_slug_key 
ON issues (newsletter_id, slug) 
WHERE slug IS NOT NULL;

-- 참고: 
-- - WHERE 절을 사용하여 NULL 값이 아닌 경우에만 unique 제약조건을 적용
-- - 같은 newsletter_id 내에서 slug가 NULL인 이슈는 여러 개 생성 가능
-- - slug가 있는 경우에는 중복되지 않도록 함 (애플리케이션 레벨에서도 검증)

