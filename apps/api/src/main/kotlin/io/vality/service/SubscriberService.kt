package io.vality.service

import io.vality.domain.SubStatus
import io.vality.domain.Subscriber
import io.vality.dto.subscriber.SubscriberResponse
import io.vality.dto.subscriber.SubscribeConfirmResponse
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.SubscriberVerificationTokenRepository
import io.vality.repository.UserRepository
import io.vality.service.email.EmailService
import io.vality.service.email.EmailTemplates
import io.vality.util.CuidGenerator
import java.security.SecureRandom
import java.time.Instant
import java.util.Base64

class SubscriberService(
    private val subscriberRepository: SubscriberRepository,
    private val newsletterRepository: NewsletterRepository,
    private val subscriberVerificationTokenRepository: SubscriberVerificationTokenRepository,
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val frontendUrl: String,
) {
    private val secureRandom = SecureRandom()

    /**
     * 안전한 토큰 생성 (32바이트 랜덤 바이트를 Base64 URL-safe 인코딩)
     */
    private fun generateVerificationToken(): String {
        val bytes = ByteArray(32)
        secureRandom.nextBytes(bytes)
        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(bytes)
    }

    /**
     * 구독 확인 토큰 생성
     */
    private suspend fun createSubscribeToken(
        subscriberId: String,
        expiresInDays: Int = 7,
    ): String {
        // 기존 토큰 무효화
        subscriberVerificationTokenRepository.invalidateBySubscriberId(subscriberId)

        // 새 토큰 생성
        val token = generateVerificationToken()
        val now = Instant.now()
        val expiresAt = now.plusSeconds(expiresInDays * 24 * 60 * 60L)

        subscriberVerificationTokenRepository.create(
            io.vality.domain.SubscriberVerificationToken(
                id = CuidGenerator.generate(),
                subscriberId = subscriberId,
                token = token,
                expiresAt = expiresAt,
                usedAt = null,
                createdAt = now,
            )
        )

        return token
    }

    /**
     * 구독자 생성
     *
     * @param newsletterId 뉴스레터 ID
     * @param email 구독자 이메일
     * @param status 구독자 상태 (기본값: PENDING - 공개 구독용, ACTIVE - 관리자 직접 추가용)
     * @return 생성된 구독자
     */
    suspend fun createSubscriber(
        newsletterId: String,
        email: String,
        status: SubStatus = SubStatus.PENDING,
    ): Subscriber {
        // 뉴스레터 존재 확인
        newsletterRepository.findById(newsletterId) ?: throw IllegalArgumentException("Newsletter not found")

        // 이메일 형식 검증
        if (!email.matches(Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))) {
            throw IllegalArgumentException("Invalid email format")
        }

        // 중복 구독 확인
        val existingSubscriber = subscriberRepository.findByNewsletterIdAndEmail(newsletterId, email)
        if (existingSubscriber != null) {
            // 기존 구독자가 UNSUBSCRIBED 상태인 경우 재구독 가능
            if (existingSubscriber.status == SubStatus.UNSUBSCRIBED) {
                // 기존 구독자를 재활성화
                val now = Instant.now()
                val reactivatedSubscriber = existingSubscriber.copy(
                    status = status,
                    subscribedAt = now,
                    confirmedAt = if (status == SubStatus.ACTIVE) now else null,
                    unsubscribedAt = null,
                )
                return subscriberRepository.update(reactivatedSubscriber)
            } else {
                throw IllegalArgumentException("Subscriber with this email already exists")
            }
        }

        val now = Instant.now()
        val subscriber = Subscriber(
            id = CuidGenerator.generate(),
            email = email,
            status = status,
            subscribedAt = now,
            confirmedAt = if (status == SubStatus.ACTIVE) now else null,
            unsubscribedAt = null,
            newsletterId = newsletterId,
        )

        return subscriberRepository.create(subscriber)
    }

    /**
     * 뉴스레터의 구독자 목록 조회
     *
     * @param newsletterId 뉴스레터 ID
     * @param ownerId 소유자 ID (권한 확인용)
     * @return 구독자 목록
     */
    suspend fun getSubscribersByNewsletter(
        newsletterId: String,
        ownerId: String,
    ): List<Subscriber> {
        // 뉴스레터 소유자 확인
        val newsletter =
            newsletterRepository.findById(newsletterId) ?: throw IllegalArgumentException("Newsletter not found")

        if (newsletter.ownerId != ownerId) {
            throw IllegalArgumentException("You don't have permission to access this newsletter")
        }

        return subscriberRepository.findByNewsletterId(newsletterId)
    }

    /**
     * 구독자 삭제
     *
     * @param subscriberId 구독자 ID
     * @param newsletterId 뉴스레터 ID
     * @param ownerId 소유자 ID (권한 확인용)
     */
    suspend fun deleteSubscriber(
        subscriberId: String,
        newsletterId: String,
        ownerId: String,
    ) {
        // 뉴스레터 소유자 확인
        val newsletter =
            newsletterRepository.findById(newsletterId) ?: throw IllegalArgumentException("Newsletter not found")

        if (newsletter.ownerId != ownerId) {
            throw IllegalArgumentException("You don't have permission to delete subscribers from this newsletter")
        }

        // 구독자 존재 확인
        val subscriber =
            subscriberRepository.findById(subscriberId) ?: throw IllegalArgumentException("Subscriber not found")

        // 구독자가 해당 뉴스레터의 구독자인지 확인
        if (subscriber.newsletterId != newsletterId) {
            throw IllegalArgumentException("Subscriber does not belong to this newsletter")
        }

        subscriberRepository.delete(subscriberId)
    }

    /**
     * 구독자 상태 업데이트 (활성화, 구독 취소 등)
     *
     * @param subscriberId 구독자 ID
     * @param status 새로운 상태
     * @param newsletterId 뉴스레터 ID
     * @param ownerId 소유자 ID (권한 확인용)
     * @return 업데이트된 구독자
     */
    suspend fun updateSubscriberStatus(
        subscriberId: String,
        status: SubStatus,
        newsletterId: String,
        ownerId: String,
    ): Subscriber {
        // 뉴스레터 소유자 확인
        val newsletter =
            newsletterRepository.findById(newsletterId) ?: throw IllegalArgumentException("Newsletter not found")

        if (newsletter.ownerId != ownerId) {
            throw IllegalArgumentException("You don't have permission to update subscribers in this newsletter")
        }

        // 구독자 존재 확인
        val subscriber =
            subscriberRepository.findById(subscriberId) ?: throw IllegalArgumentException("Subscriber not found")

        // 구독자가 해당 뉴스레터의 구독자인지 확인
        if (subscriber.newsletterId != newsletterId) {
            throw IllegalArgumentException("Subscriber does not belong to this newsletter")
        }

        val now = Instant.now()
        val updatedSubscriber = subscriber.copy(
            status = status,
            confirmedAt = if (status == SubStatus.ACTIVE && subscriber.confirmedAt == null) now else subscriber.confirmedAt,
            unsubscribedAt = if (status == SubStatus.UNSUBSCRIBED) now else subscriber.unsubscribedAt,
        )

        return subscriberRepository.update(updatedSubscriber)
    }

    /**
     * 뉴스레터의 활성 구독자 수 조회
     *
     * @param newsletterId 뉴스레터 ID
     * @return 활성 구독자 수
     */
    suspend fun getActiveSubscriberCount(newsletterId: String): Long {
        return subscriberRepository.countActiveByNewsletterId(newsletterId)
    }

    /**
     * 공개 구독 (newsletterId로 구독)
     * PENDING 상태로 생성하고 이메일 인증 링크 발송
     *
     * @param newsletterId 뉴스레터 ID
     * @param email 구독자 이메일
     * @return 생성된 구독자
     */
    suspend fun subscribePublic(
        newsletterId: String,
        email: String,
    ): Subscriber {
        // 뉴스레터 조회
        val newsletter = newsletterRepository.findById(newsletterId)
            ?: throw IllegalArgumentException("Newsletter not found")

        // 사용자 조회 (이메일 발송용)
        val user = userRepository.findById(newsletter.ownerId)
            ?: throw IllegalArgumentException("User not found")

        // 이메일 형식 검증
        if (!email.matches(Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))) {
            throw IllegalArgumentException("Invalid email format")
        }

        // 중복 구독 확인
        val existingSubscriber = subscriberRepository.findByNewsletterIdAndEmail(newsletter.id, email)
        if (existingSubscriber != null) {
            // 기존 구독자가 UNSUBSCRIBED 상태인 경우 재구독 가능
            if (existingSubscriber.status == SubStatus.UNSUBSCRIBED) {
                // 재구독: PENDING 상태로 변경
                val now = Instant.now()
                val reactivatedSubscriber = existingSubscriber.copy(
                    status = SubStatus.PENDING,
                    subscribedAt = now,
                    confirmedAt = null,
                    unsubscribedAt = null,
                )
                val updatedSubscriber = subscriberRepository.update(reactivatedSubscriber)

                       // 구독 확인 토큰 생성 (별도 테이블에 저장)
                       val confirmationToken = createSubscribeToken(updatedSubscriber.id)

                // 인증 이메일 발송
                val username = user.username ?: throw IllegalArgumentException("User username is required")
                sendVerificationEmail(updatedSubscriber, newsletter, username, confirmationToken)
                return updatedSubscriber
                   } else if (existingSubscriber.status == SubStatus.PENDING) {
                       // 이미 PENDING 상태인 경우 토큰 재발급 및 이메일 재발송
                       val confirmationToken = createSubscribeToken(existingSubscriber.id)

                // 인증 이메일 재발송
                val username = user.username ?: throw IllegalArgumentException("User username is required")
                sendVerificationEmail(existingSubscriber, newsletter, username, confirmationToken)
                return existingSubscriber
            } else if (existingSubscriber.status == SubStatus.ACTIVE) {
                throw IllegalArgumentException("You are already subscribed to this newsletter")
            }
        }

        // 새 구독자 생성
        val now = Instant.now()
        val subscriber = Subscriber(
            id = CuidGenerator.generate(),
            email = email,
            status = SubStatus.PENDING,
            subscribedAt = now,
            confirmedAt = null,
            unsubscribedAt = null,
            newsletterId = newsletter.id,
        )

        val createdSubscriber = subscriberRepository.create(subscriber)

               // 구독 확인 토큰 생성 (별도 테이블에 저장)
               val confirmationToken = createSubscribeToken(createdSubscriber.id)

        // 인증 이메일 발송
        val username = user.username ?: throw IllegalArgumentException("User username is required")
        sendVerificationEmail(createdSubscriber, newsletter, username, confirmationToken)

        return createdSubscriber
    }

    /**
     * 구독 확인 (이메일 링크 클릭 시)
     * PENDING → ACTIVE로 변경
     *
     * @param token 인증 토큰
     * @return 업데이트된 구독자
     */
    suspend fun confirmSubscribe(token: String): Subscriber {
        val subscribeToken = subscriberVerificationTokenRepository.findValidByToken(token)
            ?: throw IllegalArgumentException("Invalid or expired verification token")

        val subscriber = subscriberRepository.findById(subscribeToken.subscriberId)
            ?: throw IllegalArgumentException("Subscriber not found")

        if (subscriber.status != SubStatus.PENDING) {
            throw IllegalArgumentException("Subscribe is already confirmed or cancelled")
        }

        // 토큰 사용 처리
        subscriberVerificationTokenRepository.markAsUsed(subscribeToken.id)

        val now = Instant.now()
        val updatedSubscriber = subscriber.copy(
            status = SubStatus.ACTIVE,
            confirmedAt = now,
        )

        return subscriberRepository.update(updatedSubscriber)
    }

    /**
     * 구독 확인 API 전용 응답 생성
     * username과 newsletterSlug를 포함하여 프론트엔드에서 리다이렉트할 수 있도록 함
     */
    suspend fun getSubscribeConfirmResponse(subscriber: Subscriber): SubscribeConfirmResponse {
        val newsletter = newsletterRepository.findById(subscriber.newsletterId)
            ?: throw IllegalArgumentException("Newsletter not found")
        
        val user = userRepository.findById(newsletter.ownerId)
            ?: throw IllegalArgumentException("User not found")
        
        val username = user.username
            ?: throw IllegalArgumentException("User username is required")
        
        return SubscribeConfirmResponse(
            id = subscriber.id,
            email = subscriber.email,
            status = subscriber.status.name,
            newsletterId = subscriber.newsletterId,
            username = username,
            newsletterSlug = newsletter.slug,
        )
    }

    /**
     * 구독 취소 (이메일 주소로 바로 취소)
     * ACTIVE → UNSUBSCRIBED로 변경
     * 토큰 인증 없이 이메일 주소만으로 처리
     *
     * @param newsletterId 뉴스레터 ID
     * @param email 구독자 이메일
     * @return 업데이트된 구독자
     */
    suspend fun unsubscribeByEmail(
        newsletterId: String,
        email: String,
    ): Subscriber {
        val subscriber = subscriberRepository.findByNewsletterIdAndEmail(newsletterId, email)
            ?: throw IllegalArgumentException("Subscriber not found")

        if (subscriber.status == SubStatus.UNSUBSCRIBED) {
            throw IllegalArgumentException("Already unsubscribed")
        }

        val now = Instant.now()
        val updatedSubscriber = subscriber.copy(
            status = SubStatus.UNSUBSCRIBED,
            unsubscribedAt = now,
        )

        return subscriberRepository.update(updatedSubscriber)
    }


    /**
     * 구독 확인 이메일 발송
     */
    private suspend fun sendVerificationEmail(
        subscriber: Subscriber,
        newsletter: io.vality.domain.Newsletter,
        username: String,
        confirmationToken: String,
    ) {
        val verificationUrl = "$frontendUrl/newsletter/subscribe/confirm?token=$confirmationToken"

        val htmlBody = EmailTemplates.subscribeConfirmationHtml(
            newsletterName = newsletter.name,
            confirmationUrl = verificationUrl,
        )
        val textBody = EmailTemplates.subscribeConfirmationText(
            newsletterName = newsletter.name,
            confirmationUrl = verificationUrl,
        )

        emailService.sendEmail(
            to = subscriber.email,
            subject = "${newsletter.name} 구독을 확인해주세요",
            htmlBody = htmlBody,
            textBody = textBody,
        )
    }
}

