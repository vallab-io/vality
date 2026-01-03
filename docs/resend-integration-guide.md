# Resend 통합 가이드

## 1. Resend 계정 설정

1. [Resend 가입](https://resend.com/signup)
2. 도메인 추가 및 인증
   - Settings → Domains → Add Domain
   - DNS 레코드 추가 (SPF, DKIM, DMARC)
3. API Key 생성
   - Settings → API Keys → Create API Key

## 2. 환경 변수 설정

`.env` 또는 `application.conf`에 추가:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Vality
```

## 3. EmailService 구현

### ResendEmailService.kt

```kotlin
package io.vality.service.email

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

/**
 * Resend 이메일 발송 서비스
 */
class ResendEmailService(
    private val apiKey: String,
    private val defaultFromEmail: String,
    private val defaultFromName: String,
) {
    private val logger = LoggerFactory.getLogger(ResendEmailService::class.java)
    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
            })
        }
    }

    companion object {
        private const val RESEND_API_URL = "https://api.resend.com/emails"
    }

    @Serializable
    private data class ResendEmailRequest(
        val from: String,
        val to: List<String>,
        val subject: String,
        val html: String? = null,
        val text: String? = null,
    )

    @Serializable
    private data class ResendEmailResponse(
        val id: String,
    )

    /**
     * 단일 이메일 발송
     */
    suspend fun sendEmail(
        to: String,
        subject: String,
        htmlBody: String,
        textBody: String? = null,
        fromEmail: String = defaultFromEmail,
        fromName: String = defaultFromName,
    ): String = withContext(Dispatchers.IO) {
        try {
            val request = ResendEmailRequest(
                from = "$fromName <$fromEmail>",
                to = listOf(to),
                subject = subject,
                html = htmlBody,
                text = textBody,
            )

            val response = httpClient.post(RESEND_API_URL) {
                headers {
                    append(HttpHeaders.Authorization, "Bearer $apiKey")
                }
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            val result = response.body<ResendEmailResponse>()
            logger.info("Email sent successfully to: $to, MessageId: ${result.id}")
            result.id
        } catch (e: Exception) {
            logger.error("Failed to send email to: $to", e)
            throw EmailServiceException("Failed to send email", e)
        }
    }

    /**
     * 대량 이메일 발송
     * Resend는 한 번에 최대 50명까지 발송 가능
     */
    suspend fun sendBulkEmail(
        recipients: List<String>,
        subject: String,
        htmlBody: String,
        textBody: String? = null,
    ): Map<String, String> = withContext(Dispatchers.IO) {
        try {
            val results = mutableMapOf<String, String>()

            // Resend는 한 번에 최대 50명까지 발송 가능
            recipients.chunked(50).forEach { chunk ->
                val request = ResendEmailRequest(
                    from = "$defaultFromName <$defaultFromEmail>",
                    to = chunk,
                    subject = subject,
                    html = htmlBody,
                    text = textBody,
                )

                val response = httpClient.post(RESEND_API_URL) {
                    headers {
                        append(HttpHeaders.Authorization, "Bearer $apiKey")
                    }
                    contentType(ContentType.Application.Json)
                    setBody(request)
                }

                val result = response.body<ResendEmailResponse>()
                
                // 모든 수신자에게 동일한 MessageId 할당
                chunk.forEach { email ->
                    results[email] = result.id
                }

                logger.info("Bulk email sent to ${chunk.size} recipients, MessageId: ${result.id}")
            }

            results
        } catch (e: Exception) {
            logger.error("Failed to send bulk email to ${recipients.size} recipients", e)
            throw EmailServiceException("Failed to send bulk email", e)
        }
    }

    /**
     * 리소스 정리
     */
    fun close() {
        httpClient.close()
    }
}
```

## 4. Koin 모듈 설정

### EmailModule.kt 수정

```kotlin
package io.vality.di

import io.vality.config.EmailConfig
import io.vality.service.email.ResendEmailService
import org.koin.dsl.module

val emailModule = module {
    single {
        val config = get<EmailConfig>()
        ResendEmailService(
            apiKey = config.resendApiKey,
            defaultFromEmail = config.fromEmail,
            defaultFromName = config.fromName,
        )
    }
}
```

## 5. Config 설정

### EmailConfig.kt

```kotlin
package io.vality.config

data class EmailConfig(
    val resendApiKey: String,
    val fromEmail: String,
    val fromName: String,
) {
    companion object {
        fun fromEnvironment(): EmailConfig {
            return EmailConfig(
                resendApiKey = System.getenv("RESEND_API_KEY")
                    ?: throw IllegalArgumentException("RESEND_API_KEY is required"),
                fromEmail = System.getenv("EMAIL_FROM")
                    ?: throw IllegalArgumentException("EMAIL_FROM is required"),
                fromName = System.getenv("EMAIL_FROM_NAME") ?: "Vality",
            )
        }
    }
}
```

## 6. 기존 AWS SES 코드 제거

### build.gradle.kts에서 제거 (선택사항)

```kotlin
// AWS SDK 제거 (더 이상 필요 없음)
// implementation("software.amazon.awssdk:ses:2.17.106")
```

## 7. 테스트

```kotlin
// 테스트 코드 예시
suspend fun testEmail() {
    val emailService = ResendEmailService(
        apiKey = "re_xxxxxxxxxxxxx",
        defaultFromEmail = "noreply@yourdomain.com",
        defaultFromName = "Vality"
    )
    
    val messageId = emailService.sendEmail(
        to = "test@example.com",
        subject = "Test Email",
        htmlBody = "<h1>Hello from Resend!</h1>",
        textBody = "Hello from Resend!"
    )
    
    println("Email sent: $messageId")
}
```

## 8. 웹훅 설정 (선택사항)

이메일 이벤트 추적을 위해 웹훅을 설정할 수 있습니다:

1. Resend Dashboard → Webhooks → Add Webhook
2. Endpoint URL 설정: `https://yourdomain.com/api/webhooks/resend`
3. 이벤트 선택: `email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`

### Webhook Handler 예시

```kotlin
fun Route.resendWebhookRoutes() {
    post("/api/webhooks/resend") {
        val payload = call.receive<ResendWebhookPayload>()
        
        when (payload.type) {
            "email.sent" -> {
                // 이메일 발송 완료 처리
            }
            "email.delivered" -> {
                // 이메일 전달 완료 처리
            }
            "email.bounced" -> {
                // 이메일 반송 처리
            }
            "email.opened" -> {
                // 이메일 열람 처리
            }
            "email.clicked" -> {
                // 링크 클릭 처리
            }
        }
        
        call.respond(HttpStatusCode.OK)
    }
}
```

## 장점

1. **간단한 API**: REST API로 구현이 쉬움
2. **무료 티어**: 3,000 이메일/월 무료
3. **빠른 발송**: 평균 1-2초 내 발송
4. **웹훅 지원**: 이메일 이벤트 실시간 추적
5. **도메인 인증**: SPF, DKIM, DMARC 자동 설정

## 주의사항

1. **도메인 인증 필수**: 발송 전 도메인 인증 필요
2. **Rate Limit**: 초당 10개 요청 제한 (Pro 플랜은 더 높음)
3. **대량 발송**: 50명씩 배치로 나누어 발송

