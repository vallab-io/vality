# 기술 스택 및 아키텍처 (Tech Stack)

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         클라이언트                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   웹 앱      │  │   이메일     │  │  RSS Reader  │          │
│  │  (Next.js)   │  │   클라이언트  │  │              │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Ktor)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         REST API + OpenAPI (Swagger)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      비즈니스 로직                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ 뉴스레터   │  │ 구독자     │  │   SEO      │  │  인증    │  │
│  │ 서비스     │  │ 서비스     │  │  서비스    │  │ 서비스   │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      외부 서비스                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Database  │  │   Email    │  │   Storage  │  │   CDN    │  │
│  │ (Postgres) │  │  (AWS SES) │  │  (AWS S3)  │  │CloudFront│  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│  ┌────────────┐  ┌────────────┐                                │
│  │   Redis    │  │   Queue    │                                │
│  │  (Streams) │  │  (Streams) │                                │
│  └────────────┘  └────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 기술 스택 상세

### Frontend

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **Next.js 15** | 프레임워크 | 최신 App Router, SSR/SSG로 SEO 최적화 |
| **TypeScript** | 언어 | 타입 안정성, 개발 생산성 |
| **TailwindCSS** | 스타일링 | 빠른 UI 개발, 일관된 디자인 |
| **shadcn/ui** | UI 컴포넌트 | 커스터마이징 용이, 접근성 |
| **TipTap** | 에디터 | 리치 텍스트 에디터 (뉴스레터 작성) |
| **React Query** | 데이터 페칭 | 서버 데이터 캐싱, 요청 상태 관리 |
| **Jotai v2** | 상태 관리 | 직관적인 전역 상태 관리, 가벼움 |
| **Axios** | HTTP 클라이언트 | API 호출, 인터셉터 지원 |

### Backend

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **Ktor 2.3.12** | API 서버 | Kotlin 네이티브, 코루틴 지원, 가벼움 |
| **Kotlin** | 언어 | JVM 기반, 코루틴으로 비동기 처리 |
| **Exposed 1.0.0-rc-4** | ORM | Kotlin DSL, 타입 안전한 DB 접근 |
| **PostgreSQL 15** | 데이터베이스 | 안정성, 확장성, 관계형 데이터 처리 |
| **Flyway 10.9.1** | 마이그레이션 | DB 스키마 버전 관리 |
| **Koin 3.5.6** | DI | Kotlin 네이티브 의존성 주입 |
| **JWT** | 인증 | Stateless 인증, 토큰 기반 |
| **OpenAPI (Swagger)** | API 문서화 | API 스펙, 자동 문서 생성 |

### Infrastructure

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **Docker** | 컨테이너 | 일관된 개발/배포 환경 구성 |
| **Docker Compose** | 로컬 개발 | PostgreSQL, Redis 통합 관리 |
| **AWS SES** | 이메일 발송 | 비용 효율적, EC2 발송 시 무료 |
| **Redis 7** | 캐싱/큐 | Streams 큐, 캐싱, Rate Limiting |
| **AWS S3** | 파일 스토리지 | 이미지/첨부파일 저장 (예정) |
| **AWS CloudFront** | CDN | 빠른 콘텐츠 전송, 캐싱 (예정) |
| **Vercel** | 프론트엔드 호스팅 | Next.js 최적화, 간편한 배포 |
| **Railway/Render/EC2** | 백엔드 호스팅 | Ktor 서버 배포 |

### 인증 & 보안

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **JWT** | 토큰 인증 | Stateless 인증, 백엔드 연동 |
| **Refresh Token** | 토큰 갱신 | 장기 인증 유지, 보안 강화 |
| **Google OAuth2** | 소셜 로그인 | 간편한 로그인, 사용자 경험 |
| **이메일 인증** | 회원가입/로그인 | 비밀번호 없는 인증 |

### External Services

| 서비스 | 용도 | 대안 |
|--------|------|------|
| **AWS SES** | 이메일 발송 | Resend, SendGrid |
| **Google OAuth** | 소셜 로그인 | Apple, GitHub |
| **Redis Streams** | 메시지 큐 | RabbitMQ, Kafka |

---

## 📁 프로젝트 구조

### 모노레포 구조

```
vality/
├── apps/
│   ├── web/                       # Next.js 15 프론트엔드
│   │   ├── src/
│   │   │   ├── app/               # App Router
│   │   │   │   ├── (auth)/        # 인증 페이지
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   ├── onboarding/
│   │   │   │   │   └── auth/google/callback/
│   │   │   │   ├── (dashboard)/   # 대시보드 (로그인 필요)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── newsletters/
│   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── subscribers/
│   │   │   │   │   └── settings/
│   │   │   │   ├── (public)/      # 공개 페이지
│   │   │   │   │   └── [username]/
│   │   │   │   │       └── [newsletterSlug]/
│   │   │   │   └── (marketing)/   # 마케팅 페이지
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn/ui 컴포넌트
│   │   │   │   └── providers/     # Jotai, React Query Provider
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api/           # API 클라이언트
│   │   │   │   └── utils/         # 공통 유틸리티
│   │   │   │
│   │   │   └── stores/            # Jotai atoms
│   │   │
│   │   └── package.json
│   │
│   └── api/                       # Ktor 백엔드
│       ├── src/main/kotlin/io/vality/
│       │   ├── domain/            # 도메인 모델
│       │   │   ├── User.kt
│       │   │   ├── Newsletter.kt
│       │   │   ├── Issue.kt
│       │   │   ├── Subscriber.kt
│       │   │   └── ...
│       │   ├── repository/        # 데이터 접근 계층
│       │   │   ├── UserRepository.kt
│       │   │   ├── NewsletterRepository.kt
│       │   │   └── ...
│       │   ├── service/           # 비즈니스 로직
│       │   │   ├── AuthService.kt
│       │   │   ├── email/         # 이메일 발송 서비스
│       │   │   └── ...
│       │   ├── routing/           # API 라우팅
│       │   │   ├── auth/
│       │   │   ├── docs/
│       │   │   └── health/
│       │   ├── plugins/           # Ktor 플러그인
│       │   │   ├── DatabasePlugin.kt
│       │   │   ├── JWTPlugin.kt
│       │   │   ├── CORSPlugin.kt
│       │   │   └── LoggingPlugin.kt
│       │   └── di/                # Koin DI 설정
│       │
│       ├── src/main/resources/
│       │   ├── db/migration/      # Flyway 마이그레이션
│       │   └── logback.xml       # 로깅 설정
│       │
│       └── build.gradle.kts
│
├── docs/                          # 프로젝트 문서
├── docker-compose.yml            # 로컬 개발 환경
└── readme.md
```

---

## 🔧 개발 환경 설정

### 필수 요구사항

- Java 17+
- Kotlin 1.9+
- Node.js 18+
- Docker Desktop
- PostgreSQL 15+ (Docker로 실행)
- Redis 7+ (Docker로 실행)

### 환경 변수

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000

# apps/api/.env
DATABASE_URL="postgresql://vality:vality_password@localhost:5432/vality_db"
JWT_SECRET="your-jwt-secret"
JWT_ISSUER="vality"
JWT_AUDIENCE="vality-users"
FRONTEND_URL="http://localhost:3000"

# AWS SES
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-northeast-2"
SES_FROM_EMAIL="noreply@vality.io"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
```

### 개발 명령어

```bash
# Docker 컨테이너 시작
docker-compose up -d

# 백엔드 개발 서버 시작
cd apps/api
./gradlew run

# 프론트엔드 개발 서버 시작
cd apps/web
npm run dev

# DB 마이그레이션
cd apps/api
./gradlew flywayMigrate
```

---

## 📈 확장성 고려

### Phase 1 (MVP)
- Vercel (프론트엔드) + Railway/Render (백엔드)
- 단일 PostgreSQL 인스턴스
- Redis (로컬 또는 클라우드)
- 소규모 트래픽 처리

### Phase 2 (성장)
- AWS EC2 또는 ECS로 백엔드 마이그레이션
- RDS PostgreSQL로 DB 마이그레이션
- ElastiCache Redis (선택)

### Phase 3 (스케일)
- DB 읽기 복제본
- Redis Streams Worker 확장
- CloudFront 캐싱 강화

---

## 🔐 보안 고려사항

- JWT 토큰 만료 시간: 1시간 (Access Token), 30일 (Refresh Token)
- CORS 설정: 프론트엔드 도메인만 허용
- Rate Limiting: Redis 기반 (이메일 발송 제한)
- SQL Injection 방지: Exposed Prepared Statements
- XSS 방지: 입력 데이터 검증 및 이스케이프

---

**작성일**: 2024-12-10  
**최종 수정**: 2025-01-15
