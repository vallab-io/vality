# 이미지 업로드 시스템 구현 계획

## 📋 개요

Vality 서비스에서 이미지 업로드가 필요한 시나리오와 구현 계획을 정리한 문서입니다.

---

## 🎯 이미지 업로드가 필요한 시나리오

### 1. 프로필 이미지
- **사용자 프로필 이미지** (`User.avatarUrl`)
  - 설정 페이지에서 프로필 이미지 업로드
  - Google OAuth 로그인 시 프로필 이미지를 S3로 자동 업로드
  - 현재 상태: Google OAuth에서 URL만 가져옴, S3 업로드 미구현
  - 우선순위: **중간**

### 2. 뉴스레터 콘텐츠 이미지
- **뉴스레터 본문에 삽입되는 이미지**
  - TipTap 에디터에서 이미지 업로드
  - 현재 상태: Mock 업로드 (URL.createObjectURL 사용)
  - 우선순위: **높음** (핵심 기능)

---

## 🛠 구현 방식 비교

### 옵션 1: AWS S3 Presigned URL (추천 ⭐⭐)

**개요:**
- 프론트엔드에서 직접 S3에 업로드
- 백엔드가 Presigned URL 생성
- 업로드 후 백엔드에 URL만 전달

**장점:**
- ✅ **서버 부하 최소화** (이미지가 서버를 거치지 않음)
- ✅ **업로드 속도 빠름** (직접 S3 업로드)
- ✅ **비용 효율적** (서버 대역폭 사용 없음)
- ✅ **확장성 우수** (대용량 파일 처리 용이)

**단점:**
- ❌ **보안 설정 복잡** (CORS, 버킷 정책)
- ❌ **이미지 최적화 어려움** (프론트엔드에서 처리 필요)

**구현 흐름:**
```
1. 프론트엔드: 이미지 선택
2. 프론트엔드: 백엔드에 Presigned URL 요청
3. 백엔드: S3 Presigned URL 생성 및 반환
4. 프론트엔드: Presigned URL로 직접 S3 업로드
5. 프론트엔드: 업로드 완료 후 백엔드에 URL 전달
```

---

### 옵션 2: 백엔드를 통한 업로드

**개요:**
- 프론트엔드 → 백엔드 → S3
- 백엔드가 이미지 처리 및 최적화

**장점:**
- ✅ **이미지 최적화 용이** (서버에서 리사이징, 포맷 변환)
- ✅ **보안 관리 용이** (서버에서 검증)
- ✅ **일관된 처리** (모든 이미지 동일한 처리)

**단점:**
- ❌ **서버 부하 증가** (이미지가 서버를 거침)
- ❌ **업로드 속도 느림** (서버를 거쳐야 함)
- ❌ **비용 증가** (서버 대역폭 사용)
- ❌ **확장성 제한** (대용량 파일 처리 어려움)

**구현 흐름:**
```
1. 프론트엔드: 이미지 선택
2. 프론트엔드: 백엔드에 이미지 업로드 (multipart/form-data)
3. 백엔드: 이미지 검증 및 최적화
4. 백엔드: S3에 업로드
5. 백엔드: 업로드된 URL 반환
```

---

### 옵션 3: 하이브리드 방식 (추천 ⭐)

**개요:**
- Presigned URL 방식 + 백엔드 이미지 최적화
- 업로드 후 백엔드에서 최적화 작업 수행

**장점:**
- ✅ **업로드 속도 빠름** (직접 S3 업로드)
- ✅ **이미지 최적화 가능** (백그라운드 처리)
- ✅ **서버 부하 분산** (업로드와 최적화 분리)

**단점:**
- ❌ **구현 복잡도 높음**
- ❌ **최적화 지연** (비동기 처리)

**구현 흐름:**
```
1. 프론트엔드: 이미지 선택
2. 프론트엔드: 백엔드에 Presigned URL 요청
3. 백엔드: S3 Presigned URL 생성 및 반환
4. 프론트엔드: Presigned URL로 직접 S3 업로드
5. 프론트엔드: 업로드 완료 후 백엔드에 URL 전달
6. 백엔드: 이미지 최적화 작업 큐에 추가 (비동기)
7. 백엔드: 최적화 완료 후 원본 이미지 교체
```

---

## 🎯 최종 추천: AWS S3 Presigned URL (옵션 1)

**이유:**
1. **서버 부하 최소화** (MVP 단계에서 중요)
2. **구현 간단** (Presigned URL만 생성하면 됨)
3. **비용 효율적** (서버 대역폭 사용 없음)
4. **확장성 우수** (대용량 파일 처리 용이)

**이미지 최적화는 선택적으로:**
- MVP 단계: 최적화 없이 진행
- 성장 단계: AWS Lambda 또는 백엔드에서 비동기 최적화 추가

---

## 📁 구현 구조

```
apps/api/src/main/kotlin/io/vality/
├── service/
│   └── upload/
│       ├── S3Service.kt              # AWS S3 클라이언트
│       └── ImageUploadService.kt     # 이미지 업로드 서비스
├── routing/
│   └── upload/
│       └── uploadRoutes.kt          # 업로드 API 라우팅
└── dto/
    └── upload/
        ├── PresignedUrlRequest.kt    # Presigned URL 요청 DTO
        └── PresignedUrlResponse.kt   # Presigned URL 응답 DTO
```

---

## 🔧 구현 단계

### Phase 1: AWS S3 기본 설정 (우선순위: 높음)

#### 1.1 AWS S3 설정
- [ ] AWS 계정 생성 및 S3 버킷 생성
- [ ] 버킷 정책 설정 (CORS, Public Access)
- [ ] IAM 사용자 생성 및 권한 설정
- [ ] 환경 변수 설정 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET=vality-resources`)

**예상 시간**: 1-2시간

#### 1.2 S3 버킷 구조 설계
```
vality-resources/
├── users/              # 프로필 이미지
│   └── {userId}/
│       └── {timestamp}-{filename}
└── issues/          # 이슈 이미지
    └── {issueId}/
        └── {timestamp}-{filename}
```

**예상 시간**: 30분

---

### Phase 2: S3 서비스 구현 (우선순위: 높음)

#### 2.1 S3Service 구현
- [x] AWS SDK for Java v2 의존성 추가
- [x] `S3Service` 클래스 생성
- [x] 파일 업로드 메서드 (`putObject`) - 서버에서 직접 업로드용
- [x] 파일 삭제 메서드 (`deleteFile`)
- [x] 파일 존재 확인 메서드 (`fileExists`)
- [ ] Presigned URL 생성 메서드 (`generatePresignedUrl`) - 프론트엔드용, 나중에 구현

**예상 시간**: 2-3시간

#### 2.2 ImageUploadService 구현
- [ ] `ImageUploadService` 클래스 생성
- [ ] 이미지 타입별 Presigned URL 생성
  - 프로필 이미지 (users/)
  - 이슈 이미지 (issues/)
- [ ] 파일명 생성 로직 (타임스탬프 + 원본 파일명)
- [ ] 파일 크기/타입 검증

**예상 시간**: 2-3시간

---

### Phase 3: 업로드 API 구현 (우선순위: 높음)

#### 3.1 Presigned URL API
- [ ] `POST /api/upload/presigned-url` 엔드포인트
- [ ] 요청 파라미터: `type` (user/issue), `filename`, `contentType`, `issueId` (issue 타입일 때만)
- [ ] Presigned URL 생성 및 반환
- [ ] 인증 필요 (JWT)

**예상 시간**: 2-3시간

#### 3.2 업로드 완료 API (선택)
- [ ] `POST /api/upload/complete` 엔드포인트
- [ ] 업로드 완료 후 URL 저장
- [ ] 프로필 이미지: User.avatarUrl 업데이트

**예상 시간**: 2-3시간

---

### Phase 4: 프론트엔드 연동 (우선순위: 높음)

#### 4.1 프로필 이미지 업로드
- [ ] 설정 페이지에 이미지 업로드 UI 추가
- [ ] Presigned URL 요청 API 함수
- [ ] S3 직접 업로드 로직
- [ ] 업로드 진행률 표시
- [ ] 프로필 이미지 미리보기

**예상 시간**: 3-4시간

#### 4.2 이슈 에디터 이미지 업로드
- [ ] TipTap 에디터 이미지 업로드 핸들러 수정
- [ ] Presigned URL 요청 및 S3 업로드
- [ ] 마크다운 이미지 링크 생성
- [ ] 드래그 앤 드롭 지원

**예상 시간**: 3-4시간

---

### Phase 5: 이미지 최적화 (우선순위: 중간)

#### 5.1 이미지 리사이징 (선택)
- [ ] AWS Lambda 함수 생성 (이미지 리사이징)
- [ ] S3 이벤트 트리거 설정
- [ ] 업로드 시 자동 리사이징
- [ ] 원본 + 리사이즈된 이미지 저장

**예상 시간**: 4-5시간

#### 5.2 이미지 포맷 변환 (선택)
- [ ] WebP 변환
- [ ] 품질 최적화
- [ ] 파일 크기 최소화

**예상 시간**: 2-3시간

---

## 🌐 이미지 URL 관리 전략

### URL 구조 설계

**핵심 원칙: DB에는 상대 경로만 저장, Base URL은 환경 변수로 관리**

#### 1. DB 저장 방식

**DB에는 S3 Key (상대 경로)만 저장:**
```kotlin
// User.avatarUrl
"users/user123/1234567890-image.jpg"

// 이슈 본문 이미지 (마크다운)
"![alt text](issues/issue456/1234567890-image.jpg)"
```

**장점:**
- ✅ **도메인 변경 용이**: 환경 변수만 변경하면 됨
- ✅ **DB 마이그레이션 불필요**: 절대 URL이 DB에 저장되지 않음
- ✅ **환경별 분리**: 개발/스테이징/프로덕션 환경 분리 용이
- ✅ **CDN 전환 용이**: CloudFront 도메인 변경 시 코드 수정 최소화

#### 2. URL 생성 방식

**환경 변수로 Base URL 관리:**
```env
# 개발 환경
RESOURCE_BASE_URL=https://vality-resources.s3.ap-northeast-2.amazonaws.com

# 프로덕션 환경 (CloudFront)
RESOURCE_BASE_URL=https://cdn.vality.io

# 또는 CloudFront 기본 도메인
RESOURCE_BASE_URL=https://d1234567890.cloudfront.net
```

**서비스 레이어에서 URL 생성:**
```kotlin
class ImageUrlService(
    private val baseUrl: String // 환경 변수에서 주입
) {
    fun getImageUrl(key: String): String {
        return if (key.startsWith("http://") || key.startsWith("https://")) {
            // 이미 절대 URL인 경우 (마이그레이션 전 호환성)
            key
        } else {
            // 상대 경로인 경우 Base URL과 조합
            "$baseUrl/$key".replace("//", "/").replace(":/", "://")
        }
    }
    
    fun getAvatarUrl(user: User): String? {
        return user.avatarUrl?.let { getImageUrl(it) }
    }
}
```

#### 3. URL 마이그레이션 전략

**기존 절대 URL이 DB에 저장된 경우:**
```kotlin
// 마이그레이션 스크립트 (한 번만 실행)
suspend fun migrateImageUrls() {
    // User.avatarUrl 마이그레이션
    val users = userRepository.findAll()
    users.forEach { user ->
        user.avatarUrl?.let { url ->
            if (url.startsWith("http")) {
                // 절대 URL에서 Key 추출
                val key = extractKeyFromUrl(url)
                userRepository.updateAvatarUrl(user.id, key)
            }
        }
    }
    
}

fun extractKeyFromUrl(url: String): String {
    // https://cdn.vality.io/users/user123/1234567890-image.jpg
    // -> users/user123/1234567890-image.jpg
    return url.substringAfter("cdn.vality.io/")
        .substringAfter("cloudfront.net/")
        .substringAfter("s3.ap-northeast-2.amazonaws.com/")
}
```

#### 4. CloudFront 커스텀 도메인 설정

**서브도메인 사용 (추천 ⭐): 별도 도메인 구매 불필요**

기존 도메인(`vality.io`)의 서브도메인을 사용하면 **별도 도메인 구매가 필요 없습니다**.

**추천 서브도메인 옵션:**
- `cdn.vality.io` - CDN 용도로 명확
- `resource.vality.io` - 리소스 서버 의미
- `assets.vality.io` - 에셋 서버 의미
- `static.vality.io` - 정적 파일 의미

**설정 방법:**

1. **CloudFront Distribution 생성**
   - Origin: S3 버킷
   - Alternate Domain Names (CNAMEs): `cdn.vality.io` (또는 원하는 서브도메인)
   - SSL Certificate: ACM에서 발급 (무료, 자동 갱신)

2. **DNS 설정 (기존 도메인 관리자에서)**
   ```
   cdn.vality.io  CNAME  d1234567890.cloudfront.net
   ```
   - 기존 `vality.io` 도메인의 DNS 설정에 추가
   - **추가 비용 없음** ✅
   - **도메인 구매 불필요** ✅

3. **환경 변수 변경**
   ```env
   # 변경 전 (CloudFront 기본 도메인)
   RESOURCE_BASE_URL=https://d1234567890.cloudfront.net
   
   # 변경 후 (커스텀 서브도메인)
   RESOURCE_BASE_URL=https://cdn.vality.io
   ```

4. **코드 변경 없음** ✅
   - DB에는 여전히 상대 경로만 저장
   - `ImageUrlService`가 환경 변수 기반으로 URL 생성
   - 배포만 하면 자동으로 새 도메인 사용

**별도 도메인 구매가 필요한 경우:**
- `valitecdn.com` 같은 완전히 다른 도메인을 원하는 경우
- 하지만 **서브도메인으로 충분**하므로 추천하지 않음

#### 5. URL 구조 예시

**MVP 단계 (S3 직접 URL):**
```
https://vality-resources.s3.ap-northeast-2.amazonaws.com/users/user123/1234567890-image.jpg
```

**성장 단계 (CloudFront 기본 도메인):**
```
https://d1234567890.cloudfront.net/users/user123/1234567890-image.jpg
```

**프로덕션 단계 (서브도메인 - 추천 ⭐):**
```
https://cdn.vality.io/users/user123/1234567890-image.jpg
```

**별도 도메인 사용 (비추천):**
```
https://valitecdn.com/users/user123/1234567890-image.jpg
```
- 별도 도메인 구매 필요 (연간 $10-15)
- 서브도메인으로 충분하므로 불필요한 비용

**모든 경우 DB에는 동일하게 저장:**
```
users/user123/1234567890-image.jpg
```

---

## 🔄 Google OAuth 프로필 이미지 자동 업로드

### 개요

Google OAuth 로그인 시 프로필 이미지를 자동으로 S3에 업로드하여:
- ✅ Google 서버 의존성 제거
- ✅ 일관된 URL 구조 유지
- ✅ 나중에 이미지 최적화 가능
- ✅ CDN 캐싱 활용 가능

### 구현 흐름

```
1. Google OAuth 로그인 완료
2. Google에서 프로필 이미지 URL 받음 (예: https://lh3.googleusercontent.com/...)
3. 백엔드에서 이미지 다운로드
4. S3에 업로드 (users/user123/1234567890-image.jpg)
5. DB에 S3 Key 저장
6. 사용자에게 일관된 이미지 URL 제공
```

### 장점

- **일관성**: 모든 프로필 이미지가 같은 도메인에서 제공
- **안정성**: Google 서버 장애 시에도 이미지 접근 가능
- **최적화**: 나중에 이미지 리사이징/최적화 가능
- **CDN**: CloudFront를 통한 빠른 전송

### 주의사항

- **에러 처리**: 이미지 다운로드 실패 시 원본 Google URL 유지 (호환성)
- **비용**: 추가 S3 스토리지 비용 발생 (하지만 매우 작음)
- **지연**: 이미지 다운로드/업로드로 인한 약간의 지연 (비동기 처리 가능)

### 구현 예시

```kotlin
class ExternalImageUploadService(
    private val s3Service: S3Service,
    private val imageUrlService: ImageUrlService,
    private val httpClient: HttpClient
) {
    /**
     * 외부 URL에서 이미지를 다운로드하여 S3에 업로드
     */
    suspend fun uploadFromExternalUrl(
        externalUrl: String,
        userId: String
    ): String? {
        return try {
            // 1. 외부 URL에서 이미지 다운로드
            val imageBytes = httpClient.get(externalUrl) {
                headers {
                    append(HttpHeaders.Accept, "image/*")
                }
            }.readBytes()
            
            // 2. 이미지 검증 및 파일명 생성
            val contentType = detectContentType(imageBytes)
            val extension = getExtensionFromContentType(contentType)
            val timestamp = System.currentTimeMillis()
            val uniqueFilename = "$timestamp-image.$extension"
            val key = S3Paths.userPath(userId, uniqueFilename)
            
            // 3. S3에 업로드
            val request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(imageBytes.size.toLong())
                .build()
            
            s3Service.putObject(request, RequestBody.fromBytes(imageBytes))
            
            logger.info("Uploaded external image to S3: $externalUrl -> $key")
            key
        } catch (e: Exception) {
            logger.error("Failed to upload external image: $externalUrl", e)
            null  // 실패 시 null 반환 (원본 URL 유지)
        }
    }
}

// AuthService에서 사용
suspend fun socialLogin(
    provider: String,
    providerUserId: String,
    email: String,
    name: String?,
    avatarUrl: String?  // Google에서 받은 프로필 이미지 URL
): AuthResponse {
    // ... 기존 로직 ...
    
    // Google 프로필 이미지가 있으면 S3로 업로드
    val s3AvatarKey = if (provider == "google" && avatarUrl != null) {
        externalImageUploadService.uploadFromExternalUrl(avatarUrl, user.id)
            ?: avatarUrl  // 업로드 실패 시 원본 URL 유지
    } else {
        avatarUrl
    }
    
    // DB에 저장
    val updatedUser = user.copy(avatarUrl = s3AvatarKey)
    userRepository.update(updatedUser)
    
    // ... 나머지 로직 ...
}
```

---

## 📝 구현 상세

### 1. S3 버킷 구조

```kotlin
object S3Paths {
    const val USERS = "users"
    const val ISSUES = "issues"
    
    /**
     * 프로필 이미지 경로 생성
     * @param userId 사용자 ID
     * @param filename 파일명 (타임스탬프 포함, 예: "1234567890-image.jpg")
     * @return S3 Key (예: "users/user123/1234567890-image.jpg")
     */
    fun userPath(userId: String, filename: String): String {
        return "$USERS/$userId/$filename"
    }
    
    /**
     * 이슈 이미지 경로 생성
     * @param issueId 이슈 ID
     * @param filename 파일명 (타임스탬프 포함, 예: "1234567890-image.jpg")
     * @return S3 Key (예: "issues/issue456/1234567890-image.jpg")
     */
    fun issuePath(issueId: String, filename: String): String {
        return "$ISSUES/$issueId/$filename"
    }
}
```

### 2. S3Service 구현 예시

```kotlin
class S3Service(
    private val s3Client: S3Client,
    private val bucketName: String,
    private val region: String
) {
    suspend fun generatePresignedUrl(
        key: String,
        contentType: String,
        expiresIn: Long = 3600 // 1시간
    ): String {
        val request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build()
        
        val presignedRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(expiresIn))
            .putObjectRequest(request)
            .build()
        
        val presigner = S3Presigner.create()
        val presignedUrl = presigner.presignPutObject(presignedRequest)
        
        return presignedUrl.url().toString()
    }
    
    suspend fun deleteFile(key: String) {
        val request = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()
        
        s3Client.deleteObject(request)
    }
    
    suspend fun fileExists(key: String): Boolean {
        val request = HeadObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()
        
        return try {
            s3Client.headObject(request)
            true
        } catch (e: NoSuchKeyException) {
            false
        }
    }
}
```

### 3. ImageUrlService 구현 예시

```kotlin
class ImageUrlService(
    private val baseUrl: String // 환경 변수에서 주입 (RESOURCE_BASE_URL)
) {
    /**
     * S3 Key (상대 경로)를 절대 URL로 변환
     * 
     * @param key S3 Key (예: "users/user123/1234567890-image.jpg")
     * @return 절대 URL (예: "https://cdn.vality.io/users/user123/1234567890-image.jpg")
     */
    fun getImageUrl(key: String): String {
        // 이미 절대 URL인 경우 그대로 반환 (마이그레이션 전 호환성)
        if (key.startsWith("http://") || key.startsWith("https://")) {
            return key
        }
        
        // 상대 경로인 경우 Base URL과 조합
        val normalizedBaseUrl = baseUrl.removeSuffix("/")
        val normalizedKey = key.removePrefix("/")
        return "$normalizedBaseUrl/$normalizedKey"
    }
    
    /**
     * 사용자 아바타 URL 반환
     */
    fun getAvatarUrl(user: User): String? {
        return user.avatarUrl?.let { getImageUrl(it) }
    }
}
```

### 4. ImageUploadService 구현 예시

```kotlin
class ImageUploadService(
    private val s3Service: S3Service,
    private val imageUrlService: ImageUrlService  // URL 생성 서비스 주입
) {
    suspend fun generatePresignedUrl(
        userId: String,
        type: ImageType,
        filename: String,
        contentType: String,
        issueId: String? = null
    ): PresignedUrlResponse {
        // 파일명 생성 (타임스탬프 + 원본 파일명)
        val extension = filename.substringAfterLast('.', "")
        val timestamp = System.currentTimeMillis()
        val uniqueFilename = "$timestamp-$filename"
        
        // 경로 생성
        val key = when (type) {
            ImageType.USER -> S3Paths.userPath(userId, uniqueFilename)
            ImageType.ISSUE -> {
                requireNotNull(issueId) { "issueId is required for issue images" }
                S3Paths.issuePath(issueId, uniqueFilename)
            }
        }
        
        // Presigned URL 생성
        val presignedUrl = s3Service.generatePresignedUrl(key, contentType)
        
        // 공개 접근 URL 생성 (환경 변수 기반)
        // DB에는 key만 저장하고, URL은 서비스 레이어에서 생성
        val publicUrl = imageUrlService.getImageUrl(key)
        
        return PresignedUrlResponse(
            presignedUrl = presignedUrl,
            publicUrl = publicUrl,
            key = key  // DB에 저장할 상대 경로
        )
    }
    
    suspend fun validateImage(file: ByteArray, contentType: String): Boolean {
        // 파일 크기 검증 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            throw IllegalArgumentException("File size exceeds 10MB")
        }
        
        // 이미지 타입 검증
        val allowedTypes = listOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (!allowedTypes.contains(contentType)) {
            throw IllegalArgumentException("Invalid image type. Allowed: JPEG, PNG, GIF, WebP")
        }
        
        return true
    }
}

enum class ImageType {
    USER,    // 프로필 이미지
    ISSUE    // 이슈 이미지
}
```

### 7. 업로드 API 구현 예시

```kotlin
fun Route.uploadRoutes() {
    val imageUploadService: ImageUploadService by inject()
    
    route("/api/upload") {
        authenticate {
            // Presigned URL 생성
            post("/presigned-url") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.subject ?: return@post call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized")
                )
                
                val request = call.receive<PresignedUrlRequest>()
                
                try {
                    val response = imageUploadService.generatePresignedUrl(
                        userId = userId,
                        type = request.type,
                        filename = request.filename,
                        contentType = request.contentType,
                        issueId = request.issueId
                    )
                    
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = response)
                    )
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Invalid request")
                    )
                }
            }
            
            // 업로드 완료 (프로필 이미지)
            post("/avatar/complete") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.subject ?: return@post call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized")
                )
                
                val request = call.receive<UploadCompleteRequest>()
                
                try {
                    // User.avatarUrl 업데이트 (key만 저장)
                    // request.url은 "https://cdn.vality.io/users/..." 형식이지만
                    // DB에는 "users/user123/1234567890-image.jpg"만 저장
                    val key = extractKeyFromUrl(request.url)
                    authService.updateAvatarUrl(userId, key)
                    
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success<Nothing>(message = "Avatar updated successfully")
                    )
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = e.message ?: "Failed to update avatar")
                    )
                }
            }
        }
    }
}
```

### 8. 프론트엔드 구현 예시

```typescript
// lib/api/upload.ts
export interface PresignedUrlRequest {
  type: 'user' | 'issue';
  filename: string;
  contentType: string;
  issueId?: string;  // issue 타입일 때만 필요
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}

export async function getPresignedUrl(
  request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
    '/api/upload/presigned-url',
    request
  );
  return response.data.data;
}

export async function uploadToS3(
  file: File,
  presignedUrl: string
): Promise<void> {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}

export async function uploadImage(
  file: File,
  type: 'user' | 'issue',
  issueId?: string  // issue 타입일 때만 필요
): Promise<string> {
  // 1. Presigned URL 요청
  const { presignedUrl, publicUrl, key } = await getPresignedUrl({
    type,
    filename: file.name,
    contentType: file.type,
    issueId,
  });
  
  // 2. S3에 직접 업로드
  await uploadToS3(file, presignedUrl);
  
  // 3. 공개 URL 반환
  // 참고: DB에는 key만 저장하고, URL은 서비스 레이어에서 생성
  return publicUrl;
}
```

### 9. 환경 변수 설정

```env
# apps/api/.env
# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=vality-resources

# 이미지 Base URL (환경별로 변경 가능)
# 개발 환경: S3 직접 URL
RESOURCE_BASE_URL=https://vality-resources.s3.ap-northeast-2.amazonaws.com

# 프로덕션 환경: CloudFront 서브도메인 (추천)
# 기존 도메인의 서브도메인 사용 - 별도 도메인 구매 불필요
RESOURCE_BASE_URL=https://cdn.vality.io

# 또는 다른 서브도메인 옵션
# RESOURCE_BASE_URL=https://resource.vality.io
# RESOURCE_BASE_URL=https://assets.vality.io
# RESOURCE_BASE_URL=https://static.vality.io

# CloudFront 기본 도메인 (임시 사용 가능)
# RESOURCE_BASE_URL=https://d1234567890.cloudfront.net
```

### 10. S3 버킷 CORS 설정

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://vality.io"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 11. S3 버킷 정책 (Public Read)

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

---

## 🔄 URL 마이그레이션 가이드

### 기존 절대 URL을 상대 경로로 변환

만약 기존에 절대 URL이 DB에 저장되어 있다면, 한 번만 실행하는 마이그레이션 스크립트:

```kotlin
suspend fun migrateImageUrlsToKeys() {
    // User.avatarUrl 마이그레이션
    val users = userRepository.findAll()
    users.forEach { user ->
        user.avatarUrl?.let { url ->
            if (url.startsWith("http")) {
                val key = extractKeyFromUrl(url)
                userRepository.updateAvatarUrl(user.id, key)
                logger.info("Migrated user ${user.id} avatar: $url -> $key")
            }
        }
    }
    
}

fun extractKeyFromUrl(url: String): String {
    // 다양한 URL 형식에서 Key 추출
    return when {
        url.contains("resource.vality.io/") -> 
            url.substringAfter("resource.vality.io/")
        url.contains("cloudfront.net/") -> 
            url.substringAfter("cloudfront.net/")
        url.contains("s3.") && url.contains("amazonaws.com/") -> 
            url.substringAfter("amazonaws.com/").substringAfter("/")
        else -> {
            // URL에서 마지막 경로 부분만 추출
            url.substringAfterLast("/")
        }
    }
}
```

---

## 🔍 보안 고려사항

### 1. 파일 검증
- **파일 타입 검증**: MIME 타입 확인 (JPEG, PNG, GIF, WebP만 허용)
- **파일 크기 제한**: 프로필 이미지 5MB, 이슈 이미지 10MB
- **파일명 검증**: 경로 탐색 공격 방지 (../ 제거)

### 2. Presigned URL 보안
- **만료 시간**: 1시간 이내 권장
- **인증 필요**: JWT 토큰 필수
- **사용자별 권한**: 자신의 파일만 업로드 가능

### 3. S3 버킷 보안
- **Public Read**: 업로드된 이미지는 공개 읽기 가능
- **Public Write 금지**: Presigned URL로만 업로드 가능
- **CORS 설정**: 허용된 도메인만 업로드 가능

---

## 📊 비용 예상

### AWS S3 비용
- **스토리지**: GB당 $0.023/월 (ap-northeast-2)
- **요청**: PUT 요청 1,000건당 $0.005
- **데이터 전송**: 아웃바운드 1GB당 $0.09

### 예상 사용량 (MVP 단계)
- 프로필 이미지: 사용자당 1개 (평균 200KB)
- 이슈 이미지: 이슈당 평균 3개 (평균 500KB)
- 월 100명 사용자, 50개 이슈
  - 스토리지: 약 100MB → **$0.002/월**
  - 요청: 약 250건 → **$0.001/월**
  - **총 약 $0.01/월** (거의 무료)

### CloudFront 비용 (선택)
- **데이터 전송**: 첫 1TB 무료, 이후 GB당 $0.085
- **요청**: 10,000건당 $0.0075

---

## 🚀 향후 개선 사항

### 단기 (MVP 이후)
- [ ] 이미지 리사이징 (자동 썸네일 생성)
- [ ] 이미지 포맷 최적화 (WebP 변환)
- [ ] 이미지 압축

### 중기
- [ ] 이미지 CDN 연동 (CloudFront)
- [ ] 이미지 지연 로딩 (Lazy Loading)
- [ ] 이미지 삭제 기능

### 장기
- [ ] 이미지 편집 기능 (크롭, 필터)
- [ ] 이미지 검색 기능
- [ ] 이미지 사용량 통계

---

## ✅ 체크리스트

### MVP 필수 기능
- [ ] AWS S3 버킷 생성 및 설정
- [ ] S3Service 구현
- [ ] ImageUploadService 구현
- [ ] Presigned URL API 구현
- [ ] 프로필 이미지 업로드 (프론트엔드)
- [ ] 이슈 에디터 이미지 업로드 (프론트엔드)

### 선택 기능
- [ ] 이미지 리사이징
- [ ] 이미지 포맷 최적화
- [ ] CloudFront CDN 연동
- [ ] 이미지 삭제 기능

---

## 📚 참고 자료

- [AWS S3 문서](https://docs.aws.amazon.com/s3/)
- [AWS SDK for Kotlin](https://github.com/awslabs/aws-sdk-kotlin)
- [S3 Presigned URL 가이드](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [S3 CORS 설정](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [CloudFront 문서](https://docs.aws.amazon.com/cloudfront/)

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

