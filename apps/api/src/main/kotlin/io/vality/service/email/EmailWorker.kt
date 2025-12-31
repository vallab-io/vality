package io.vality.service.email

import io.vality.domain.EmailLog
import io.vality.domain.EmailStatus
import io.vality.repository.EmailLogRepository
import io.vality.repository.SubscriberRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import java.time.Instant

/**
 * 이메일 발송 백그라운드 워커
 *
 * Redis 큐에서 이메일 발송 작업을 가져와 처리합니다.
 * 애플리케이션 시작 시 자동으로 시작되며, 종료 시 정리됩니다.
 */
class EmailWorker(
    private val emailQueueService: EmailQueueService,
    private val emailService: EmailService,
    private val emailLogRepository: EmailLogRepository,
    private val subscriberRepository: SubscriberRepository,
    private val frontendUrl: String,
) {
    private val logger = LoggerFactory.getLogger(EmailWorker::class.java)
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var workerJob: Job? = null

    /**
     * 워커 시작
     */
    fun start() {
        if (workerJob?.isActive == true) {
            logger.warn("Email worker is already running")
            return
        }

        workerJob = scope.launch {
            logger.info("Email worker started")

            while (isActive) {
                try {
                    processNextJob()
                } catch (e: Exception) {
                    logger.error("Error in email worker loop", e)
                    delay(5000) // 에러 발생 시 5초 대기 후 재시도
                }
            }
        }
    }

    /**
     * 워커 중지
     */
    fun stop() {
        logger.info("Stopping email worker...")
        workerJob?.cancel()
        workerJob = null
        logger.info("Email worker stopped")
    }

    /**
     * 다음 작업 처리
     */
    private suspend fun processNextJob() {
        // 큐에서 작업 가져오기 (최대 5초 대기)
        val job = emailQueueService.dequeue(timeoutSeconds = 5)
            ?: return // 큐가 비어있으면 잠시 대기

        logger.info("Processing email job: jobId=${job.id}, type=${job.type}, recipients=${job.recipientEmails.size}")

        try {
            when (job.type) {
                EmailJobType.ISSUE_PUBLISHED -> processIssuePublishedJob(job)
            }

            // 작업 완료 처리
            emailQueueService.complete(job)
        } catch (e: Exception) {
            logger.error("Failed to process email job: ${job.id}", e)
            emailQueueService.fail(job, e.message ?: "Unknown error")
        }
    }

    /**
     * 이슈 발행 이메일 처리
     */
    private suspend fun processIssuePublishedJob(job: EmailJob) {
        val recipients = job.recipientEmails

        if (recipients.isEmpty()) {
            logger.info("No recipients for email job: ${job.id}")
            return
        }

        logger.info("Sending issue published email: issueId=${job.issueId}, recipients=${recipients.size}")

        // 각 구독자에게 개별 이메일 발송 (구독 취소 링크가 다르므로)
        var successCount = 0
        var failCount = 0

        for (email in recipients) {
            // 구독자 찾기 (EmailLog 업데이트를 위해)
            val subscriber = subscriberRepository.findByNewsletterIdAndEmail(job.newsletterId, email)
            // 해당 구독자의 EmailLog 찾기
            val emailLog = subscriber?.let {
                emailLogRepository.findByIssueIdAndSubscriberId(job.issueId, subscriber.id)
            }

            try {
                // 구독 취소 URL 생성 (이메일별로 다름)
                val unsubscribeUrl = job.unsubscribeUrlTemplate.replace("{email}", email)

                val htmlBody = EmailTemplates.issuePublishedHtml(
                    newsletterName = job.newsletterName,
                    senderName = job.fromName,
                    ownerImageUrl = job.ownerImageUrl,
                    issueTitle = job.issueTitle,
                    issueExcerpt = job.issueExcerpt,
                    issueContent = job.issueContent,
                    issueUrl = job.issueUrl,
                    unsubscribeUrl = unsubscribeUrl,
                )

                val textBody = EmailTemplates.issuePublishedText(
                    newsletterName = job.newsletterName,
                    senderName = job.fromName,
                    ownerImageUrl = job.ownerImageUrl,
                    issueTitle = job.issueTitle,
                    issueExcerpt = job.issueExcerpt,
                    issueContent = job.issueContent,
                    issueUrl = job.issueUrl,
                    unsubscribeUrl = unsubscribeUrl,
                )

                emailService.sendEmail(
                    to = email,
                    subject = job.subject,
                    htmlBody = htmlBody,
                    textBody = textBody,
                    fromEmail = "${job.username}@vality.io",
                    fromName = job.fromName,
                )

                // 이메일 발송 성공: EmailLog 업데이트
                emailLog?.let {
                    try {
                        val now = Instant.now()
                        val updatedLog = it.copy(
                            status = EmailStatus.SENT,
                            sentAt = now,
                        )
                        emailLogRepository.update(updatedLog)
                    } catch (e: Exception) {
                        logger.warn("Failed to update EmailLog after successful send: ${it.id}", e)
                        // EmailLog 업데이트 실패해도 이메일 발송은 성공으로 처리
                    }
                }

                successCount++

                // Rate limiting: SES 제한을 피하기 위해 약간의 딜레이
                if (successCount % 10 == 0) {
                    delay(100) // 10개마다 100ms 대기
                }

            } catch (e: Exception) {
                logger.error("Failed to send email to: $email", e)
                
                // 이메일 발송 실패: EmailLog 업데이트
                emailLog?.let {
                    try {
                        val updatedLog = it.copy(
                            status = EmailStatus.FAILED,
                        )
                        emailLogRepository.update(updatedLog)
                    } catch (updateException: Exception) {
                        logger.warn("Failed to update EmailLog after failed send: ${it.id}", updateException)
                    }
                }
                
                failCount++
            }
        }

        logger.info("Issue published email completed: jobId=${job.id}, success=$successCount, failed=$failCount")

        // 모든 이메일이 실패한 경우 예외 발생 (재시도를 위해)
        if (successCount == 0 && failCount > 0) {
            throw EmailServiceException("All emails failed to send")
        }
    }
}

