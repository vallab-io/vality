# Vality API Server

뉴스레터 + 웹 아카이빙 플랫폼 백엔드 API 서버

## 기술 스택

- **NestJS** - 백엔드 프레임워크
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **Swagger** - API 문서화
- **JWT** - 인증

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
```

`.env` 파일을 열어서 필요한 값들을 설정하세요.

### 3. 데이터베이스 실행 (Docker)

프로젝트 루트에서:

```bash
docker-compose up -d
```

### 4. Prisma 설정

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# (선택) Prisma Studio로 DB 확인
npm run prisma:studio
```

### 5. 개발 서버 실행

```bash
npm run start:dev
```

서버가 실행되면:
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/api-docs

## 프로젝트 구조

```
src/
├── common/              # 공통 유틸리티
│   ├── decorators/      # 커스텀 데코레이터
│   ├── dto/             # 공통 DTO
│   ├── filters/         # 예외 필터
│   └── interceptors/    # 인터셉터
├── prisma/              # Prisma 모듈
├── modules/             # 기능 모듈 (추후 추가)
│   ├── auth/            # 인증
│   ├── user/            # 사용자
│   ├── newsletter/      # 뉴스레터
│   ├── subscriber/      # 구독자
│   └── email/           # 이메일
├── app.module.ts        # 루트 모듈
├── app.controller.ts    # 루트 컨트롤러
├── app.service.ts       # 루트 서비스
└── main.ts              # 애플리케이션 엔트리
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run start:dev` | 개발 서버 실행 (watch 모드) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start:prod` | 프로덕션 서버 실행 |
| `npm run prisma:generate` | Prisma 클라이언트 생성 |
| `npm run prisma:migrate` | DB 마이그레이션 |
| `npm run prisma:studio` | Prisma Studio 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run test` | 테스트 실행 |

## API 문서

개발 서버 실행 후 http://localhost:4000/api-docs 에서 Swagger UI로 API 문서를 확인할 수 있습니다.
