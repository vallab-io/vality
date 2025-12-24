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
   - AWS CLI 설치: `sudo apt-get install -y awscli` (Ubuntu) 또는 `sudo yum install -y aws-cli` (Amazon Linux)
2) ECR 인증 설정
   - **방법 1 (권장)**: EC2 인스턴스에 IAM 역할 부여
     - EC2 콘솔 → 인스턴스 선택 → Actions → Security → Modify IAM role
     - IAM 역할에 `AmazonEC2ContainerRegistryReadOnly` 정책 추가
     - 또는 커스텀 정책으로 해당 ECR 리포지토리 접근 권한 부여
   - **방법 2**: AWS 자격증명 직접 설정
     ```bash
     aws configure
     # 또는 환경 변수로 설정
     export AWS_ACCESS_KEY_ID=your-access-key
     export AWS_SECRET_ACCESS_KEY=your-secret-key
     export AWS_DEFAULT_REGION=ap-northeast-2
     ```
   - ECR 로그인 (두 방법 모두 필요):
     ```bash
     aws ecr get-login-password --region ap-northeast-2 | \
       docker login --username AWS --password-stdin \
       010525337984.dkr.ecr.ap-northeast-2.amazonaws.com
     ```
3) 이미지/파일 준비  
   - Dockerfile로 빌드 → ECR 푸시 또는 EC2에서 직접 빌드  
   - `.env`에 시크릿 주입
4) 실행 예시  
   ```bash
   # ECR에서 이미지 pull
   docker pull 010525337984.dkr.ecr.ap-northeast-2.amazonaws.com/vality-api-repository:latest
   
   # 컨테이너 실행
   docker run -d --name vality-api \
     --env-file .env \
     -p 4000:4000 \
     010525337984.dkr.ecr.ap-northeast-2.amazonaws.com/vality-api-repository:latest
   ```
   - Flyway 자동 실행 여부 확인 (필요 시 `./gradlew flywayMigrate`)
5) HTTPS/도메인  
   - Nginx/ALB로 80/443 → 4000 포워딩  
   - ACM 인증서 또는 Let's Encrypt
6) SES 설정  
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

### 5-1. 도메인 변경하기

**기존 도메인 제거 후 새 도메인 추가:**

1. Vercel 대시보드 → Project Settings → Domains
2. 제거할 도메인 옆의 **"..." 메뉴** 클릭
3. **"Remove"** 선택
4. 확인 대화상자에서 **"Remove Domain"** 클릭
5. 새 도메인 추가:
   - **"Add Domain"** 클릭
   - 새 도메인 입력
   - DNS 설정 안내에 따라 레코드 추가

**도메인 교체 (기존 도메인 유지하면서 새 도메인 추가):**

1. Vercel 대시보드 → Project Settings → Domains
2. **"Add Domain"** 클릭
3. 새 도메인 입력 및 DNS 설정
4. 필요시 기존 도메인 제거

**주의사항:**
- 도메인 제거 시 즉시 적용되며, SSL 인증서도 함께 제거됩니다
- 새 도메인 추가 시 DNS 전파 시간이 필요합니다 (보통 몇 분~최대 48시간)
- 여러 도메인을 동시에 연결할 수 있습니다 (예: `your-domain.com`, `www.your-domain.com`)

### 5-2. www와 루트 도메인의 차이점

**기술적 차이점:**

| 항목 | `vality.io` (루트 도메인) | `www.vality.io` (www 서브도메인) |
|------|---------------------------|----------------------------------|
| **DNS 레코드** | A 레코드 (IP 주소) | CNAME 레코드 (별칭) |
| **쿠키 공유** | 서브도메인 간 공유 어려움 | 서브도메인 간 공유 가능 |
| **길이** | 더 짧음 | 더 김 |
| **전통적 관례** | 최신 트렌드 | 전통적 관례 |

**SEO 영향:**
- **중요**: 두 도메인을 모두 사용할 경우 **리다이렉트 설정 필수**
- 검색 엔진은 `vality.io`와 `www.vality.io`를 **다른 사이트로 인식**할 수 있음
- 중복 콘텐츠 문제 발생 가능
- **해결책**: 하나를 메인으로 설정하고 다른 하나를 리다이렉트

**권장 설정:**

**옵션 1: 루트 도메인을 메인으로 (권장 - 최신 트렌드)**
```
vality.io → 메인 도메인
www.vality.io → vality.io로 리다이렉트
```
- ✅ 더 짧고 깔끔한 URL
- ✅ 타이핑이 쉬움
- ✅ 최신 웹사이트 트렌드

**옵션 2: www를 메인으로 (전통적 방식)**
```
www.vality.io → 메인 도메인
vality.io → www.vality.io로 리다이렉트
```
- ✅ 서브도메인 간 쿠키 공유 용이
- ✅ 전통적으로 널리 사용됨
- ✅ 일부 레거시 시스템과 호환성 좋음

**Vercel에서 리다이렉트 설정:**

1. Vercel 대시보드 → Project Settings → Domains
2. 두 도메인 모두 추가 (`vality.io`, `www.vality.io`)
3. `next.config.ts`에 리다이렉트 설정 추가:
   ```typescript
   const nextConfig: NextConfig = {
     async redirects() {
       return [
         {
           source: '/:path*',
           has: [
             {
               type: 'host',
               value: 'www.vality.io',
             },
           ],
           destination: 'https://vality.io/:path*',
           permanent: true, // 301 리다이렉트
         },
       ];
     },
   };
   ```
   또는 반대로 (`vality.io` → `www.vality.io`):
   ```typescript
   {
     source: '/:path*',
     has: [
       {
         type: 'host',
         value: 'vality.io',
       },
     ],
     destination: 'https://www.vality.io/:path*',
     permanent: true,
   }
   ```

**추가 고려사항:**
- **Google Search Console**: 메인 도메인만 등록 (리다이렉트된 도메인은 자동 인식)
- **소셜 미디어 공유**: Open Graph 태그에서 메인 도메인 사용
- **sitemap.xml**: 메인 도메인 기준으로 생성
- **canonical URL**: 메인 도메인으로 설정

### 5-3. HTTP 리다이렉트 상태 코드 차이점

**301 Permanent Redirect (영구 리다이렉트)**
- **의미**: 리소스가 **영구적으로** 다른 위치로 이동했음
- **SEO**: 검색 엔진이 **링크 권한(link juice)을 전달**함
- **캐싱**: 브라우저가 리다이렉트를 **캐시**하여 다음 방문 시 직접 새 URL로 이동
- **HTTP 메서드**: GET, POST 등 **모든 메서드 유지**
- **사용 시나리오**:
  - ✅ 도메인 변경 (영구적)
  - ✅ www ↔ 루트 도메인 통일 (영구적)
  - ✅ URL 구조 변경 (영구적)
- **Next.js 설정**: `permanent: true`

**302 Found / Temporary Redirect (임시 리다이렉트)**
- **의미**: 리소스가 **임시로** 다른 위치에 있음
- **SEO**: 검색 엔진이 **링크 권한을 전달하지 않음**
- **캐싱**: 브라우저가 리다이렉트를 **캐시하지 않음**
- **HTTP 메서드**: **GET으로 변경**될 수 있음 (구식 브라우저)
- **사용 시나리오**:
  - ✅ A/B 테스트
  - ✅ 임시 유지보수 페이지
  - ✅ 프로모션 페이지 (기간 한정)
- **Next.js 설정**: `permanent: false` (기본값)

**307 Temporary Redirect (임시 리다이렉트 - 메서드 유지)**
- **의미**: 리소스가 **임시로** 다른 위치에 있음 (302와 유사)
- **SEO**: 검색 엔진이 **링크 권한을 전달하지 않음**
- **캐싱**: 브라우저가 리다이렉트를 **캐시하지 않음**
- **HTTP 메서드**: **원본 메서드 유지** (GET, POST, PUT 등)
- **사용 시나리오**:
  - ✅ API 엔드포인트 임시 이동
  - ✅ POST 요청을 보존해야 하는 경우
  - ✅ 임시 유지보수 (메서드 보존 필요)
- **Next.js 설정**: `permanent: false` (기본값, 302와 동일하게 처리)

**308 Permanent Redirect (영구 리다이렉트 - 메서드 유지)**
- **의미**: 리소스가 **영구적으로** 다른 위치로 이동했음 (301과 유사)
- **SEO**: 검색 엔진이 **링크 권한을 전달**함
- **캐싱**: 브라우저가 리다이렉트를 **캐시**
- **HTTP 메서드**: **원본 메서드 유지** (GET, POST, PUT 등)
- **사용 시나리오**:
  - ✅ API 엔드포인트 영구 이동 (POST/PUT 보존 필요)
  - ✅ RESTful API 버전 변경
  - ✅ 도메인 변경 (API 메서드 보존 필요)
- **Next.js 설정**: `permanent: true` (301과 동일하게 처리, 명시적 메서드 보존은 추가 설정 필요)

**비교표:**

| 상태 코드 | 영구/임시 | SEO 영향 | 메서드 유지 | 캐싱 | 권장 사용 |
|-----------|-----------|----------|-------------|------|-----------|
| **301** | 영구 | ✅ 링크 권한 전달 | ⚠️ GET으로 변경 가능 | ✅ 캐시 | 도메인 변경, www 통일 |
| **302** | 임시 | ❌ 링크 권한 미전달 | ❌ GET으로 변경 | ❌ 캐시 안 함 | A/B 테스트, 임시 페이지 |
| **307** | 임시 | ❌ 링크 권한 미전달 | ✅ 메서드 유지 | ❌ 캐시 안 함 | API 임시 이동 (POST 보존) |
| **308** | 영구 | ✅ 링크 권한 전달 | ✅ 메서드 유지 | ✅ 캐시 | API 영구 이동 (POST 보존) |

**Vercel/Next.js에서 사용:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.vality.io',
          },
        ],
        destination: 'https://vality.io/:path*',
        permanent: true,  // 301 리다이렉트 (도메인 변경 시 권장)
      },
      {
        source: '/old-path/:path*',
        destination: '/new-path/:path*',
        permanent: true,  // 301 (URL 구조 변경)
      },
      {
        source: '/promo',
        destination: '/special-offer',
        permanent: false, // 302 (임시 프로모션)
      },
    ];
  },
};
```

**도메인 변경 시 권장:**
- ✅ **301 Permanent Redirect** 사용
- 이유: SEO 링크 권한 전달, 검색 엔진이 새 도메인을 인덱싱하도록 안내
- 예: `www.vality.io` → `vality.io` (영구적 변경)

**주의사항:**
- **301 사용 시**: 검색 엔진이 새 URL을 인덱싱하는 데 시간이 걸릴 수 있음 (몇 주~몇 개월)
- **302 사용 시**: 검색 엔진이 원본 URL을 계속 인덱싱함 (임시로만 사용)
- **API 엔드포인트**: POST/PUT 요청을 보존해야 하면 307/308 고려

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

