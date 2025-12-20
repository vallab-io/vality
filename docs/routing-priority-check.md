# 라우팅 우선순위 및 @ 기호 사용 점검

## 문제 분석

### 1. 경로 문제: `/newsletter/subscriber/confirm`이 `/@newsletter/subscriber/confirm`으로 표시됨

**원인**:
- Next.js 라우팅에서 `(public)/[username]` 동적 라우트가 `newsletter` 정적 경로보다 먼저 매칭됨
- middleware에서 `/newsletter`가 시스템 경로로 처리되지 않아 `[username]` 라우트로 매칭됨

**해결**:
1. ✅ `newsletter` 폴더를 `(public)` 그룹 밖으로 이동 (`apps/web/src/app/newsletter/`)
2. ✅ middleware에서 `/newsletter`를 시스템 경로로 추가
3. ✅ `(public)/newsletter` 폴더 제거

### 2. @ 기호 사용 규칙

**규칙**: `@` 기호는 **오직 `@username` 형태에만** 사용되어야 함

**올바른 사용**:
- ✅ `@${username}` - 사용자 프로필 경로
- ✅ `/@${username}` - 사용자 프로필 링크
- ✅ `/@${username}/${newsletterSlug}` - 뉴스레터 링크
- ✅ `/@${username}/${newsletterSlug}/${issueSlug}` - 이슈 링크

**잘못된 사용**:
- ❌ `/@newsletter` - newsletter는 username이 아님
- ❌ `/@dashboard` - dashboard는 username이 아님
- ❌ 기타 시스템 경로에 `@` 사용

## 구현 변경 사항

### 1. Middleware 수정

```typescript
const SYSTEM_PATHS = [
  "/api",
  "/login",
  "/signup",
  "/onboarding",
  "/dashboard",
  "/pricing",
  "/blog",
  "/newsletter", // ✅ 추가: 구독 확인 등 시스템 경로
  "/_next",
  "/favicon.ico",
];
```

### 2. 폴더 구조 변경

**변경 전**:
```
apps/web/src/app/
  (public)/
    [username]/
    newsletter/  ❌ [username]보다 먼저 매칭되지 않음
```

**변경 후**:
```
apps/web/src/app/
  newsletter/  ✅ 루트 레벨로 이동
  (public)/
    [username]/  ✅ 가장 마지막에 매칭
```

### 3. 라우팅 우선순위

Next.js 라우팅 우선순위 (높은 순서):
1. 정적 경로 (루트 레벨)
2. Route Groups의 정적 경로
3. 동적 경로 `[param]`
4. Route Groups의 동적 경로

**현재 구조**:
1. `/newsletter` (루트 레벨 정적 경로) ✅ 최우선
2. `/@username` (Route Groups의 동적 경로) ✅ 마지막

## @ 기호 사용 점검 결과

### ✅ 올바른 사용 (사용자 프로필 관련)

1. **프로필 페이지 링크**
   - `apps/web/src/app/(public)/[username]/page.tsx`
   - `href={`/@${username}/${newsletter.slug}`}`
   - `href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}`

2. **뉴스레터 페이지 링크**
   - `apps/web/src/app/(public)/[username]/[newsletterSlug]/page.tsx`
   - `href={`/@${username}`}`
   - `href={`/@${username}/${newsletterSlug}/${issue.slug}`}`

3. **이슈 페이지 링크**
   - `apps/web/src/app/(public)/[username]/[newsletterSlug]/[issueSlug]/page.tsx`
   - `href={`/@${username}/${newsletterSlug}`}`
   - `href={`/@${username}`}`

4. **뉴스레터 리스트 컴포넌트**
   - `apps/web/src/app/(public)/[username]/_components/newsletter-list.tsx`
   - `href={`/@${username}/${newsletter.slug}`}`

### ✅ 시스템 경로 (올바름)

- `/newsletter/subscriber/confirm` - `@` 없음 ✅
- `/dashboard` - `@` 없음 ✅
- `/login` - `@` 없음 ✅
- `/signup` - `@` 없음 ✅

### ⚠️ 확인 필요

1. **대시보드 이슈 페이지**
   - `apps/web/src/app/(dashboard)/dashboard/newsletters/[newsletterId]/issues/page.tsx`
   - `href={`/@johndoe/${issue.slug}`}` - Mock 데이터이지만 실제 사용자명 사용 필요

## 최종 확인

### 라우팅 우선순위 ✅
- `/newsletter` → 루트 레벨 정적 경로 (최우선)
- `/@username` → Route Groups 동적 경로 (마지막)

### @ 기호 사용 ✅
- `@username` 형태만 사용
- 시스템 경로에는 `@` 없음

### Middleware ✅
- `/newsletter`가 시스템 경로로 추가됨
- `@username` 형태는 그대로 통과
- 나머지는 `@username`으로 리다이렉트

