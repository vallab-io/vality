# AWS IAM 사용자 관리 전략

## 📋 상황 분석

현재 상황:
- ✅ `vality-s3-user`: S3 접근용 IAM 사용자 (기존)
- ✅ `vality-ses-user`: SES 접근용 IAM 사용자 (신규 생성)
- ✅ 서비스별 권한 분리로 보안 강화

---

## 🤔 옵션 비교

### 옵션 1: 별도 사용자 생성 (`vality-ses-user`)

**구성:**
- `vality-s3-user`: S3 전용 권한
- `vality-ses-user`: SES 전용 권한

**장점:**
- ✅ **최소 권한 원칙 (Principle of Least Privilege)**
  - 각 서비스에 필요한 권한만 부여
  - 보안 위험 최소화
- ✅ **권한 분리**
  - S3와 SES 권한이 독립적으로 관리
  - 한 서비스의 권한 변경이 다른 서비스에 영향 없음
- ✅ **보안 격리**
  - 한 서비스의 자격 증명이 유출되어도 다른 서비스 영향 없음
  - 침해 범위 제한
- ✅ **감사 및 추적**
  - 각 서비스별로 별도 로그 추적 가능
  - 문제 발생 시 원인 파악 용이

**단점:**
- ❌ 환경 변수 증가 (2개 사용자 관리)
- ❌ 초기 설정 복잡도 약간 증가

**권한 예시:**
```json
// vality-s3-user
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::vality-bucket/*",
        "arn:aws:s3:::vality-bucket"
      ]
    }
  ]
}

// vality-ses-user
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 옵션 2: 기존 사용자 재사용 (`vality-s3-user`)

**구성:**
- `vality-s3-user`: S3 + SES 권한 모두 포함

**장점:**
- ✅ **관리 간편**
  - 하나의 사용자만 관리
  - 환경 변수 하나만 사용
- ✅ **초기 설정 간단**
  - 새로운 사용자 생성 불필요
- ✅ **비용 절감**
  - 사용자 수 감소 (비용 영향은 미미함)

**단점:**
- ❌ **권한 범위 확대**
  - S3와 SES 권한이 하나의 사용자에 집중
  - 최소 권한 원칙 위배
- ❌ **보안 위험 증가**
  - 한 자격 증명 유출 시 S3와 SES 모두 영향
  - 침해 범위 확대
- ❌ **권한 관리 복잡**
  - S3 권한 변경 시 SES에도 영향 가능
  - 서비스별 권한 분리 어려움

**권한 예시:**
```json
// vality-s3-user (S3 + SES)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::vality-bucket/*",
        "arn:aws:s3:::vality-bucket"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 🎯 최종 결정

### 별도 사용자 방식 (권장) ✅

**구성:**
- `vality-s3-user`: S3 전용 권한
- `vality-ses-user`: SES 전용 권한

**장점:**
- ✅ **최소 권한 원칙 (Principle of Least Privilege)**
  - 각 서비스에 필요한 권한만 부여
  - 보안 위험 최소화
- ✅ **권한 분리**
  - S3와 SES 권한이 독립적으로 관리
  - 한 서비스의 권한 변경이 다른 서비스에 영향 없음
- ✅ **보안 격리**
  - 한 서비스의 자격 증명이 유출되어도 다른 서비스 영향 없음
  - 침해 범위 제한

**권한 구성:**
- `vality-s3-user`: S3 버킷 접근 (PutObject, GetObject, DeleteObject, ListBucket)
- `vality-ses-user`: SES 이메일 발송 (SendEmail, SendRawEmail, GetSendStatistics)

---

## 🔧 구현 방법

### 방법 1: 별도 사용자 생성 (권장)

#### 1. IAM 사용자 생성

**경로:**
1. AWS 콘솔 → IAM → Users
2. "Create user" 클릭
3. 사용자 이름: `vality-ses-user`
4. "Access key - Programmatic access" 선택

#### 2. 권한 설정

**옵션 A: 정책 직접 생성 (권장)**

1. "Create policy" 클릭
2. JSON 탭 선택
3. 다음 정책 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SESSendEmail",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SESGetStatistics",
      "Effect": "Allow",
      "Action": [
        "ses:GetSendStatistics",
        "ses:GetAccountSendingEnabled"
      ],
      "Resource": "*"
    }
  ]
}
```

4. 정책 이름: `ValitySESPolicy`
5. 정책 생성
6. 사용자에 정책 연결

**옵션 B: AWS 관리형 정책 사용**

1. "Attach existing policies directly" 선택
2. `AmazonSESFullAccess` 선택 (또는 필요한 권한만)
3. 사용자 생성

#### 3. 환경 변수 설정

**기존 (S3):**
```env
AWS_S3_ACCESS_KEY_ID=xxx
AWS_S3_SECRET_ACCESS_KEY=xxx
```

**추가 (SES):**
```env
AWS_SES_ACCESS_KEY_ID=xxx
AWS_SES_SECRET_ACCESS_KEY=xxx
```

**또는 통합 관리:**
```env
# S3
AWS_S3_ACCESS_KEY_ID=xxx
AWS_S3_SECRET_ACCESS_KEY=xxx

# SES
AWS_SES_ACCESS_KEY_ID=xxx
AWS_SES_SECRET_ACCESS_KEY=xxx

# 공통
AWS_REGION=ap-northeast-2
```

#### 4. 코드에서 사용

**S3 서비스:**
```kotlin
val s3Client = S3Client {
    region = Region.AP_NORTHEAST_2
    credentials {
        accessKeyId = System.getenv("AWS_S3_ACCESS_KEY_ID")
        secretAccessKey = System.getenv("AWS_S3_SECRET_ACCESS_KEY")
    }
}
```

**SES 서비스:**
```kotlin
val sesClient = SesClient {
    region = Region.AP_NORTHEAST_2
    credentials {
        accessKeyId = System.getenv("AWS_SES_ACCESS_KEY_ID")
        secretAccessKey = System.getenv("AWS_SES_SECRET_ACCESS_KEY")
    }
}
```

---

### 방법 2: 기존 사용자 재사용

#### 1. 기존 사용자에 권한 추가

**경로:**
1. AWS 콘솔 → IAM → Users
2. `vality-s3-user` 선택
3. "Add permissions" → "Attach existing policies directly"
4. `AmazonSESFullAccess` 선택 (또는 커스텀 정책)
5. 권한 추가

#### 2. 환경 변수 (기존 유지)

```env
AWS_ACCESS_KEY_ID=xxx  # vality-s3-user의 키
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-northeast-2
```

#### 3. 코드에서 사용

**S3와 SES 모두 동일한 자격 증명 사용:**
```kotlin
val credentials = AwsBasicCredentials.create(
    System.getenv("AWS_ACCESS_KEY_ID"),
    System.getenv("AWS_SECRET_ACCESS_KEY")
)

val s3Client = S3Client.builder()
    .region(Region.AP_NORTHEAST_2)
    .credentialsProvider(StaticCredentialsProvider.create(credentials))
    .build()

val sesClient = SesClient.builder()
    .region(Region.AP_NORTHEAST_2)
    .credentialsProvider(StaticCredentialsProvider.create(credentials))
    .build()
```

---

## 📊 비교 요약

| 항목 | 별도 사용자 | 기존 사용자 재사용 |
|------|:----------:|:----------------:|
| **보안** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **관리 편의성** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **확장성** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **권한 분리** | ⭐⭐⭐⭐⭐ | ⭐ |
| **초기 설정** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **운영 안정성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ✅ 최종 권장 사항

### 프로덕션 환경: **별도 사용자 생성** ✅

**이유:**
- 보안 모범 사례 준수
- 서비스별 권한 분리
- 확장성 및 운영 안정성

### MVP/개발 환경: **기존 사용자 재사용도 가능** ⚠️

**조건:**
- 빠른 개발이 우선인 경우
- 프로덕션 전환 시 분리 예정인 경우

---

## 🔄 마이그레이션 계획

**현재: 기존 사용자 재사용 중인 경우**

1. **단계 1**: 별도 사용자 생성 (`vality-ses-user`)
2. **단계 2**: SES 코드에 새 자격 증명 적용
3. **단계 3**: 테스트 환경에서 검증
4. **단계 4**: 프로덕션 배포
5. **단계 5**: 기존 사용자에서 SES 권한 제거

---

## 📝 체크리스트

### 별도 사용자 생성 시

- [ ] `vality-ses-user` 생성
- [ ] SES 전용 정책 생성/연결
- [ ] Access Key 생성 및 저장
- [ ] 환경 변수 추가
- [ ] 코드에 새 자격 증명 적용
- [ ] 테스트 환경에서 검증
- [ ] 프로덕션 배포

### 기존 사용자 재사용 시

- [ ] 기존 사용자에 SES 권한 추가
- [ ] 코드에서 기존 자격 증명 사용
- [ ] 테스트 환경에서 검증
- [ ] 프로덕션 배포
- [ ] 향후 분리 계획 수립

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

