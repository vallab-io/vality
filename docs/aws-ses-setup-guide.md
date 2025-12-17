# AWS SES 초기 설정 가이드

## 📋 목차

1. [개요](#개요)
2. [AWS 계정 설정](#aws-계정-설정)
3. [SES 활성화](#ses-활성화)
4. [Sandbox 모드 해제](#sandbox-모드-해제)
5. [도메인 인증](#도메인-인증)
6. [이메일 주소 인증 (Sandbox 모드)](#이메일-주소-인증-sandbox-모드)
7. [발송 한도 증가 요청](#발송-한도-증가-요청)
8. [환경 변수 설정](#환경-변수-설정)
9. [코드 통합](#코드-통합)
10. [테스트](#테스트)

---

## 개요

AWS SES (Simple Email Service)는 이메일 발송을 위한 서비스입니다. 초기 설정을 통해 이메일 발송 기능을 활성화합니다.

**주요 단계:**
1. AWS 계정 생성 및 SES 활성화
2. Sandbox 모드 해제 (프로덕션 사용)
3. 도메인 인증 (SPF, DKIM, DMARC)
4. 발송 한도 증가 요청
5. 코드 통합

---

## AWS 계정 설정

### 1. AWS 계정 생성

1. [AWS 공식 웹사이트](https://aws.amazon.com/) 접속
2. "계정 만들기" 클릭
3. 이메일 주소, 비밀번호, 계정 이름 입력
4. 결제 정보 입력 (신용카드 등록 필요)
5. 전화번호 인증 완료

### 2. AWS 콘솔 접속

1. [AWS 콘솔](https://console.aws.amazon.com/) 접속
2. 로그인
3. 리전 선택: **ap-northeast-2 (서울)** 권장

---

## SES 활성화

### 1. SES 서비스 접속

1. AWS 콘솔에서 "Simple Email Service" 검색
2. SES 서비스 선택
3. 리전 확인: **ap-northeast-2 (서울)**

### 2. 초기 상태 확인

**Sandbox 모드:**
- 초기에는 Sandbox 모드로 시작
- 검증된 이메일 주소로만 발송 가능
- 24시간에 200통, 초당 1통 제한

---

## Sandbox 모드 해제

### 1. Sandbox 해제 신청

**경로:**
1. SES 콘솔 → "Account dashboard"
2. "Request production access" 클릭
3. 신청 양식 작성

**신청 양식 작성:**

```
Use case type: Transactional
Website URL: https://vality.io (또는 개발 도메인)
Mail Type: Transactional
Describe your use case: 
  "We are building a newsletter platform (Vality) that sends 
   newsletters to subscribers. Users can create newsletters and 
   send them to their subscribers via email. We will implement 
   proper unsubscribe mechanisms and follow email best practices."

How do you plan to build or maintain your reputation?:
  "We will:
   - Implement double opt-in for subscribers
   - Provide clear unsubscribe links
   - Monitor bounce and complaint rates
   - Maintain low bounce rate (< 5%)
   - Use verified domains for sending"

How do you plan to handle bounces and complaints?:
  "We will:
   - Process bounces immediately and remove invalid addresses
   - Handle complaints promptly
   - Monitor bounce and complaint rates
   - Implement feedback loops"
```

**처리 시간:**
- 보통 24-48시간 내 승인
- 경우에 따라 더 오래 걸릴 수 있음

### 2. Sandbox 모드 확인

**Sandbox 모드일 때:**
- 검증된 이메일 주소로만 발송 가능
- 프로덕션 사용 불가

**Sandbox 해제 후:**
- 도메인 인증 시 해당 도메인의 모든 이메일 발송 가능
- 발송 한도 증가 가능

---

## 도메인 인증

### 1. 도메인 인증 시작

**경로:**
1. SES 콘솔 → "Verified identities"
2. "Create identity" 클릭
3. "Domain" 선택
4. 도메인 입력 (예: `vality.io`)

### 2. DNS 레코드 추가

SES에서 제공하는 DNS 레코드를 도메인의 DNS 설정에 추가해야 합니다.

**필수 레코드:**

#### 1) SPF 레코드 (TXT)

```
Type: TXT
Name: @ (또는 도메인명)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```

**또는 SES에서 제공하는 레코드:**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

#### 2) DKIM 레코드 (CNAME)

SES에서 3개의 CNAME 레코드를 제공합니다:

```
Type: CNAME
Name: [SES에서 제공하는 이름]
Value: [SES에서 제공하는 값]
TTL: 3600
```

예시:
```
Type: CNAME
Name: abc123._domainkey.vality.io
Value: abc123.dkim.amazonses.com
```

**3개의 CNAME 레코드를 모두 추가해야 합니다.**

#### 3) DMARC 레코드 (TXT) - 선택사항

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@vality.io
TTL: 3600
```

### 3. DNS 레코드 추가 방법

**도메인 제공업체별 가이드:**

**Cloudflare:**
1. Cloudflare 대시보드 접속
2. 도메인 선택
3. "DNS" → "Records" 클릭
4. "Add record" 클릭
5. 레코드 타입, 이름, 값 입력
6. "Save" 클릭

**AWS Route 53:**
1. Route 53 콘솔 접속
2. 호스팅 영역 선택
3. "Create record" 클릭
4. 레코드 타입, 이름, 값 입력
5. "Create records" 클릭

**기타 DNS 제공업체:**
- 각 제공업체의 DNS 관리 페이지에서 레코드 추가
- 레코드 타입, 이름, 값, TTL 입력

### 4. 인증 확인

**경로:**
1. SES 콘솔 → "Verified identities"
2. 도메인 선택
3. "Verification status" 확인

**인증 완료까지:**
- 보통 몇 분에서 몇 시간 소요
- DNS 전파 시간에 따라 다름
- 인증 완료 시 "Verified" 상태로 변경

**인증 실패 시:**
- DNS 레코드가 올바르게 추가되었는지 확인
- TTL이 만료될 때까지 대기 (최대 48시간)
- SES 콘솔에서 "Re-verify" 클릭

---

## 이메일 주소 인증 (Sandbox 모드)

**Sandbox 모드일 때만 필요합니다.**

### 1. 이메일 주소 인증

**경로:**
1. SES 콘솔 → "Verified identities"
2. "Create identity" 클릭
3. "Email address" 선택
4. 이메일 주소 입력 (예: `noreply@vality.io`)

### 2. 인증 이메일 확인

1. 입력한 이메일 주소로 인증 이메일 발송
2. 이메일 확인
3. 인증 링크 클릭
4. SES 콘솔에서 "Verified" 상태 확인

**참고:**
- Sandbox 모드 해제 후에는 도메인 인증만으로 충분
- 개별 이메일 주소 인증은 불필요

---

## 발송 한도 증가 요청

### 1. 현재 한도 확인

**경로:**
1. SES 콘솔 → "Account dashboard"
2. "Sending limits" 확인

**기본 한도:**
- **Sandbox 모드**: 24시간에 200통, 초당 1통
- **Sandbox 해제 후**: 24시간에 200통, 초당 1통 (기본값)

### 2. 한도 증가 요청

**경로:**
1. SES 콘솔 → "Account dashboard"
2. "Request limit increase" 클릭
3. 신청 양식 작성

**신청 양식:**

```
Mail Type: Transactional
Sending rate: [원하는 초당 발송량] (예: 14)
Maximum send rate: [원하는 일일 발송량] (예: 50,000)
```

**처리 시간:**
- 보통 24시간 내 승인
- 경우에 따라 더 오래 걸릴 수 있음

**권장 한도:**
- 초당 발송량: 14 (초기)
- 일일 발송량: 50,000 (초기)
- 필요에 따라 점진적으로 증가 요청

---

## 환경 변수 설정

### 1. IAM 사용자 생성

**`vality-ses-user` 생성:**

**경로:**
1. AWS 콘솔 → "IAM" (Identity and Access Management)
2. "Users" → "Create user"
3. 사용자 이름: `vality-ses-user`
4. "Access key - Programmatic access" 선택
5. 권한 설정:
   - "Attach existing policies directly"
   - `AmazonSESFullAccess` 선택 (또는 커스텀 정책)

**커스텀 정책 생성 (권장):**

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

6. 사용자 생성
7. **Access Key ID**와 **Secret Access Key** 저장 (한 번만 표시됨)

### 2. 환경 변수 설정

**S3와 SES는 별도의 자격 증명 사용:**

`.env` 파일:
```env
# AWS 공통 설정
AWS_REGION=ap-northeast-2

# S3 설정 (vality-s3-user)
AWS_S3_ACCESS_KEY_ID=your-s3-access-key-id
AWS_S3_SECRET_ACCESS_KEY=your-s3-secret-access-key
AWS_S3_BUCKET=vality-resources

# SES 설정 (vality-ses-user)
AWS_SES_ACCESS_KEY_ID=your-ses-access-key-id
AWS_SES_SECRET_ACCESS_KEY=your-ses-secret-access-key
SES_FROM_EMAIL=noreply@vality.io
SES_FROM_NAME=Vality
```

**또는 `application.conf`:**
```hocon
aws {
    region = ap-northeast-2
}

s3 {
    accessKeyId = ${AWS_S3_ACCESS_KEY_ID}
    secretAccessKey = ${AWS_S3_SECRET_ACCESS_KEY}
    bucket = vality-resources
}

ses {
    accessKeyId = ${AWS_SES_ACCESS_KEY_ID}
    secretAccessKey = ${AWS_SES_SECRET_ACCESS_KEY}
    fromEmail = noreply@vality.io
    fromName = Vality
}
```

---

## 코드 통합

### 1. Gradle 의존성 추가

**`build.gradle.kts`:**

```kotlin
dependencies {
    // AWS SDK for Java v2 (S3와 동일한 버전 사용)
    implementation("software.amazon.awssdk:s3:2.17.106")
    implementation("software.amazon.awssdk:ses:2.17.106")
}
```

### 2. SES 서비스 구현

**`EmailService.kt`:**

```kotlin
package io.vality.service.email

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.ses.SesClient
import software.amazon.awssdk.services.ses.model.*
import java.nio.charset.StandardCharsets

/**
 * AWS SES 이메일 발송 서비스
 *
 * - 단일 이메일 발송
 * - 대량 이메일 발송 (최대 50명씩 배치 처리)
 */
class EmailService(
    private val sesClient: SesClient,
    private val fromEmail: String,
    private val fromName: String,
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)

    /**
     * 단일 이메일 발송
     *
     * @param to 수신자 이메일 주소
     * @param subject 이메일 제목
     * @param htmlBody HTML 본문
     * @param textBody 텍스트 본문 (선택사항)
     * @return 발송 성공 시 MessageId, 실패 시 예외 발생
     */
    suspend fun sendEmail(
        to: String,
        subject: String,
        htmlBody: String,
        textBody: String? = null,
    ): String = withContext(Dispatchers.IO) {
        try {
            val destination = Destination.builder()
                .toAddresses(to)
                .build()

            val subjectContent = Content.builder()
                .data(subject)
                .charset("UTF-8")
                .build()

            val bodyBuilder = Body.builder()
            bodyBuilder.html(
                Content.builder()
                    .data(htmlBody)
                    .charset("UTF-8")
                    .build()
            )
            
            textBody?.let {
                bodyBuilder.text(
                    Content.builder()
                        .data(it)
                        .charset("UTF-8")
                        .build()
                )
            }

            val message = Message.builder()
                .subject(subjectContent)
                .body(bodyBuilder.build())
                .build()

            val request = SendEmailRequest.builder()
                .source("$fromName <$fromEmail>")
                .destination(destination)
                .message(message)
                .build()

            val response = sesClient.sendEmail(request)
            val messageId = response.messageId()

            logger.info("Email sent successfully to: $to, MessageId: $messageId")
            messageId
        } catch (e: Exception) {
            logger.error("Failed to send email to: $to", e)
            throw EmailServiceException("Failed to send email", e)
        }
    }

    /**
     * 대량 이메일 발송
     *
     * SES는 한 번에 최대 50명까지 발송 가능하므로, 50명씩 배치로 나누어 발송합니다.
     *
     * @param recipients 수신자 이메일 주소 목록
     * @param subject 이메일 제목
     * @param htmlBody HTML 본문
     * @param textBody 텍스트 본문 (선택사항)
     * @return 각 수신자별 MessageId 맵
     */
    suspend fun sendBulkEmail(
        recipients: List<String>,
        subject: String,
        htmlBody: String,
        textBody: String? = null,
    ): Map<String, String> = withContext(Dispatchers.IO) {
        try {
            val results = mutableMapOf<String, String>()

            // SES는 한 번에 최대 50명까지 발송 가능
            recipients.chunked(50).forEach { chunk ->
                val destination = Destination.builder()
                    .toAddresses(chunk)
                    .build()

                val subjectContent = Content.builder()
                    .data(subject)
                    .charset("UTF-8")
                    .build()

                val bodyBuilder = Body.builder()
                bodyBuilder.html(
                    Content.builder()
                        .data(htmlBody)
                        .charset("UTF-8")
                        .build()
                )
                
                textBody?.let {
                    bodyBuilder.text(
                        Content.builder()
                            .data(it)
                            .charset("UTF-8")
                            .build()
                    )
                }

                val message = Message.builder()
                    .subject(subjectContent)
                    .body(bodyBuilder.build())
                    .build()

                val request = SendEmailRequest.builder()
                    .source("$fromName <$fromEmail>")
                    .destination(destination)
                    .message(message)
                    .build()

                val response = sesClient.sendEmail(request)
                val messageId = response.messageId()

                // 모든 수신자에게 동일한 MessageId 할당
                chunk.forEach { email ->
                    results[email] = messageId
                }

                logger.info("Bulk email sent to ${chunk.size} recipients, MessageId: $messageId")
            }

            results
        } catch (e: Exception) {
            logger.error("Failed to send bulk email to ${recipients.size} recipients", e)
            throw EmailServiceException("Failed to send bulk email", e)
        }
    }
}

/**
 * 이메일 서비스 예외
 */
class EmailServiceException(message: String, cause: Throwable? = null) : Exception(message, cause)
```

### 3. SES 클라이언트 설정

**`AppModule.kt` (Koin DI):**

```kotlin
import io.ktor.server.config.*
import org.koin.dsl.module
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.ses.SesClient

val appModule = module {
    // AWS 자격 증명 (S3와 SES 공통 사용)
    single<AwsBasicCredentials> {
        AwsBasicCredentials.create(
            getProperty("aws.accessKeyId"),
            getProperty("aws.secretAccessKey")
        )
    }
    
    // AWS SES Client
    single<SesClient> {
        SesClient.builder()
            .region(Region.of(getProperty("aws.region")))
            .credentialsProvider(
                StaticCredentialsProvider.create(get<AwsBasicCredentials>())
            )
            .build()
    }
    
    // Email Service
    single<EmailService> {
        EmailService(
            sesClient = get(),
            fromEmail = getProperty("ses.fromEmail"),
            fromName = getProperty("ses.fromName")
        )
    }
}
```

**참고:** S3 클라이언트도 동일한 자격 증명을 사용하도록 설정되어 있어야 합니다.

---

## 테스트

### 1. 단일 이메일 발송 테스트

```kotlin
// 테스트 코드
suspend fun testSendEmail() {
    val emailService = get<EmailService>()
    
    val result = emailService.sendEmail(
        to = "test@example.com",
        subject = "테스트 이메일",
        htmlBody = "<h1>테스트</h1><p>이것은 테스트 이메일입니다.</p>",
        textBody = "테스트\n\n이것은 테스트 이메일입니다."
    )
    
    result.onSuccess { messageId ->
        println("이메일 발송 성공: $messageId")
    }.onFailure { error ->
        println("이메일 발송 실패: ${error.message}")
    }
}
```

### 2. API 엔드포인트 테스트

**`POST /api/test/email`:**

```kotlin
post("/api/test/email") {
    val emailService = get<EmailService>()
    
    val result = emailService.sendEmail(
        to = "test@example.com",
        subject = "테스트 이메일",
        htmlBody = "<h1>테스트</h1>",
        textBody = "테스트"
    )
    
    result.onSuccess { messageId ->
        call.respond(HttpStatusCode.OK, mapOf("messageId" to messageId))
    }.onFailure { error ->
        call.respond(
            HttpStatusCode.InternalServerError,
            mapOf("error" to error.message)
        )
    }
}
```

### 3. 발송 확인

1. 수신 이메일 확인
2. 스팸 폴더 확인
3. SES 콘솔 → "Sending statistics"에서 발송 통계 확인

---

## 문제 해결

### 1. 인증 실패

**문제:**
- 도메인 인증이 완료되지 않음
- DNS 레코드가 올바르게 추가되지 않음

**해결:**
1. DNS 레코드 확인 (SPF, DKIM)
2. TTL 만료 대기 (최대 48시간)
3. SES 콘솔에서 "Re-verify" 클릭

### 2. 발송 실패

**문제:**
- "Email address not verified" 오류
- "Message rejected" 오류

**해결:**
1. Sandbox 모드인지 확인
2. 발송 주소가 인증되었는지 확인
3. 발송 한도 초과 여부 확인

### 3. 반송률 높음

**문제:**
- 반송률이 5% 초과
- 계정 일시 정지

**해결:**
1. 불량 이메일 주소 제거
2. 구독 취소 요청 즉시 처리
3. 이메일 주소 검증 강화

---

## 보안 고려사항

### 1. 자격 증명 보호

- ✅ 환경 변수로 관리
- ✅ 절대 코드에 하드코딩하지 않음
- ✅ IAM 사용자 최소 권한 원칙 적용

### 2. 발송 제한

- ✅ Rate limiting 구현
- ✅ 일일 발송량 모니터링
- ✅ 반송률 모니터링

### 3. 이메일 내용

- ✅ 구독 취소 링크 포함
- ✅ 발송자 정보 명시
- ✅ 스팸 필터 우회 시도 금지

---

## 다음 단계

1. ✅ SES 초기 설정 완료
2. ⬜ 이메일 템플릿 작성
3. ⬜ 뉴스레터 발송 기능 구현
4. ⬜ 구독자 관리 기능 구현
5. ⬜ 발송 통계 수집

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

