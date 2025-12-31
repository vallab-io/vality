package io.vality.service

import io.vality.domain.Issue
import io.vality.domain.Newsletter
import io.vality.domain.SubStatus
import io.vality.domain.User
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.UserRepository
import io.vality.service.email.EmailJob
import io.vality.service.email.EmailJobType
import io.vality.service.email.EmailQueueService
import io.vality.util.CuidGenerator
import org.slf4j.LoggerFactory

/**
 * 이슈 발행 서비스
 *
 * 이슈가 발행될 때 구독자들에게 이메일을 보내기 위한 작업을 큐에 추가합니다.
 */
class IssuePublishService(
    private val emailQueueService: EmailQueueService,
    private val subscriberRepository: SubscriberRepository,
    private val newsletterRepository: NewsletterRepository,
    private val userRepository: UserRepository,
    private val frontendUrl: String,
) {
    private val logger = LoggerFactory.getLogger(IssuePublishService::class.java)

    /**
     * 이슈 발행 시 이메일 발송 작업을 큐에 추가
     *
     * @param issue 발행된 이슈
     * @param newsletter 뉴스레터
     * @param owner 뉴스레터 소유자
     */
    suspend fun queueIssuePublishedEmail(
        issue: Issue,
        newsletter: Newsletter,
        owner: User,
    ) {
        try {
            // 활성 구독자 목록 가져오기
            val activeSubscribers = subscriberRepository.findByNewsletterIdAndStatus(
                newsletterId = newsletter.id,
                status = SubStatus.ACTIVE,
            )

            if (activeSubscribers.isEmpty()) {
                logger.info("No active subscribers for newsletter: ${newsletter.id}, skipping email queue")
                return
            }

            val recipientEmails = activeSubscribers.map { it.email }

            // 이슈 URL 생성
            val issueUrl = "$frontendUrl/@${owner.username}/${newsletter.slug}/${issue.slug}"

            // 구독 취소 URL 템플릿 ({email}을 실제 이메일로 치환)
            val unsubscribeUrlTemplate = "$frontendUrl/unsubscribe?newsletter=${newsletter.id}&email={email}"

            // 이메일 제목 생성
            val subject = issue.title ?: "New post from ${newsletter.name}"

            // 이메일 작업 생성
            val emailJob = EmailJob(
                id = CuidGenerator.generate(),
                type = EmailJobType.ISSUE_PUBLISHED,
                issueId = issue.id,
                newsletterId = newsletter.id,
                recipientEmails = recipientEmails,
                subject = subject,
                issueTitle = issue.title ?: "Untitled",
                issueExcerpt = issue.excerpt,
                issueUrl = issueUrl,
                newsletterName = newsletter.name,
                senderName = newsletter.senderName ?: owner.name ?: owner.username ?: "Vality",
                unsubscribeUrlTemplate = unsubscribeUrlTemplate,
            )

            // 큐에 작업 추가
            val enqueued = emailQueueService.enqueue(emailJob)

            if (enqueued) {
                logger.info("Email job enqueued for issue: issueId=${issue.id}, recipients=${recipientEmails.size}")
            } else {
                logger.error("Failed to enqueue email job for issue: issueId=${issue.id}")
            }

        } catch (e: Exception) {
            logger.error("Failed to queue issue published email: issueId=${issue.id}", e)
            // 이메일 큐잉 실패는 이슈 발행을 막지 않음 (로깅만)
        }
    }

    /**
     * 이슈 발행 시 이메일 발송 작업을 큐에 추가 (간편 버전)
     * 
     * 뉴스레터와 소유자 정보를 자동으로 조회합니다.
     */
    suspend fun queueIssuePublishedEmail(issue: Issue) {
        try {
            val newsletter = newsletterRepository.findById(issue.newsletterId)
            if (newsletter == null) {
                logger.error("Newsletter not found for issue: issueId=${issue.id}, newsletterId=${issue.newsletterId}")
                return
            }

            val owner = userRepository.findById(newsletter.ownerId)
            if (owner == null) {
                logger.error("Owner not found for newsletter: newsletterId=${newsletter.id}, ownerId=${newsletter.ownerId}")
                return
            }

            queueIssuePublishedEmail(issue, newsletter, owner)

        } catch (e: Exception) {
            logger.error("Failed to queue issue published email: issueId=${issue.id}", e)
        }
    }
}

