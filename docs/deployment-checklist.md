# Deployment Checklist (Frontend & Backend)

## 공통 환경 변수
- DATABASE_URL (jdbc)
- JWT_SECRET / JWT_ISSUER / JWT_AUDIENCE
- AWS_REGION (ap-northeast-2)
- S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, RESOURCE_BASE_URL
- SES: SES_FROM_EMAIL, SES_FROM_NAME
- Lemon Squeezy:
  - LEMON_SQUEEZY_WEBHOOK_SECRET
  - LEMON_SQUEEZY_STARTER_VARIANT_ID
  - LEMON_SQUEEZY_PRO_VARIANT_ID
  - LEMON_SQUEEZY_STORE_ID
  - LEMON_SQUEEZY_CHECKOUT_BASE_URL
- Frontend: NEXT_PUBLIC_API_URL

## Backend (EC2 + Docker)
1) EC2 준비  
   - Amazon Linux 2023/Ubuntu LTS  
   - 보안그룹: 22(SSH), 80/443(서비스), 4000(내부테스트)  
   - Docker/Compose 설치
2) 이미지/파일 준비  
   - Dockerfile로 빌드 → ECR 푸시 또는 EC2에서 직접 빌드  
   - `.env`에 시크릿 주입
3) 실행 예시  
   ```bash
   docker run -d --name vality-api \
     --env-file .env \
     -p 4000:4000 \
     your-ecr-repo/vality-api:latest
   ```
   - Flyway 자동 실행 여부 확인 (필요 시 `./gradlew flywayMigrate`)
4) HTTPS/도메인  
   - Nginx/ALB로 80/443 → 4000 포워딩  
   - ACM 인증서 또는 Let’s Encrypt
5) SES 설정  
   - 발신 도메인/이메일 검증  
   - 샌드박스 해제 여부 확인  
   - IAM 자격증명 사용 (env로 주입)

## Frontend 배포 옵션 비교

### 옵션 1: Vercel (권장 - Next.js 최적화)

**장점:**
- ✅ Next.js 공식 파트너, 최적화된 빌드 및 배포
- ✅ 자동 HTTPS, CDN, 글로벌 엣지 네트워크
- ✅ 무료 플랜 제공 (개인 프로젝트)
- ✅ Git 연동으로 자동 배포 (PR별 프리뷰)
- ✅ 서버리스 함수 지원 (API Routes)
- ✅ 환경 변수 관리 UI 제공
- ✅ 빌드 로그 및 분석 도구 제공
- ✅ 설정 최소화 (거의 zero-config)

**단점:**
- ❌ 무료 플랜: 대역폭 제한 (100GB/월)
- ❌ 프로젝트당 빌드 시간 제한 (무료: 45분/월)
- ❌ 커스텀 서버 설정 제한적
- ❌ AWS 서비스와 직접 통합 어려움

**비용:**
- 무료: 개인 프로젝트, 제한된 대역폭
- Pro: $20/월 (팀당), 무제한 대역폭
- Enterprise: 맞춤 가격

**적합한 경우:**
- Next.js 프로젝트
- 빠른 배포가 필요한 경우
- 서버리스 함수 활용
- 팀 협업 및 PR 프리뷰 필요

---

### 옵션 2: Netlify

**장점:**
- ✅ 프레임워크 무관 (Next.js, React, Vue 등)
- ✅ 자동 HTTPS, CDN, 글로벌 엣지 네트워크
- ✅ 무료 플랜 제공 (개인 프로젝트)
- ✅ Git 연동 자동 배포
- ✅ 폼 처리, 서버리스 함수 지원
- ✅ 환경 변수 관리 UI
- ✅ 분할 테스트 (A/B Testing) 지원
- ✅ 설정 파일 (`netlify.toml`)로 세밀한 제어

**단점:**
- ❌ 무료 플랜: 대역폭 제한 (100GB/월)
- ❌ 빌드 시간 제한 (무료: 300분/월)
- ❌ Next.js 최적화는 Vercel보다 낮음
- ❌ 서버 사이드 렌더링 성능이 Vercel보다 낮을 수 있음

**비용:**
- 무료: 개인 프로젝트, 제한된 대역폭
- Pro: $19/월 (사용자당), 무제한 대역폭
- Business: $99/월, 고급 기능

**적합한 경우:**
- 다양한 프레임워크 사용
- 정적 사이트 + 서버리스 함수 조합
- 폼 처리 기능 필요
- 분할 테스트 필요

---

### 옵션 3: S3 + CloudFront (AWS 네이티브)

**장점:**
- ✅ AWS 생태계와 완벽 통합
- ✅ 비용 예측 가능 (사용한 만큼 지불)
- ✅ 무제한 스토리지 및 대역폭
- ✅ CloudFront 글로벌 CDN (전 세계 엣지 로케이션)
- ✅ S3 버전 관리 및 백업
- ✅ IAM으로 세밀한 접근 제어
- ✅ AWS 서비스 (SES, S3 등)와 직접 통합 용이
- ✅ 커스텀 설정 자유도 높음

**단점:**
- ❌ 설정 복잡도 높음 (S3, CloudFront, Route 53 등)
- ❌ 자동 배포 파이프라인 구축 필요 (GitHub Actions 등)
- ❌ HTTPS 인증서 관리 (ACM 사용)
- ❌ 빌드 서버 별도 필요 (EC2, CodeBuild 등)
- ❌ 초기 설정 시간 소요
- ❌ Next.js 서버 사이드 렌더링은 별도 처리 필요 (Lambda@Edge 또는 EC2)

**비용 (예상):**
- S3: $0.023/GB 저장, $0.09/GB 전송
- CloudFront: $0.085/GB 전송 (첫 10TB)
- Route 53: $0.50/호스팅 존/월
- **총 예상**: 트래픽에 따라 $5-50/월 (소규모), $50-500/월 (중규모)

**적합한 경우:**
- AWS 서비스와 통합 필요
- 비용 최적화 중요
- 대용량 트래픽 예상
- 커스텀 인프라 제어 필요
- 기업용 보안/컴플라이언스 요구사항

**구현 단계:**
1. S3 버킷 생성 및 정적 호스팅 활성화
2. CloudFront 배포 생성 (S3 오리진)
3. ACM에서 SSL 인증서 요청
4. Route 53에서 도메인 연결
5. GitHub Actions로 빌드 → S3 업로드 자동화
6. CloudFront 무효화 (캐시 갱신)

---

### 비교 요약

| 항목 | Vercel | Netlify | S3 + CloudFront |
|------|--------|---------|-----------------|
| **설정 난이도** | ⭐ 매우 쉬움 | ⭐⭐ 쉬움 | ⭐⭐⭐⭐ 복잡 |
| **Next.js 최적화** | ⭐⭐⭐⭐⭐ 최고 | ⭐⭐⭐⭐ 우수 | ⭐⭐⭐ 보통 |
| **비용 (소규모)** | 무료/저렴 | 무료/저렴 | 저렴 |
| **비용 (대규모)** | 중간 | 중간 | 매우 저렴 |
| **AWS 통합** | ⭐⭐ 제한적 | ⭐⭐ 제한적 | ⭐⭐⭐⭐⭐ 완벽 |
| **자동 배포** | ⭐⭐⭐⭐⭐ 완벽 | ⭐⭐⭐⭐⭐ 완벽 | ⭐⭐⭐ 수동 설정 필요 |
| **커스터마이징** | ⭐⭐ 제한적 | ⭐⭐⭐ 보통 | ⭐⭐⭐⭐⭐ 완전 제어 |

### 추천

- **Next.js 프로젝트 + 빠른 시작**: **Vercel**
- **다양한 프레임워크 + 추가 기능**: **Netlify**
- **AWS 생태계 통합 + 비용 최적화**: **S3 + CloudFront**

### 공통 설정
- `NEXT_PUBLIC_API_URL` 프로덕션 도메인으로 설정
- `next.config` 이미지 도메인 허용 확인

---

## Vercel 배포 가이드

### 1. 사전 준비
- GitHub/GitLab/Bitbucket 저장소에 코드 푸시 완료
- Vercel 계정 생성 (https://vercel.com)

### 2. 프로젝트 배포 (첫 배포)

**방법 A: Vercel 웹 대시보드 사용**
1. Vercel 대시보드 → "Add New..." → "Project"
2. Git 저장소 선택 (GitHub/GitLab/Bitbucket)
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `apps/web` (모노레포인 경우)
   - **Build Command**: `npm run build` 또는 `next build`
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` 또는 `yarn install`
4. Environment Variables 추가:
   ```
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```
5. "Deploy" 클릭

**방법 B: Vercel CLI 사용**
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 실행
cd apps/web

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 모노레포 설정 (Root Directory)

모노레포 구조인 경우 Vercel에서 Root Directory를 설정해야 합니다:

1. Vercel 대시보드 → Project Settings → General
2. **Root Directory** 설정:
   - `apps/web` 선택
3. **Build and Output Settings**:
   - Build Command: `cd ../.. && npm run build --workspace=apps/web`
   - 또는: `npm run build` (package.json에 스크립트가 있는 경우)
   - Output Directory: `.next` (기본값)

### 4. 환경 변수 설정

Vercel 대시보드 → Project Settings → Environment Variables:

**필수 환경 변수:**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

**선택적 환경 변수:**
- `NEXT_PUBLIC_GA_ID` (Google Analytics)
- `NEXT_PUBLIC_SENTRY_DSN` (Sentry)
- 기타 공개 환경 변수 (NEXT_PUBLIC_*)

**주의사항:**
- `NEXT_PUBLIC_*` 접두사가 있는 변수만 클라이언트에서 접근 가능
- 서버 사이드 전용 변수는 `NEXT_PUBLIC_` 없이 설정
- 환경별로 다른 값 설정 가능 (Production, Preview, Development)

### 5. 커스텀 도메인 연결

1. Vercel 대시보드 → Project Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `your-domain.com`, `www.your-domain.com`)
4. DNS 설정 안내에 따라 레코드 추가:
   - **A 레코드**: Vercel이 제공하는 IP 주소
   - **CNAME 레코드**: `cname.vercel-dns.com`
5. DNS 전파 대기 (보통 몇 분~최대 48시간)
6. SSL 인증서 자동 발급 (Let's Encrypt)

### 6. 자동 배포 설정

**Git 연동 시 자동 배포:**
- `main`/`master` 브랜치 푸시 → Production 배포
- 다른 브랜치 푸시 → Preview 배포 (PR별 고유 URL)
- PR 생성/업데이트 → Preview 배포

**배포 설정 변경:**
- Vercel 대시보드 → Project Settings → Git
- Production Branch: `main` (기본값)
- Ignored Build Step: 특정 조건에서 빌드 스킵 가능

### 7. 빌드 최적화

**package.json 스크립트 예시:**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**next.config.ts 확인:**
- `output: 'export'` 제거 (Vercel은 서버 사이드 렌더링 지원)
- 이미지 도메인 설정 확인
- 리라이트 규칙 확인

### 8. 배포 확인

1. **배포 상태 확인:**
   - Vercel 대시보드 → Deployments 탭
   - 빌드 로그 확인
   - 배포 URL로 접속 테스트

2. **기능 테스트:**
   - 정적 페이지 로딩 확인
   - 동적 라우트 (`/[username]`, `/[username]/[newsletterSlug]` 등) 확인
   - API 호출 확인 (`NEXT_PUBLIC_API_URL` 설정 확인)
   - 이미지 로딩 확인

### 9. 트러블슈팅

**빌드 실패 시:**
- Build Logs 확인 (Vercel 대시보드)
- 로컬에서 `npm run build` 테스트
- 환경 변수 누락 확인
- 의존성 버전 충돌 확인

**환경 변수 문제:**
- `NEXT_PUBLIC_*` 변수는 빌드 타임에 주입됨
- 배포 후 환경 변수 변경 시 재배포 필요

**이미지 로딩 문제:**
- `next.config.ts`의 `images.remotePatterns` 확인
- Vercel의 이미지 최적화 기능 활용

### 10. 성능 모니터링

- Vercel 대시보드 → Analytics 탭
- Web Vitals 모니터링
- 실시간 로그 확인
- 에러 추적 (Sentry 연동 권장)

### 11. 비용 관리

**무료 플랜 제한:**
- 대역폭: 100GB/월
- 빌드 시간: 45분/월
- 서버리스 함수 실행 시간: 100GB-시간/월

**Pro 플랜 ($20/월):**
- 무제한 대역폭
- 무제한 빌드 시간
- 고급 분석 도구
- 팀 협업 기능

## Webhook
- 공개 엔드포인트: `/api/webhooks/lemon-squeezy`  
- 방화벽/프록시에서 경로 오픈  
- `LEMON_SQUEEZY_WEBHOOK_SECRET` 설정

## 빠른 점검
- DB 방화벽/IP 허용, JWT 시크릿 32바이트 이상  
- SES/S3 키 주입, 발신 도메인 검증 완료  
- Webhook URL, Variant ID/Store ID 설정 확인  
- NEXT_PUBLIC_API_URL, 이미지 도메인 설정 완료

