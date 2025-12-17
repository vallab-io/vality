package io.vality.routing.test

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.service.email.EmailService
import kotlinx.serialization.Serializable
import org.koin.ktor.ext.inject

@Serializable
data class TestEmailRequest(
    val to: String,
    val subject: String? = null,
    val htmlBody: String? = null,
    val textBody: String? = null,
)

fun Route.testRoutes() {
    val emailService: EmailService by inject()

    route("/api/test") {
        /**
         * POST /api/test/email
         *
         * AWS SES 이메일 발송 테스트
         *
         * Request Body:
         * {
         *   "to": "test@example.com",
         *   "subject": "테스트 이메일",
         *   "htmlBody": "<h1>테스트</h1><p>이것은 테스트 이메일입니다.</p>",
         *   "textBody": "테스트\n\n이것은 테스트 이메일입니다."
         * }
         */
        post("/email") {
            try {
                val request = call.receive<TestEmailRequest>()

                // 필수 필드 검증
                if (request.to.isBlank()) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>("이메일 주소(to)는 필수입니다."),
                    )
                    return@post
                }

                // 기본값 설정
                val subject = request.subject ?: "Vality 테스트 이메일"
                val htmlBody = request.htmlBody ?: """
                    <h1>Vality 테스트 이메일</h1>
                    <p>이것은 AWS SES 테스트 이메일입니다.</p>
                    <p>발송 시간: ${java.time.Instant.now()}</p>
                """.trimIndent()
                val textBody = request.textBody ?: """
                    Vality 테스트 이메일
                    
                    이것은 AWS SES 테스트 이메일입니다.
                    발송 시간: ${java.time.Instant.now()}
                """.trimIndent()

                // 이메일 발송
                val messageId = emailService.sendEmail(
                    to = request.to,
                    subject = subject,
                    htmlBody = htmlBody,
                    textBody = textBody,
                )

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = mapOf("messageId" to messageId, "to" to request.to, "subject" to subject)),
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to send test email", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>("이메일 발송에 실패했습니다: ${e.message}"),
                )
            }
        }
    }
}

