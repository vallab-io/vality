# AWS SES 구현 가이드 (AWS SDK for Java v2)

## 📋 개요

이 가이드는 `vality-user` IAM 사용자를 사용하여 AWS SDK for Java v2로 SES를 구현하는 방법을 설명합니다.

**사전 준비:**
- ✅ `vality-user` IAM 사용자 생성 완료
- ✅ S3 권한 설정 완료
- ✅ SES 권한 추가 완료
- ✅ SES Sandbox 모드 해제 완료
- ✅ 도메인 인증 완료

---

## 1. Gradle 의존성 추가

**`apps/api/build.gradle.kts`:**

```kotlin
dependencies {
    // AWS SDK for Java v2 (S3와 동일한 버전 사용)
    implementation("software.amazon.awssdk:s3:2.17.106")
    implementation("software.amazon.awssdk:ses:2.17.106")
}
```

---

## 2. 환경 변수 설정

**`.env` 파일 (S3와 SES는 별도의 자격 증명 사용):**

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

---

## 3. EmailService 구현

**`apps/api/src/main/kotlin/io/vality/service/email/EmailService.kt`:**

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
     * @return 발송 성공 시 MessageId
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

---

## 4. DI 설정 (Koin)

**`apps/api/src/main/kotlin/io/vality/di/AppModule.kt`:**

S3와 SES는 별도의 자격 증명 사용:

```kotlin
package io.vality.di

import io.ktor.server.config.*
import org.koin.dsl.module
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.ses.SesClient
import io.vality.service.email.EmailService
import io.vality.service.upload.S3Service

val appModule = module {
    // AWS S3 자격 증명 (vality-s3-user)
    single<AwsBasicCredentials>("s3Credentials") {
        val config = get<ApplicationConfig>()
        AwsBasicCredentials.create(
            config.property("s3.accessKeyId").getString(),
            config.property("s3.secretAccessKey").getString()
        )
    }
    
    // AWS SES 자격 증명 (vality-ses-user)
    single<AwsBasicCredentials>("sesCredentials") {
        val config = get<ApplicationConfig>()
        AwsBasicCredentials.create(
            config.property("ses.accessKeyId").getString(),
            config.property("ses.secretAccessKey").getString()
        )
    }
    
    // AWS S3 Client
    single<S3Client> {
        val config = get<ApplicationConfig>()
        val credentials = get<AwsBasicCredentials>("s3Credentials")
        S3Client.builder()
            .region(Region.of(config.property("aws.region").getString()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build()
    }
    
    // AWS S3 Presigner
    single<S3Presigner> {
        val config = get<ApplicationConfig>()
        val credentials = get<AwsBasicCredentials>("s3Credentials")
        S3Presigner.builder()
            .region(Region.of(config.property("aws.region").getString()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build()
    }
    
    // AWS SES Client
    single<SesClient> {
        val config = get<ApplicationConfig>()
        val credentials = get<AwsBasicCredentials>("sesCredentials")
        SesClient.builder()
            .region(Region.of(config.property("aws.region").getString()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build()
    }
    
    // S3 Service
    single<S3Service> {
        val config = get<ApplicationConfig>()
        S3Service(
            s3Client = get(),
            s3Presigner = get(),
            bucketName = config.property("s3.bucket").getString(),
            region = config.property("aws.region").getString()
        )
    }
    
    // Email Service
    single<EmailService> {
        val config = get<ApplicationConfig>()
        EmailService(
            sesClient = get(),
            fromEmail = config.property("ses.fromEmail").getString(),
            fromName = config.property("ses.fromName").getString()
        )
    }
}
```

---

## 5. application.conf 설정

**`apps/api/src/main/resources/application.conf`:**

```hocon
aws {
    region = ${AWS_REGION}
}

s3 {
    accessKeyId = ${AWS_S3_ACCESS_KEY_ID}
    secretAccessKey = ${AWS_S3_SECRET_ACCESS_KEY}
    bucket = ${AWS_S3_BUCKET}
}

ses {
    accessKeyId = ${AWS_SES_ACCESS_KEY_ID}
    secretAccessKey = ${AWS_SES_SECRET_ACCESS_KEY}
    fromEmail = ${SES_FROM_EMAIL}
    fromName = ${SES_FROM_NAME}
}
```

---

## 6. 사용 예제

### 인증 코드 발송

**`AuthService.kt`에서 사용:**

```kotlin
class AuthService(
    // ... 기존 의존성들
    private val emailService: EmailService,
) {
    suspend fun sendVerificationCode(email: String): Boolean {
        val code = generateVerificationCode()
        val expiresAt = Instant.now().plusSeconds(600) // 10분 후 만료
        
        // 인증 코드 저장
        val verificationCode = VerificationCode(
            id = CuidGenerator.generate(),
            email = email,
            code = code,
            expiresAt = expiresAt,
            createdAt = Instant.now()
        )
        verificationCodeRepository.save(verificationCode)
        
        // 이메일 발송
        try {
            val htmlBody = """
                <h1>Vality 인증 코드</h1>
                <p>인증 코드: <strong>$code</strong></p>
                <p>이 코드는 10분 후 만료됩니다.</p>
            """.trimIndent()
            
            val textBody = """
                Vality 인증 코드
                
                인증 코드: $code
                이 코드는 10분 후 만료됩니다.
            """.trimIndent()
            
            emailService.sendEmail(
                to = email,
                subject = "Vality 인증 코드",
                htmlBody = htmlBody,
                textBody = textBody
            )
            
            return true
        } catch (e: Exception) {
            logger.error("Failed to send verification code email", e)
            return false
        }
    }
}
```

### 뉴스레터 발송

**`NewsletterService.kt`에서 사용:**

```kotlin
class NewsletterService(
    private val emailService: EmailService,
    private val subscriberRepository: SubscriberRepository,
) {
    suspend fun sendNewsletter(
        issueId: String,
        newsletterId: String,
    ): Result<Map<String, String>> {
        // 구독자 목록 조회
        val subscribers = subscriberRepository.findActiveByNewsletterId(newsletterId)
        
        // 이슈 내용 조회
        val issue = issueRepository.findById(issueId)
            ?: return Result.failure(Exception("Issue not found"))
        
        // HTML 본문 생성
        val htmlBody = generateNewsletterHtml(issue)
        val textBody = generateNewsletterText(issue)
        
        // 이메일 발송
        return try {
            val results = emailService.sendBulkEmail(
                recipients = subscribers.map { it.email },
                subject = issue.title,
                htmlBody = htmlBody,
                textBody = textBody
            )
            
            Result.success(results)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## 7. 테스트

### 단위 테스트

```kotlin
@Test
fun `test send email`() = runTest {
    val emailService = get<EmailService>()
    
    val messageId = emailService.sendEmail(
        to = "test@example.com",
        subject = "테스트 이메일",
        htmlBody = "<h1>테스트</h1>",
        textBody = "테스트"
    )
    
    assertNotNull(messageId)
}
```

### API 엔드포인트 테스트

**`POST /api/test/email`:**

```kotlin
post("/api/test/email") {
    val emailService = get<EmailService>()
    
    try {
        val messageId = emailService.sendEmail(
            to = "test@example.com",
            subject = "테스트 이메일",
            htmlBody = "<h1>테스트</h1>",
            textBody = "테스트"
        )
        
        call.respond(
            HttpStatusCode.OK,
            mapOf("messageId" to messageId)
        )
    } catch (e: Exception) {
        call.respond(
            HttpStatusCode.InternalServerError,
            mapOf("error" to (e.message ?: "Unknown error"))
        )
    }
}
```

---

## 8. 주의사항

### 발송 한도

- **Sandbox 모드**: 24시간에 200통, 초당 1통
- **프로덕션**: 한도 증가 요청 필요
- **대량 발송**: 50명씩 배치 처리 (SES 제한)

### 반송률 관리

- 반송률 5% 초과 시 계정 일시 정지 가능
- 불량 이메일 주소 정기 정리 필요
- 구독 취소 요청 즉시 처리

### 구독 취소 링크

모든 이메일에 구독 취소 링크 포함:

```kotlin
val htmlBody = """
    <h1>$title</h1>
    <div>$content</div>
    <hr>
    <p><a href="https://vality.io/unsubscribe?token=$token">구독 취소</a></p>
""".trimIndent()
```

---

## 9. 다음 단계

1. ✅ EmailService 구현 완료
2. ⬜ 인증 코드 발송 기능 연동
3. ⬜ 뉴스레터 발송 기능 구현
4. ⬜ 발송 통계 수집
5. ⬜ 반송률 모니터링

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

