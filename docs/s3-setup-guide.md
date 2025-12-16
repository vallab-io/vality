# AWS S3 버킷 생성 가이드

**작성일**: 2025-01-15

---

## 📋 사전 준비 사항

### 1. AWS 계정
- ✅ AWS 계정이 있어야 합니다
- ✅ 결제 정보 등록 필요 (무료 티어 사용 가능)

### 2. 버킷 정보 (사전 결정)
- **버킷 이름**: `vality-resources` (전 세계적으로 고유해야 함)
- **리전**: `ap-northeast-2` (서울)
- **용도**: 프로필 이미지, 뉴스레터 콘텐츠 이미지

---

## 🔑 1단계: IAM 사용자 생성 및 권한 설정

### 왜 IAM 사용자를 사용하나요?
- ✅ 루트 계정 사용보다 안전
- ✅ 필요한 권한만 부여 가능
- ✅ Access Key 회전 용이

### IAM 사용자 생성 절차

#### 1. AWS 콘솔 접속
1. https://console.aws.amazon.com 접속
2. IAM 서비스로 이동

#### 2. 사용자 생성
1. **사용자** → **사용자 추가** 클릭
2. **사용자 이름**: `vality-s3-user` (또는 원하는 이름)
3. **AWS 자격 증명 유형**: **액세스 키 - 프로그래밍 방식 액세스** 선택
4. **다음** 클릭

#### 3. 권한 정책 연결
**옵션 1: 기존 정책 직접 연결 (권장)**
- `AmazonS3FullAccess` 정책 선택
- 또는 아래 커스텀 정책 사용

**옵션 2: 커스텀 정책 생성 (최소 권한 원칙)**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::vality-resources",
        "arn:aws:s3:::vality-resources/*"
      ]
    }
  ]
}
```

#### 4. Access Key 저장
- ⚠️ **중요**: Access Key ID와 Secret Access Key를 **반드시 저장**하세요
- CSV 파일 다운로드 또는 안전한 곳에 복사
- 이후에는 Secret Access Key를 다시 볼 수 없습니다

**저장할 정보:**
```
AWS_ACCESS_KEY_ID=AKIAQE4235GAIIWMEVOO
AWS_SECRET_ACCESS_KEY=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
```

---

## 🪣 2단계: S3 버킷 생성

### 버킷 생성 절차

#### 1. S3 콘솔 접속
1. AWS 콘솔에서 **S3** 서비스로 이동
2. **버킷 만들기** 클릭

#### 2. 일반 설정
- **버킷 이름**: `vality-resources`
  - ⚠️ 전 세계적으로 고유해야 함 (이미 사용 중이면 다른 이름 사용)
  - 소문자, 숫자, 하이픈(-)만 사용 가능
- **AWS 리전**: `ap-northeast-2` (아시아 태평양(서울)) 선택
- **객체 소유권**: **ACL 비활성화됨(권장)** 선택

#### 3. 퍼블릭 액세스 설정
- **모든 퍼블릭 액세스 차단**: **비활성화** ✅
  - 이미지를 공개적으로 접근 가능하게 하기 위해 필요
- 경고 메시지 확인 후 체크박스 선택

#### 4. 버전 관리 (선택)
- **버전 관리**: 비활성화 (MVP 단계에서는 불필요)
- 필요 시 나중에 활성화 가능

#### 5. 기본 암호화 (선택)
- **기본 암호화**: 비활성화 (MVP 단계에서는 선택)
- 필요 시 나중에 활성화 가능

#### 6. 고급 설정 (선택)
- **객체 로깅**: 비활성화 (비용 절감)
- **태그**: 선택 사항

#### 7. 버킷 만들기
- **버킷 만들기** 클릭
- 생성 완료 확인

---

## ⚙️ 3단계: 버킷 설정

### 1. CORS 설정

**목적**: 프론트엔드에서 직접 S3에 업로드하기 위해 필요

#### 설정 방법
1. 버킷 선택 → **권한** 탭
2. **교차 출처 리소스 공유(CORS)** 섹션 → **편집** 클릭
3. 아래 JSON 입력:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://vality.io",
      "https://www.vality.io"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**설명:**
- `AllowedOrigins`: 프론트엔드 도메인 (개발/프로덕션)
- `AllowedMethods`: PUT (Presigned URL 업로드), GET (이미지 조회)
- `ExposeHeaders`: ETag (업로드 검증용)

#### 4. 변경 사항 저장

---

### 2. 버킷 정책 설정

**목적**: 업로드된 이미지를 공개적으로 읽을 수 있도록 설정

#### 설정 방법
1. 버킷 선택 → **권한** 탭
2. **버킷 정책** 섹션 → **편집** 클릭
3. 아래 JSON 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vality-resources/*"
    }
  ]
}
```

**설명:**
- `Principal: "*"`: 모든 사용자에게 읽기 권한 부여
- `Action: s3:GetObject`: 객체 읽기만 허용 (쓰기는 Presigned URL로만 가능)

#### 4. 변경 사항 저장

---

### 3. 퍼블릭 액세스 차단 설정 확인

**목적**: 버킷 정책과 퍼블릭 액세스 차단 설정이 충돌하지 않도록 확인

#### 확인 방법
1. 버킷 선택 → **권한** 탭
2. **퍼블릭 액세스 차단 설정** 섹션 확인
3. **편집** 클릭하여 설정 확인:
   - ✅ **새 퍼블릭 버킷 정책 차단**: **비활성화**
   - ✅ **퍼블릭 및 교차 계정 액세스를 통한 버킷 및 객체 차단**: **비활성화**
   - ✅ **새 퍼블릭 객체 또는 퍼블릭 객체의 액세스 권한 차단**: **비활성화**
   - ✅ **크로스 계정 퍼블릭 버킷 정책 및 액세스 권한 차단**: **비활성화**

**경고 메시지 확인 후 저장**

---

## 🔐 4단계: 환경 변수 설정

### 백엔드 환경 변수

**파일**: `apps/api/.env` 또는 `apps/api/.env.local`

```env
# AWS S3 설정
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=vality-resources

# 이미지 Base URL
# 개발 환경: S3 직접 URL
RESOURCE_BASE_URL=https://vality-resources.s3.ap-northeast-2.amazonaws.com

# 프로덕션 환경: CloudFront 서브도메인 (나중에 설정)
# RESOURCE_BASE_URL=https://cdn.vality.io
```

### 환경 변수 설명

| 변수 | 설명 | 예시 |
|------|------|------|
| `AWS_ACCESS_KEY_ID` | IAM 사용자의 Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM 사용자의 Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | S3 버킷 리전 | `ap-northeast-2` |
| `AWS_S3_BUCKET` | S3 버킷 이름 | `vality-resources` |
| `RESOURCE_BASE_URL` | 이미지 URL의 기본 경로 | `https://vality-resources.s3.ap-northeast-2.amazonaws.com` |

---

## ✅ 5단계: 설정 확인

### 1. 버킷 접근 확인
- AWS 콘솔에서 버킷 목록에 `vality-resources`가 보이는지 확인
- 버킷 클릭하여 접근 가능한지 확인

### 2. CORS 설정 확인
- 버킷 → 권한 → CORS 설정이 올바르게 저장되었는지 확인

### 3. 버킷 정책 확인
- 버킷 → 권한 → 버킷 정책이 올바르게 저장되었는지 확인

### 4. 퍼블릭 액세스 확인
- 버킷 → 권한 → 퍼블릭 액세스 차단 설정이 비활성화되었는지 확인

### 5. 테스트 업로드 (선택)
- AWS 콘솔에서 버킷에 파일 업로드 테스트
- 업로드된 파일의 URL로 접근 가능한지 확인

---

## 🔒 보안 체크리스트

### ✅ 완료해야 할 항목
- [ ] IAM 사용자 생성 (루트 계정 사용 금지)
- [ ] 최소 권한 원칙 적용 (필요한 권한만 부여)
- [ ] Access Key 안전하게 보관 (환경 변수에만 저장)
- [ ] `.env` 파일을 `.gitignore`에 추가 확인
- [ ] CORS 설정에 허용된 도메인만 추가
- [ ] 버킷 정책으로 Public Write 차단 (Presigned URL로만 업로드)

### ⚠️ 주의사항
- **Access Key는 절대 Git에 커밋하지 마세요**
- **Secret Access Key는 다시 볼 수 없으므로 안전한 곳에 저장하세요**
- **프로덕션 환경에서는 환경 변수로 관리하세요**

---

## 📚 다음 단계

S3 버킷 생성이 완료되면:
1. ✅ AWS SDK for Kotlin 의존성 추가
2. ✅ `S3Service` 구현
3. ✅ `ImageUploadService` 구현
4. ✅ Presigned URL API 구현
5. ✅ 프론트엔드 이미지 업로드 구현

---

## 🆘 문제 해결

### 버킷 이름이 이미 사용 중
- 다른 이름 사용 (예: `vality-resources-2025`, `vality-resources-dev`)
- 또는 다른 리전 사용

### CORS 오류 발생
- CORS 설정의 `AllowedOrigins`에 정확한 도메인 추가 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 퍼블릭 액세스 차단 경고
- 버킷 정책과 퍼블릭 액세스 차단 설정이 충돌하지 않도록 확인
- 경고 메시지를 읽고 필요한 설정만 변경

### Access Key 권한 오류
- IAM 사용자에 올바른 권한이 부여되었는지 확인
- 버킷 ARN이 정책에 정확히 입력되었는지 확인

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

