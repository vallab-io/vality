# 모듈 아키텍처 설계

## 📋 현재 모듈 구조

```
di/
├── AppModule.kt          # 메인 모듈 (모든 서브 모듈 통합)
├── ConfigModule.kt        # Config 설정
├── RepositoryModule.kt    # Repository들
├── AwsModule.kt          # AWS 관련 클라이언트들
└── ServiceModule.kt      # Service들
```

---

## 🤔 S3Service 위치 결정

### 현재 구조

**AwsModule:**
- S3Client (AWS SDK 클라이언트)
- S3Presigner (Presigned URL 생성)
- **S3Service** (현재 위치)
- SesClient (AWS SDK 클라이언트)

**ServiceModule:**
- ImageUrlService
- ExternalImageUploadService (S3Service 의존)
- ImageUploadService (S3Service 의존)
- EmailService
- GoogleOAuthService
- AuthService (S3Service 의존)

---

## 📊 옵션 비교

### 옵션 1: AwsModule에 유지 (현재, 권장) ✅

**구조:**
```
AwsModule:
  - S3Client
  - S3Presigner
  - S3Service ← 여기
  - SesClient

ServiceModule:
  - ImageUploadService (S3Service 의존)
  - ExternalImageUploadService (S3Service 의존)
  - AuthService (S3Service 의존)
```

**장점:**
- ✅ **인프라스트럭처 레이어 분리**
  - AWS 관련 모든 것이 한 곳에 모여있음
  - AWS 설정 변경 시 AwsModule만 수정
- ✅ **의존성 관계 명확**
  - S3Client → S3Service → ImageUploadService
  - 레이어 구조가 명확함
- ✅ **관심사 분리**
  - AwsModule: 외부 서비스 (AWS) 통합
  - ServiceModule: 비즈니스 로직
- ✅ **재사용성**
  - S3Service는 다른 모듈에서도 사용 가능
  - AWS 관련 기능 확장 시 AwsModule만 수정

**단점:**
- ⚠️ ServiceModule이 AwsModule에 의존 (하지만 이는 정상적인 의존성)

---

### 옵션 2: ServiceModule로 이동

**구조:**
```
AwsModule:
  - S3Client
  - S3Presigner
  - SesClient

ServiceModule:
  - S3Service ← 여기로 이동
  - ImageUploadService (S3Service 의존)
  - ExternalImageUploadService (S3Service 의존)
  - AuthService (S3Service 의존)
```

**장점:**
- ✅ ServiceModule이 더 독립적 (하지만 여전히 AwsModule 의존)

**단점:**
- ❌ **관심사 분리 위배**
  - AWS 클라이언트와 서비스가 분리됨
  - AWS 관련 설정 변경 시 두 모듈 모두 수정 필요
- ❌ **의존성 관계 복잡**
  - S3Client는 AwsModule에, S3Service는 ServiceModule에
  - AWS 관련 코드가 분산됨
- ❌ **확장성 저하**
  - 향후 다른 AWS 서비스 추가 시 일관성 없음

---

## 🎯 권장 사항

### **AwsModule에 유지 권장** ✅

**이유:**

1. **레이어드 아키텍처 원칙**
   ```
   Infrastructure Layer (AwsModule)
     ↓
   Application Layer (ServiceModule)
   ```
   - S3Service는 인프라스트럭처 레이어에 속함
   - AWS SDK를 래핑한 저수준 서비스

2. **관심사 분리**
   - **AwsModule**: 외부 서비스 (AWS) 통합
   - **ServiceModule**: 비즈니스 로직

3. **의존성 방향**
   - ServiceModule → AwsModule (정상적인 의존성)
   - AwsModule은 독립적 (다른 모듈에 의존하지 않음)

4. **확장성**
   - 향후 CloudFront, RDS 등 추가 시 동일한 패턴 적용 가능
   - 모든 AWS 관련 서비스를 AwsModule에 모음

---

## 📐 아키텍처 원칙

### 레이어 구조

```
┌─────────────────────────────────┐
│   ServiceModule                 │
│   (Application Layer)           │
│   - ImageUploadService          │
│   - EmailService                │
│   - AuthService                 │
└──────────────┬──────────────────┘
               │ 의존
               ↓
┌─────────────────────────────────┐
│   AwsModule                     │
│   (Infrastructure Layer)        │
│   - S3Service                   │
│   - S3Client                    │
│   - SesClient                   │
└──────────────┬──────────────────┘
               │ 의존
               ↓
┌─────────────────────────────────┐
│   AWS SDK                        │
│   (External Library)             │
└─────────────────────────────────┘
```

### 모듈 분류 기준

**AwsModule (Infrastructure):**
- 외부 서비스 클라이언트 (S3Client, SesClient)
- 외부 서비스를 래핑한 서비스 (S3Service)
- 외부 서비스 설정 및 초기화

**ServiceModule (Application):**
- 비즈니스 로직 서비스
- 도메인 로직 구현
- 여러 인프라 서비스를 조합

---

## ✅ 최종 결론

**S3Service는 AwsModule에 유지하는 것을 권장합니다.**

**이유:**
1. 레이어드 아키텍처 원칙 준수
2. 관심사 분리 명확
3. 의존성 관계 명확
4. 확장성 및 유지보수성 향상

**현재 구조가 올바른 아키텍처 패턴을 따르고 있습니다.**

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

