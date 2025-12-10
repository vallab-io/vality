# 기술 스택 및 아키텍처 (Tech Stack)

> 참고: [인프런 클론코딩 강의](https://www.inflearn.com/course/%EC%9D%B8%ED%94%84%EB%9F%B0-%ED%81%B4%EB%A1%A0%EC%BD%94%EB%94%A9-part1) 기술 스택 기반

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
│                    API Layer (NestJS)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         REST API + Swagger (OpenAPI Codegen)              │  │
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
│  │ (Postgres) │  │  (Resend)  │  │  (AWS S3)  │  │CloudFront│  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
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
| **CKEditor** | 에디터 | 완성도 높은 리치 텍스트 에디터 |
| **React Query** | 데이터 페칭 | 서버 데이터 캐싱, 요청 상태 관리 |
| **Jotai v2** | 상태 관리 | 직관적인 전역 상태 관리, 가벼움 |

### Backend

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **NestJS** | API 서버 | 구조화된 백엔드 아키텍처, DI/IoC 지원 |
| **Prisma** | ORM | 타입 안전한 DB 접근, 마이그레이션 관리 |
| **PostgreSQL** | 데이터베이스 | 안정성, 확장성, 관계형 데이터 처리 |
| **Swagger** | API 문서화 | OpenAPI 스펙, 자동 문서 생성 |
| **OpenAPI Codegen** | API 클라이언트 | 프론트엔드 API 호출 자동 생성 |

### Infrastructure

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **Docker** | 컨테이너 | 일관된 개발/배포 환경 구성 |
| **AWS S3** | 파일 스토리지 | 이미지/첨부파일 저장 |
| **AWS CloudFront** | CDN | 빠른 콘텐츠 전송, 캐싱 |
| **Vercel** | 프론트엔드 호스팅 | Next.js 최적화, 간편한 배포 |
| **AWS EC2** or **Railway** | 백엔드 호스팅 | NestJS 서버 배포 |

### 인증 & 보안

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **Auth.js (NextAuth)** | 프론트엔드 인증 | Next.js 통합, SSR 세션 관리 |
| **JWT** | 토큰 인증 | Stateless 인증, 백엔드 연동 |
| **NestJS Auth Guard** | API 보호 | 라우트별 인가 처리 |

### External Services

| 서비스 | 용도 | 대안 |
|--------|------|------|
| **Resend** | 이메일 발송 | SendGrid, AWS SES |
| **Vercel OG** | OG 이미지 생성 | Satori |
| **Cursor AI** | 개발 효율화 | GitHub Copilot |

---

## 📁 프로젝트 구조

### 모노레포 구조 (권장)

```
vality/
├── apps/
│   ├── web/                       # Next.js 15 프론트엔드
│   │   ├── src/
│   │   │   ├── app/               # App Router
│   │   │   │   ├── (auth)/        # 인증 페이지 (로그인/회원가입)
│   │   │   │   ├── (dashboard)/   # 대시보드 (로그인 필요)
│   │   │   │   │   ├── newsletters/
│   │   │   │   │   ├── subscribers/
│   │   │   │   │   └── settings/
│   │   │   │   ├── @[username]/   # 사용자 공개 페이지
│   │   │   │   │   ├── page.tsx   # 프로필/Bio
│   │   │   │   │   └── [slug]/    # 게시글 상세
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn/ui 컴포넌트
│   │   │   │   ├── editor/        # CKEditor 관련
│   │   │   │   ├── newsletter/    # 뉴스레터 관련
│   │   │   │   └── common/        # 공통 컴포넌트
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api/           # OpenAPI 자동 생성 클라이언트
│   │   │   │   ├── auth/          # Auth.js 설정
│   │   │   │   └── utils/         # 공통 유틸리티
│   │   │   │
│   │   │   ├── stores/            # Jotai atoms
│   │   │   └── types/             # 타입 정의
│   │   │
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                       # NestJS 백엔드
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/          # 인증 모듈
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── guards/
│       │   │   │   └── dto/
│       │   │   ├── user/          # 사용자 모듈
│       │   │   ├── newsletter/    # 뉴스레터 모듈
│       │   │   ├── subscriber/    # 구독자 모듈
│       │   │   └── email/         # 이메일 모듈
│       │   │
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   └── interceptors/
│       │   │
│       │   ├── prisma/
│       │   │   └── prisma.service.ts
│       │   │
│       │   ├── app.module.ts
│       │   └── main.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       │
│       └── package.json
│
├── packages/                      # 공유 패키지
│   └── shared/                    # 공유 타입/유틸
│
├── docker-compose.yml             # 로컬 개발 환경
├── pnpm-workspace.yaml
└── package.json
```

---

## 🐳 Docker 설정

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:15-alpine
    container_name: vality-postgres
    environment:
      POSTGRES_USER: vality
      POSTGRES_PASSWORD: vality_password
      POSTGRES_DB: vality_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vality"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis (선택적 - 캐싱/세션용)
  redis:
    image: redis:7-alpine
    container_name: vality-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 로컬 개발 시작

```bash
# Docker 컨테이너 시작 (PostgreSQL)
docker-compose up -d

# 의존성 설치
pnpm install

# DB 마이그레이션
cd apps/api && pnpm prisma migrate dev

# Prisma 클라이언트 생성
pnpm prisma generate

# 시드 데이터 (선택)
pnpm prisma db seed

# 개발 서버 시작 (모노레포 루트에서)
pnpm dev
```

---

## 🗄️ 데이터베이스 스키마 (초안)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  username      String       @unique
  name          String?
  bio           String?
  avatarUrl     String?
  passwordHash  String?      // 자체 회원가입용
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  newsletters   Newsletter[]
  subscribers   Subscriber[]
  
  @@map("users")
}

model Newsletter {
  id            String       @id @default(cuid())
  title         String
  slug          String
  content       String       @db.Text
  excerpt       String?
  coverImageUrl String?
  status        PostStatus   @default(DRAFT)
  publishedAt   DateTime?
  scheduledAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  author        User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId      String
  
  emailLogs     EmailLog[]
  
  @@unique([authorId, slug])
  @@index([authorId, status])
  @@index([publishedAt])
  @@map("newsletters")
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

model Subscriber {
  id             String       @id @default(cuid())
  email          String
  status         SubStatus    @default(PENDING)
  subscribedAt   DateTime     @default(now())
  confirmedAt    DateTime?
  unsubscribedAt DateTime?
  
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  
  emailLogs      EmailLog[]
  
  @@unique([userId, email])
  @@index([userId, status])
  @@map("subscribers")
}

enum SubStatus {
  PENDING      // 확인 대기
  ACTIVE       // 활성
  UNSUBSCRIBED // 구독 취소
}

model EmailLog {
  id            String       @id @default(cuid())
  status        EmailStatus  @default(PENDING)
  sentAt        DateTime?
  openedAt      DateTime?
  clickedAt     DateTime?
  createdAt     DateTime     @default(now())
  
  newsletter    Newsletter   @relation(fields: [newsletterId], references: [id], onDelete: Cascade)
  newsletterId  String
  
  subscriber    Subscriber   @relation(fields: [subscriberId], references: [id], onDelete: Cascade)
  subscriberId  String
  
  @@index([newsletterId])
  @@index([subscriberId])
  @@map("email_logs")
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  FAILED
}
```

---

## 🔌 Swagger & OpenAPI Codegen

### NestJS Swagger 설정

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Vality API')
    .setDescription('뉴스레터 + 웹 아카이빙 플랫폼 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // OpenAPI JSON 파일 생성 (프론트엔드용)
  const fs = require('fs');
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  
  await app.listen(4000);
}
bootstrap();
```

### 프론트엔드 API 클라이언트 자동 생성

```bash
# openapi-generator 설치
npm install @openapitools/openapi-generator-cli -g

# API 클라이언트 생성
openapi-generator-cli generate \
  -i http://localhost:4000/api-docs-json \
  -g typescript-axios \
  -o apps/web/src/lib/api/generated
```

---

## 🔐 보안 고려사항

### 인증 & 인가
- Auth.js + JWT 조합으로 SSR/CSR 모두 지원
- NestJS Auth Guard로 API 보호
- RBAC(Role-Based Access Control) 적용

### 데이터 보호
- 모든 API 통신 HTTPS
- 비밀번호 bcrypt 해싱
- SQL Injection 방지 (Prisma ORM)
- XSS 방지 (React 기본 이스케이프 + DOMPurify)

### 이메일 보안
- 더블 옵트인 구현
- 구독 취소 링크 필수 포함
- SPF, DKIM, DMARC 설정

### Rate Limiting
- NestJS Throttler로 API 요청 제한
- 이메일 발송 제한
- 구독 요청 제한 (스팸 방지)

---

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 20+ (LTS)
- pnpm 8+
- Docker Desktop
- PostgreSQL 15+ (Docker로 실행)

### 환경 변수

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-secret-key"

# apps/api/.env
DATABASE_URL="postgresql://vality:vality_password@localhost:5432/vality_db"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET="vality-uploads"
AWS_CLOUDFRONT_DOMAIN="xxx.cloudfront.net"

# Email (Resend)
RESEND_API_KEY="re_..."
```

### 개발 명령어

```bash
# 의존성 설치
pnpm install

# Docker 컨테이너 시작
docker-compose up -d

# DB 마이그레이션
pnpm --filter api prisma migrate dev

# 개발 서버 시작 (프론트엔드 + 백엔드 동시)
pnpm dev

# 프론트엔드만 시작
pnpm --filter web dev

# 백엔드만 시작
pnpm --filter api dev

# API 클라이언트 재생성
pnpm generate:api
```

---

## 📈 확장성 고려

### Phase 1 (MVP)
- Vercel (프론트엔드) + Railway/Render (백엔드)
- 단일 PostgreSQL 인스턴스
- 소규모 트래픽 처리

### Phase 2 (성장)
- AWS EC2 또는 ECS로 백엔드 마이그레이션
- RDS PostgreSQL로 DB 마이그레이션
- Redis 캐싱 도입

### Phase 3 (스케일)
- DB 읽기 복제본
- 이메일 발송 큐 시스템 (Bull/BullMQ)
- CloudFront 캐싱 강화
