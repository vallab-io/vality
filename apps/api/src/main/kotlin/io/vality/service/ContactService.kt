package io.vality.service

import io.vality.domain.Contact
import io.vality.repository.ContactRepository
import io.vality.util.CuidGenerator
import org.slf4j.LoggerFactory
import java.time.Instant

/**
 * 문의하기 서비스
 *
 * 문의를 받아 DB에 저장하고 Slack으로 알림을 발송합니다.
 */
class ContactService(
    private val contactRepository: ContactRepository,
    private val slackService: SlackService,
) {
    private val logger = LoggerFactory.getLogger(ContactService::class.java)

    /**
     * 문의하기 처리
     *
     * @param name 문의자 이름
     * @param email 문의자 이메일
     * @param message 문의 내용
     * @param userId 로그인한 사용자 ID (nullable)
     * @return 생성된 Contact
     */
    suspend fun createContact(
        name: String,
        email: String,
        message: String,
        userId: String? = null,
    ): Contact {
        // 1. Contact 생성
        val now = Instant.now()
        val contact = Contact(
            id = CuidGenerator.generate(),
            name = name.trim(),
            email = email.trim(),
            message = message.trim(),
            userId = userId,
            createdAt = now,
        )

        // 2. DB에 저장
        val savedContact = contactRepository.create(contact)

        // 3. Slack으로 알림 발송 (비동기, 실패해도 문의는 저장됨)
        try {
            val sent = slackService.sendContactNotification(
                name = savedContact.name,
                email = savedContact.email,
                message = savedContact.message,
                userId = savedContact.userId,
            )
            if (!sent) {
                logger.warn("Failed to send Slack notification for contact: ${savedContact.id}")
            }
        } catch (e: Exception) {
            logger.error("Error sending Slack notification for contact: ${savedContact.id}", e)
            // Slack 발송 실패해도 문의는 저장되므로 예외를 다시 던지지 않음
        }

        return savedContact
    }
}
