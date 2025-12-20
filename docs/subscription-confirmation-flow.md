# 구독 인증 플로우 설계

## 현재 상황 분석

### 문제점
1. **이메일 링크**: `http://localhost:3000/@{username}/{newsletterSlug}/confirm?token=...`
2. **프론트엔드 페이지 없음**: 해당 경로를 처리하는 페이지가 존재하지 않음
3. **API 엔드포인트**: `/api/public/subscribe/confirm?token=...` (정상 작동)

## 권장 플로우 설계

### 1. 전체 플로우

```
[사용자] → [공개 페이지에서 구독 신청]
    ↓
[백엔드] → [PENDING 상태로 구독자 생성]
    ↓
[백엔드] → [인증 토큰 생성 및 이메일 발송]
    ↓
[사용자] → [이메일에서 링크 클릭]
    ↓
[프론트엔드] → [확인 페이지 로드] → [토큰 추출]
    ↓
[프론트엔드] → [API 호출: GET /api/public/subscribe/confirm?token=...]
    ↓
[백엔드] → [토큰 검증 및 PENDING → ACTIVE 변경]
    ↓
[프론트엔드] → [성공 페이지 표시]
```

### 2. 프론트엔드 페이지 구조

**경로**: `/@{username}/{newsletterSlug}/confirm`

**기능**:
1. URL에서 `token` 쿼리 파라미터 추출
2. 로딩 상태 표시
3. API 호출 (`confirmSubscription(token)`)
4. 성공/실패에 따른 UI 표시

### 3. 구현 단계

#### Step 1: 프론트엔드 확인 페이지 생성
- 파일: `apps/web/src/app/(public)/[username]/[newsletterSlug]/confirm/page.tsx`
- 기능:
  - `useSearchParams`로 토큰 추출
  - `confirmSubscription` API 호출
  - 성공/실패 메시지 표시
  - 성공 시 뉴스레터 페이지로 링크 제공

#### Step 2: 이메일 링크 URL 확인 (현재 정상)
- 현재: `$frontendUrl/$username/${newsletter.slug}/confirm?token=$confirmationToken`
- 이대로 유지 가능

#### Step 3: API 엔드포인트 확인 (현재 정상)
- 현재: `GET /api/public/subscribe/confirm?token={token}`
- 이대로 유지 가능

### 4. 상세 구현 계획

#### 프론트엔드 페이지 (`confirm/page.tsx`)

```typescript
// 1. URL에서 토큰 추출
const searchParams = useSearchParams();
const token = searchParams.get('token');

// 2. API 호출
useEffect(() => {
  if (token) {
    confirmSubscription(token)
      .then(() => {
        // 성공 처리
      })
      .catch((error) => {
        // 실패 처리
      });
  }
}, [token]);

// 3. UI 표시
// - 로딩: "구독을 확인하는 중..."
// - 성공: "구독이 확인되었습니다!" + 뉴스레터 페이지 링크
// - 실패: "유효하지 않거나 만료된 링크입니다" + 재구독 안내
```

#### 백엔드 API (현재 구현 확인)
- ✅ `GET /api/public/subscribe/confirm?token={token}` 구현됨
- ✅ 토큰 검증 및 상태 변경 로직 구현됨

### 5. 추가 고려사항

#### 에러 처리
- **토큰 없음**: "링크가 올바르지 않습니다"
- **토큰 만료**: "링크가 만료되었습니다. 다시 구독해주세요"
- **이미 확인됨**: "이미 구독이 확인되었습니다"
- **구독 취소됨**: "구독이 취소되었습니다. 다시 구독해주세요"

#### UX 개선
- 성공 시 자동 리다이렉트 (3초 후 뉴스레터 페이지로)
- 실패 시 재구독 버튼 제공
- 로딩 애니메이션

### 6. 구현 체크리스트

- [ ] 프론트엔드 확인 페이지 생성 (`confirm/page.tsx`)
- [ ] 토큰 추출 로직
- [ ] API 호출 로직
- [ ] 성공 UI
- [ ] 실패 UI
- [ ] 로딩 상태
- [ ] 에러 처리
- [ ] 자동 리다이렉트 (선택)

### 7. 대안 플로우 (API 직접 리다이렉트)

만약 프론트엔드 페이지 없이 처리하고 싶다면:

**이메일 링크 변경**:
```
$frontendUrl/api/public/subscribe/confirm?token=$confirmationToken
```

**백엔드 API 수정**:
- 성공 시: `302 Redirect` → `$frontendUrl/$username/${newsletter.slug}?confirmed=true`
- 실패 시: `302 Redirect` → `$frontendUrl/$username/${newsletter.slug}?error=invalid_token`

하지만 이 방식은 **권장하지 않음**:
- API가 프론트엔드 URL 구조를 알아야 함
- 에러 메시지 전달이 제한적
- UX가 좋지 않음

## 최종 권장사항

**프론트엔드 확인 페이지를 생성하는 방식**을 권장합니다.

1. 이메일 링크는 현재대로 유지
2. 프론트엔드에 `/@{username}/{newsletterSlug}/confirm` 페이지 생성
3. 페이지에서 토큰 추출 → API 호출 → 결과 표시

