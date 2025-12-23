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

## Frontend
- Vercel/Netlify 권장 또는 별도 호스팅  
- `NEXT_PUBLIC_API_URL` 프로덕션 도메인으로 설정  
- `next.config` 이미지 도메인 허용 확인

## Webhook
- 공개 엔드포인트: `/api/webhooks/lemon-squeezy`  
- 방화벽/프록시에서 경로 오픈  
- `LEMON_SQUEEZY_WEBHOOK_SECRET` 설정

## 빠른 점검
- DB 방화벽/IP 허용, JWT 시크릿 32바이트 이상  
- SES/S3 키 주입, 발신 도메인 검증 완료  
- Webhook URL, Variant ID/Store ID 설정 확인  
- NEXT_PUBLIC_API_URL, 이미지 도메인 설정 완료

