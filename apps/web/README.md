# Vality Web

뉴스레터 + 웹 아카이빙 플랫폼 프론트엔드

## 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **TailwindCSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **React Query** - 서버 상태 관리
- **Jotai** - 클라이언트 상태 관리
- **Axios** - HTTP 클라이언트

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # 대시보드 (로그인 필요)
│   │   └── dashboard/
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 글로벌 스타일
│
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   └── providers/         # Context Providers
│
├── lib/
│   ├── api/               # API 클라이언트
│   └── utils.ts           # 유틸리티 함수
│
└── stores/                # Jotai 상태 관리
    └── auth.store.ts      # 인증 상태
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

예시:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
```
