# 개발 작업 순서 (Task List)

> **개발 방식**: Frontend First (UI 먼저 → 백엔드 나중에)
> **디자인 참조**: [Buttondown](https://buttondown.com)
> **컬러**: 파란색 계열 (Primary: #2563EB, Accent: #38BDF8)

---

## ✅ 완료된 작업

### 프로젝트 초기 설정
- [x] 기획 문서 작성 (docs/)
- [x] Next.js 프로젝트 초기화 (apps/web)
- [x] Ktor API 프로젝트 초기화 (apps/api)
- [x] shadcn/ui 설정
- [x] 기본 페이지 스켈레톤
- [x] Docker Compose 설정

### 백엔드 기본 설정
- [x] Ktor 기본 설정 (Serialization, CORS, StatusPages 등)
- [x] Exposed ORM 설정 (PostgreSQL + HikariCP)
- [x] Flyway 마이그레이션 설정
- [x] Koin DI 설정 (모듈 분리: ConfigModule, RepositoryModule, AwsModule, ServiceModule)
- [x] Health API 구현
- [x] OpenAPI/Swagger 문서화

### 도메인 모델 & Repository
- [x] User 도메인 및 Repository 구현
- [x] Account 도메인 및 Repository 구현
- [x] VerificationCode 도메인 및 Repository 구현
- [x] RefreshToken 도메인 및 Repository 구현
- [x] Newsletter 도메인 및 Repository 구현
- [x] Issue 도메인 및 Repository 구현
- [x] Subscriber 도메인 및 Repository 구현
- [x] EmailLog 도메인 및 Repository 구현

---

## 🎨 Phase 1: 디자인 시스템 & 기본 레이아웃

### Step 1: 디자인 시스템 설정 ✅
```
예상 시간: 2-3시간
```

- [x] 컬러 팔레트 설정 (globals.css)
  - [x] 파란색 계열 컬러 팔레트 (Primary: #2563EB, Accent: #38BDF8)
  - [x] Notion 스타일 따뜻한 모던 테마
- [x] 타이포그래피 설정
  - [x] Geist 폰트 (깔끔한 산세리프)
- [x] 다크모드 지원

**결과물**: 파란색 계열 모던 디자인 시스템 ✅

---

### Step 2: 랜딩 페이지 ✅
```
예상 시간: 3-4시간
```

- [x] 히어로 섹션
  - [x] 헤드라인 + 서브헤드라인
  - [x] 그라데이션 효과
  - [x] CTA 버튼 (시작하기)
- [x] 기능 소개 섹션
- [x] 사용 방법 섹션
- [x] CTA 섹션
- [x] 푸터

**참조**: Buttondown + Notion 스타일 ✅

---

### Step 3: 공통 레이아웃 & 네비게이션 ✅
```
예상 시간: 2-3시간
```

- [x] 헤더 컴포넌트 (랜딩)
- [x] 사이드바 (대시보드용)
- [x] 모바일 메뉴 (햄버거)
- [x] 공통 컴포넌트 분리
- [x] 로그아웃 기능 (홈화면으로 이동)

---

## 🔐 Phase 2: 인증 UI

### Step 4: 로그인/회원가입 페이지 ✅
```
예상 시간: 2-3시간
```

- [x] 로그인 페이지 UI
  - [x] 미니멀한 폼 디자인
  - [x] 에러 메시지 (toast)
  - [x] 로딩 상태
- [x] 회원가입 페이지 UI
  - [x] username 미리보기
- [x] 이메일 인증 코드 입력 폼
  - [x] 6자리 코드 입력 (자동 포커스, 붙여넣기 지원)
  - [x] 코드 재발송 기능
  - [x] 자동 제출
- [x] Google OAuth 로그인
- [x] 프론트엔드 API 연동 완료

---

## 📊 Phase 3: 대시보드 UI

### Step 5: 대시보드 메인 ✅
```
예상 시간: 3-4시간
```

- [x] 통계 카드
  - [x] 총 구독자 수
  - [x] 발행된 뉴스레터 수
  - [x] 임시저장 수
- [x] 최근 뉴스레터 목록 (목업 데이터)
  - [x] 상태 뱃지 (발행됨/임시저장)
  - [x] 발행일, 오픈율 표시
- [x] 빠른 작성 버튼
- [x] 빠른 액션 카드
- [x] 빈 상태 UI (첫 사용자용)

**목업 데이터**: 하드코딩된 샘플 데이터 사용 ✅

---

### Step 6: 뉴스레터 목록 페이지 ✅
```
예상 시간: 2-3시간
```

- [x] 뉴스레터 리스트 테이블/카드
  - [x] 제목, 상태, 날짜
  - [x] 상태 뱃지 (초안/발행됨)
- [x] 필터 (전체/초안/발행됨)
- [x] 정렬 (최신순/오래된순)
- [x] 페이지네이션
- [x] 빈 상태 UI

---

### Step 7: 뉴스레터 작성/편집 페이지 ✅
```
예상 시간: 6-8시간
```

- [x] 에디터 설치 및 설정 (TipTap)
- [x] 에디터 툴바
  - [x] 헤딩 (H1, H2, H3)
  - [x] 볼드, 이탤릭, 밑줄
  - [x] 링크 삽입
  - [x] 이미지 삽입 (URL)
  - [x] 인용구, 코드 블록
  - [x] 리스트 (순서/비순서)
- [x] 제목 입력
- [x] 미리보기 모드
- [x] 저장/발행 버튼

---

### Step 8: 구독자 관리 페이지 ✅
```
예상 시간: 2-3시간
```

- [x] 구독자 리스트 테이블
  - [x] 이메일, 상태, 구독일
- [x] 상태 필터 (활성/대기/취소)
- [x] 구독자 검색
- [x] 구독자 추가 (수동)
- [x] 구독자 삭제
- [x] CSV 내보내기 버튼 (UI만)

---

### Step 9: 설정 페이지 ✅
```
예상 시간: 2-3시간
```

- [x] 프로필 설정 탭
  - [x] 이름, 소개, username 수정
  - [x] Username 중복 확인
  - [x] 프로필 이미지 업로드 (S3 Presigned URL)
  - [x] 프로필 이미지 삭제
  - [x] 프로필 업데이트 API 연동
- [x] 뉴스레터 설정 탭
  - [x] 뉴스레터 이름
  - [x] 설명
- [x] 계정 설정 탭
  - [x] 계정 삭제
  - [x] 계정 삭제 확인 팝업
  - [x] 계정 삭제 API 연동

---

## 🌐 Phase 4: 공개 페이지 UI

### Step 10: 사용자 프로필 페이지 (`/@[username]`) ✅
```
예상 시간: 3-4시간
```

- [x] 프로필 헤더
  - [x] 프로필 이미지 (UserAvatar)
  - [x] 이름, 소개, @username
- [x] 뉴스레터 소개 (이름, 설명, 구독자 수)
- [x] 구독 폼 (이메일 입력 → 구독 완료 상태)
- [x] 발행된 뉴스레터 목록 (목업 데이터)
- [x] 반응형 디자인

**목업 사용자**: johndoe, jane

---

### Step 11: 뉴스레터 상세 페이지 (`/@[username]/[slug]`) ✅
```
예상 시간: 3-4시간
```

- [x] 뉴스레터 헤더
  - [x] 제목, 발행일
  - [x] 작성자 정보 (아바타, 이름)
- [x] 본문 렌더링 (간단한 마크다운 파싱)
- [x] 공유 버튼 (트위터, 링크 복사)
- [x] 하단 구독 CTA
- [x] 이전/다음 글 네비게이션

**목업 뉴스레터**: design-trends-2025, productivity-tips

---

### Step 12: 구독 위젯 컴포넌트 ✅
```
예상 시간: 1-2시간
```

- [x] 임베드 가능한 구독 폼
- [x] 성공/에러 메시지
- [x] 로딩 상태

---

## 🔌 Phase 5: 백엔드 개발 & 연동

### Step 13: 데이터베이스 & 기본 설정 ✅
```
예상 시간: 2-3시간
```

- [x] Ktor 프로젝트 초기화
- [x] Exposed ORM 설정 (PostgreSQL + HikariCP)
- [x] Flyway 마이그레이션 설정
- [x] Koin DI 설정 (모듈 분리 완료)
- [x] 기본 플러그인 설정 (Serialization, CORS, StatusPages 등)
- [x] Health API 구현
- [x] 모든 도메인 모델 구현 (User, Newsletter, Issue, Subscriber, Account, VerificationCode, RefreshToken, EmailLog)

**기술 스택**: Ktor 2.3.12, Exposed 1.0.0-rc-4, Flyway 10.9.1, Koin 3.5.6 ✅

---

### Step 14: 인증 API (Ktor) ✅
```
예상 시간: 4-6시간
```

- [x] JWT 인증 플러그인 설정
- [x] 인증 라우팅 구현 (`/api/auth`)
- [x] 회원가입 API (이메일 인증 방식)
  - [x] 이메일 인증 코드 발송 API (`/api/auth/send-verification-code`)
  - [x] 이메일 인증 로그인/회원가입 통합 API (`/api/auth/email-auth`)
  - [x] 인증 코드 이메일 발송 (AWS SES)
- [x] 소셜 로그인 API (Google OAuth)
  - [x] Google OAuth 인증 플로우 (`/api/auth/google/init`, `/api/auth/google/complete`)
  - [x] OAuth State 관리 (InMemoryOAuthStateStore)
  - [x] Google 프로필 이미지 S3 업로드
- [x] 내 정보 조회 API (`GET /api/auth/me`)
- [x] 토큰 갱신 API (`POST /api/auth/refresh`)
- [x] 프로필 업데이트 API (`PATCH /api/auth/me`)
  - [x] 프로필 이미지 업로드 지원 (S3)
  - [x] 프로필 이미지 삭제 지원
- [x] 계정 삭제 API (`DELETE /api/auth/me`)
- [x] Username 중복 확인 API (`GET /api/auth/check-username`)
- [x] 프론트엔드 연동
  - [x] 이메일 인증 로그인/회원가입
  - [x] Google OAuth 로그인
  - [x] Refresh Token 자동 갱신
  - [x] 인증 상태 관리 (Jotai)

**참고**: Account, VerificationCode, RefreshToken 도메인 모델 구현 완료 ✅

---

### Step 15: 뉴스레터 API ⬜
```
예상 시간: 4-5시간
```

- [x] Newsletter 도메인 모델 구현
- [x] NewsletterRepository 구현
- [ ] Newsletter 라우팅 구현 (`/api/newsletters`)
- [ ] CRUD API
  - [ ] 뉴스레터 생성 API
  - [ ] 뉴스레터 목록 조회 API (내 뉴스레터)
  - [ ] 뉴스레터 상세 조회 API
  - [ ] 뉴스레터 수정 API
  - [ ] 뉴스레터 삭제 API
- [ ] 공개 조회 API (`/api/public/@[username]/[slug]`)
- [ ] 프론트엔드 연동

---

### Step 16: 구독자 API ⬜
```
예상 시간: 3-4시간
```

- [x] Subscriber 도메인 모델 구현
- [x] SubscriberRepository 구현
- [ ] Subscriber 라우팅 구현 (`/api/subscribers`)
- [ ] 구독 신청 API (공개)
- [ ] 구독 확인 API (이메일 링크)
- [ ] 구독 취소 API
- [ ] 구독자 목록 API (인증 필요)
- [ ] 구독자 통계 API
- [ ] 프론트엔드 연동

---

### Step 17: 이슈(Issue) API ⬜
```
예상 시간: 4-5시간
```

- [x] Issue 도메인 모델 구현
- [x] IssueRepository 구현
- [ ] Issue 라우팅 구현 (`/api/issues`)
- [ ] CRUD API
  - [ ] 이슈 생성 API
  - [ ] 이슈 목록 조회 API
  - [ ] 이슈 상세 조회 API
  - [ ] 이슈 수정 API
  - [ ] 이슈 삭제 API
- [ ] 발행 API (상태 변경 + 이메일 발송)
- [ ] 예약 발행 API
- [ ] 공개 조회 API (`/api/public/@[username]/[slug]/[issueSlug]`)
- [ ] 프론트엔드 연동

---

### Step 18: 이메일 발송 🔄
```
예상 시간: 4-5시간
```

**완료된 작업:**
- [x] 이메일 발송 시스템 계획 완료 (AWS SES)
- [x] AWS SES 설정 가이드 작성
- [x] SES API 클라이언트 구현 (EmailService)
- [x] 이메일 템플릿 시스템 (EmailTemplates)
- [x] 인증 코드 이메일 발송 ✅
- [x] 이메일 발송 테스트 API (`POST /api/test/email`)

**미구현 작업:**
- [ ] Redis Streams 큐 시스템 구현
- [ ] Email Worker 구현 (같은 프로세스 코루틴)
- [ ] 뉴스레터 발송 API (구독자들에게 일괄 발송)
- [ ] 구독 확인 이메일
- [ ] 이메일 발송 로그 저장 (EmailLog)
- [ ] 프론트엔드 연동

**참고**: 
- 상세 구현 계획은 [email-system.md](./email-system.md) 참고
- AWS SES 설정 가이드: [aws-ses-setup-guide.md](./aws-ses-setup-guide.md)
- AWS SES 구현 가이드: [aws-ses-implementation-guide.md](./aws-ses-implementation-guide.md)

---

### Step 19: 파일 업로드 (S3) 🔄
```
예상 시간: 3-4시간
```

**완료된 작업:**
- [x] AWS S3 연동 (AWS SDK for Java v2)
- [x] S3Service 구현 (Presigned URL, 파일 업로드/삭제)
- [x] 이미지 업로드 API (`/api/upload/presigned-url`)
- [x] 프로필 이미지 업로드 지원
- [x] 프론트엔드 프로필 이미지 업로드 연동

**미구현 작업:**
- [ ] 이슈 이미지 업로드 지원
- [ ] 이미지 최적화 (선택)
- [ ] 프론트엔드 에디터 이미지 업로드 연동

**참고**: 
- AWS S3 설정 가이드: [s3-setup-guide.md](./s3-setup-guide.md)
- IAM 전략: [aws-iam-strategy.md](./aws-iam-strategy.md)

---

## 🎯 Phase 6: SEO & 마무리

### Step 20: SEO 최적화 ⬜
```
예상 시간: 3-4시간
```

- [ ] 동적 메타태그 (Next.js)
- [ ] OG 이미지 자동 생성
- [ ] 구조화 데이터 (JSON-LD)
- [ ] Sitemap 생성
- [ ] RSS 피드 생성

---

### Step 21: 최종 QA & 배포 ⬜
```
예상 시간: 4-6시간
```

- [ ] 전체 플로우 테스트
- [ ] 버그 수정
- [ ] 성능 최적화
- [ ] Vercel 배포 (프론트)
- [ ] Railway/Render/EC2 배포 (백엔드 Ktor)
- [ ] 데이터베이스 마이그레이션 자동화 (CI/CD)

---

## 🌍 Phase 7: 다국어 지원 (Localization)

### Step 22: 다국어 지원 ⬜
```
예상 시간: 4-6시간
```

**요구사항:**
- 기본 언어: 영어 (English)
- 지원 언어: 한국어 (Korean)
- URL 구조: `/ko/...` (한국어), `/` (영어, 기본)

**구현 작업:**
- [ ] Next.js i18n 설정
  - [ ] next-intl 또는 next-i18next 설정
  - [ ] 언어 감지 및 리다이렉트
  - [ ] URL 구조 설정 (`/ko/...`)
- [ ] 번역 파일 구조
  - [ ] `locales/en/` (영어)
  - [ ] `locales/ko/` (한국어)
- [ ] 주요 페이지 번역
  - [ ] 랜딩 페이지
  - [ ] 로그인/회원가입 페이지
  - [ ] 대시보드
  - [ ] 설정 페이지
  - [ ] 공개 페이지
- [ ] 언어 전환 UI
  - [ ] 헤더에 언어 선택 드롭다운
  - [ ] 언어별 URL 유지
- [ ] API 응답 메시지 다국어 지원 (선택)
  - [ ] 에러 메시지
  - [ ] 성공 메시지

**참고 라이브러리:**
- `next-intl` (권장) - Next.js App Router 최적화
- 또는 `next-i18next` - Pages Router 호환

---

## 📋 작업 순서 요약

```
✅ Phase 1: 디자인 시스템 & 레이아웃 (Step 1-3) - 완료
✅ Phase 2: 인증 UI (Step 4) - 완료
✅ Phase 3: 대시보드 UI (Step 5-9) - 완료
✅ Phase 4: 공개 페이지 UI (Step 10-12) - 완료
🔄 Phase 5: 백엔드 & 연동 (Step 13-19) - 진행 중
   ✅ Step 13: DB 설정 - 완료
   ✅ Step 14: 인증 API - 완료
   ✅ Step 18: 이메일 발송 (부분 완료)
   ✅ Step 19: 파일 업로드 (부분 완료)
   ⬜ Step 15: 뉴스레터 API - 미구현
   ⬜ Step 16: 구독자 API - 미구현
   ⬜ Step 17: 이슈 API - 미구현
⬜ Phase 6: SEO & 마무리 (Step 20-21) - 미구현
⬜ Phase 7: 다국어 지원 (Step 22) - 미구현
```

---

## 📝 변경된 계획

### 1. 디자인 시스템 변경
- **변경 전**: 오렌지 포인트 컬러
- **변경 후**: 파란색 계열 (Primary: #2563EB, Accent: #38BDF8)
- **이유**: 더 모던하고 전문적인 느낌

### 2. 프로필 서비스 추가 (향후 계획)
- **추가 기능**: 링크트리/Bento 스타일 프로필 서비스
- **통합 방식**: 기존 플랜에 포함 (가격 변경 없이)
- **플랜별 기능**:
  - Free: 기본 프로필 (링크 5개)
  - Starter: 프로필 (링크 20개, 외부 서비스 3개)
  - Pro: 프로필 전체 기능 (무제한)
- **참고**: [profile-service-pricing-strategy.md](./profile-service-pricing-strategy.md)

### 3. 이메일 발송 시스템 변경
- **변경 전**: Redis Streams 큐 시스템
- **변경 후**: AWS SES 직접 발송 (초기), 향후 큐 시스템 추가 예정
- **이유**: MVP 단계에서는 단순한 구조로 시작

### 4. 모듈 구조 개선
- **변경**: AppModule을 여러 모듈로 분리
  - ConfigModule
  - RepositoryModule
  - AwsModule
  - ServiceModule
- **이유**: 코드 가독성 및 유지보수성 향상

---

## 🎨 디자인 가이드라인

### 컬러 팔레트 (최종)
```css
/* Primary - 파란색 */
--primary: #2563EB;
--primary-foreground: #ffffff;

/* Accent - 시안 */
--accent: #38BDF8;
--accent-foreground: #ffffff;

/* Background */
--background: #F8FAFC;
--foreground: #1e293b;

/* Muted */
--muted: #f1f5f9;
--muted-foreground: #64748b;

/* Border */
--border: #e2e8f0;
```

### 디자인 원칙
1. **미니멀**: 불필요한 요소 제거
2. **여백 활용**: 충분한 공간감
3. **타이포그래피 중심**: 글자가 돋보이도록
4. **파란색 기반**: 모던하고 전문적인 느낌
5. **Buttondown 참조**: 깔끔하고 기능적인 UI

---

## 🚀 다음 우선 작업

### 즉시 구현 필요 (MVP 완성)
1. **뉴스레터 API** (Step 15)
   - CRUD API 구현
   - 프론트엔드 연동

2. **이슈 API** (Step 17)
   - CRUD API 구현
   - 발행 API 구현
   - 프론트엔드 연동

3. **구독자 API** (Step 16)
   - 구독 신청/취소 API
   - 구독자 목록 API
   - 프론트엔드 연동

4. **뉴스레터 발송 기능** (Step 18)
   - 구독자 일괄 발송 API
   - 이메일 템플릿

### 향후 구현 (Phase 7)
5. **다국어 지원** (Step 22)
   - next-intl 설정
   - 영어/한국어 번역
   - URL 구조 (`/ko/...`)

---

## 📊 진행률 요약

- **Frontend**: 약 85% 완료
- **Backend**: 약 40% 완료
  - 인증: 100% ✅
  - 이미지 업로드: 80% 🔄
  - 이메일 발송: 50% 🔄
  - 뉴스레터/이슈/구독자 API: 0% ⬜
- **전체**: 약 60% 완료
