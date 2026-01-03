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
 *
 * - 단일 이메일 발송
 * - 대량 이메일 발송 (최대 50명씩 배치 처리)
 */
class EmailService(
    private val apiKey: String,
    private val defaultFromEmail: String,
    private val defaultFromName: String,
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)
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
     *
     * @param to 수신자 이메일 주소
     * @param subject 이메일 제목
     * @param htmlBody HTML 본문
     * @param textBody 텍스트 본문 (선택사항)
     * @param fromEmail 발신자 이메일 주소
     * @param fromName 발신자 이름
     * @return 발송 성공 시 MessageId
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
     * 리소스 정리
     */
    fun close() {
        httpClient.close()
    }
}

/**
 * 이메일 서비스 예외
 */
class EmailServiceException(message: String, cause: Throwable? = null) : Exception(message, cause)

