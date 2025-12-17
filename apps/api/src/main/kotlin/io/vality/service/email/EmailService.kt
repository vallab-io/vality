package io.vality.service.email

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.ses.SesClient
import software.amazon.awssdk.services.ses.model.Body
import software.amazon.awssdk.services.ses.model.Content
import software.amazon.awssdk.services.ses.model.Destination
import software.amazon.awssdk.services.ses.model.Message
import software.amazon.awssdk.services.ses.model.SendEmailRequest

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
            recipients.chunked(50)
                .forEach { chunk ->
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

