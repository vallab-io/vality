# MVP 간소화 계획

**목표**: 빠른 출시를 위한 최소 기능 집중

---

## ✅ 유지할 핵심 기능 (MVP)

### 1. 사용자 인증 (완료 ✅)
- 이메일 인증 로그인/회원가입
- Google OAuth
- 프로필 관리

### 2. 뉴스레터 작성 및 발행
- **에디터**: TipTap 기반 (이미 구현됨)
- **뉴스레터 생성/관리**: 기본 CRUD
- **이슈 작성/발행**: 
  - 제목, 본문 작성
  - 이미지 업로드 (기본 - S3 연동 최소화)
  - 발행 버튼 → 웹에 게시
  - **이메일 발송은 Phase 2로 미루기** ⚠️

### 3. 웹 아카이빙 (핵심)
- `/@{username}` 프로필 페이지
- `/@{username}/{newsletterSlug}` 뉴스레터 페이지
- `/@{username}/{newsletterSlug}/{issueSlug}` 이슈 페이지
- 기본 SEO (메타태그, OG 태그만)

### 4. 구독 기능 (최소화)
- **구독 신청**: 이메일만 입력, 더블 옵트인 없음
- **구독 취소**: 구독 해제 링크 (이메일 없이도)
- **구독자 목록**: 기본 목록만 (통계 없음)

---

## ❌ 제거/미루기 (Phase 2+)

### 즉시 제거
1. **유료 구독/결제 시스템**
   - `/dashboard/subscription` 페이지 제거 또는 숨김
   - Pricing 페이지는 유지하되 "Coming Soon" 표시
   - 대시보드에서 구독 관련 메뉴 제거

2. **상세 통계/분석**
   - Analytics 페이지 제거 또는 최소화 (구독자 수만 표시)
   - 오픈율, 클릭율 등 추적 기능 미구현
   - EmailLog 관련 기능 미구현

3. **구독자 세그먼트**
   - 세그먼트 기능 제거
   - 기본 목록만 유지

4. **Bio 기능**
   - Phase 2로 완전 미루기

### Phase 2로 미루기
1. **이메일 발송**
   - 발행 시 웹에만 게시
   - 구독자에게 이메일 발송은 나중에 추가

2. **예약 발행**
   - 즉시 발행만 지원

3. **이미지 업로드 고도화**
   - 기본 S3 업로드만
   - 리사이징, WebP 변환 등은 나중에

4. **고급 SEO**
   - 기본 메타태그, OG 태그만
   - 구조화 데이터, RSS는 Phase 2

5. **구독 위젯 임베드**
   - 기본 구독 폼만
   - 커스터마이징은 나중에

---

## 📋 구현 우선순위 (MVP)

### Phase 1 - MVP 핵심 (1-2주)

#### 백엔드 API
1. ✅ 사용자 인증 API (완료)
2. ⬜ Newsletter CRUD API
   - GET /api/newsletters (내 뉴스레터 목록)
   - POST /api/newsletters (뉴스레터 생성)
   - GET /api/newsletters/:id
   - PATCH /api/newsletters/:id
   - DELETE /api/newsletters/:id

3. ⬜ Issue CRUD API
   - GET /api/newsletters/:id/issues (이슈 목록)
   - POST /api/newsletters/:id/issues (이슈 생성)
   - GET /api/issues/:id
   - PATCH /api/issues/:id
   - DELETE /api/issues/:id
   - POST /api/issues/:id/publish (발행 - 웹에 게시)

4. ⬜ 공개 조회 API
   - GET /api/public/users/:username
   - GET /api/public/users/:username/newsletters/:slug
   - GET /api/public/issues/:id (이미 구현됨?)

5. ⬜ 구독자 API (최소화)
   - POST /api/subscribers (구독 신청)
   - GET /api/subscribers (내 뉴스레터의 구독자 목록)
   - DELETE /api/subscribers/:id (구독 취소 - 관리자용)
   - GET /api/subscribers/unsubscribe/:token (구독 취소 링크)

#### 프론트엔드
1. ✅ 에디터 UI (완료)
2. ⬜ 뉴스레터 작성/편집 페이지 API 연동
3. ⬜ 이슈 작성/편집 페이지 API 연동
4. ⬜ 발행 기능 연동 (웹 게시만)
5. ✅ 공개 페이지들 (UI 완료, API 연동 필요)

---

## 🔧 코드 정리 작업

### 제거/숨김 대상
1. `/dashboard/subscription` 페이지 → 숨김 또는 제거
2. `/dashboard/newsletters/[id]/analytics` → 최소화 (구독자 수만)
3. 대시보드 사이드바에서 구독 관리 메뉴 제거
4. Pricing 페이지에 "Coming Soon" 표시
5. 통계 관련 코드 제거 또는 주석 처리

### 최소화 대상
1. Analytics 페이지: 구독자 수만 표시
2. 구독자 페이지: 목록만, 통계 없음
3. 이메일 관련 코드: 주석 처리 (나중을 위해)

---

## 📊 MVP 체크리스트

### 필수 기능
- [x] 사용자 인증
- [ ] 뉴스레터 CRUD
- [ ] 이슈 CRUD
- [ ] 이슈 발행 (웹 게시)
- [ ] 공개 프로필/뉴스레터/이슈 페이지
- [ ] 기본 구독 기능 (신청/취소)
- [ ] 구독자 목록 (기본)

### 미포함 기능 (Phase 2)
- [ ] 이메일 발송
- [ ] 통계/분석
- [ ] 유료 구독
- [ ] 예약 발행
- [ ] Bio 기능
- [ ] 고급 SEO (RSS, 구조화 데이터)

---

## 🎯 출시 기준

1. 사용자가 뉴스레터를 작성하고 발행할 수 있음
2. 발행된 이슈가 웹에서 공개적으로 볼 수 있음
3. 방문자가 뉴스레터를 구독할 수 있음 (이메일만)
4. 기본 SEO가 적용되어 검색 엔진에 노출됨

---

## 다음 단계

1. **백엔드 API 구현** (Newsletter, Issue CRUD)
2. **프론트엔드 API 연동** (에디터 ↔ 백엔드)
3. **발행 기능 구현** (웹 게시)
4. **구독 기능 구현** (최소화 버전)
5. **불필요한 기능 제거/숨김**
6. **테스트 및 버그 수정**
7. **출시!**

