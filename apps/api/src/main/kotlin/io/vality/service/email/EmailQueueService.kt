package io.vality.service.email

import io.lettuce.core.ExperimentalLettuceCoroutinesApi
import io.vality.config.RedisConfig
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

/**
 * 이메일 발송 작업 데이터
 */
@Serializable
data class EmailJob(
    val id: String,
    val type: EmailJobType,
    val issueId: String,
    val newsletterId: String,
    val recipientEmails: List<String>,
    val subject: String,
    val issueTitle: String,
    val issueExcerpt: String?,
    val issueContent: String?, // 이슈 전체 내용 (HTML)
    val issueUrl: String,
    val newsletterName: String,
    val username: String,
    val fromName: String,
    val ownerImageUrl: String?, // 소유자 이미지 URL
    val unsubscribeUrlTemplate: String, // {email}을 실제 이메일로 치환
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
)

enum class EmailJobType {
    ISSUE_PUBLISHED,
}

/**
 * Redis 기반 이메일 큐 서비스
 *
 * 이슈 발행 시 구독자들에게 이메일을 보내기 위한 작업을 큐에 추가합니다.
 * 백그라운드 워커가 큐에서 작업을 가져와 이메일을 발송합니다.
 */
class EmailQueueService(
    private val redisConfig: RedisConfig,
) {
    private val logger = LoggerFactory.getLogger(EmailQueueService::class.java)
    private val json = Json { ignoreUnknownKeys = true }

    companion object {
        const val QUEUE_KEY = "vality:email:queue"
        const val PROCESSING_KEY = "vality:email:processing"
        const val FAILED_KEY = "vality:email:failed"
        const val MAX_RETRY_COUNT = 3
    }

    /**
     * 이메일 발송 작업을 큐에 추가
     */
    suspend fun enqueue(job: EmailJob): Boolean {
        return try {
            val commands = redisConfig.getCoroutinesCommands()
            val jobJson = json.encodeToString(job)
            
            // LPUSH: 큐의 왼쪽(앞)에 추가
            commands.lpush(QUEUE_KEY, jobJson)
            
            logger.info("Email job enqueued: jobId=${job.id}, issueId=${job.issueId}, recipients=${job.recipientEmails.size}")
            true
        } catch (e: Exception) {
            logger.error("Failed to enqueue email job: ${job.id}", e)
            false
        }
    }

    /**
     * 큐에서 이메일 발송 작업 가져오기 (블로킹)
     * 
     * BRPOPLPUSH 패턴: 큐에서 가져와서 처리 중 목록으로 이동
     * - 안전한 처리 보장 (작업 손실 방지)
     */
    @OptIn(ExperimentalLettuceCoroutinesApi::class)
    suspend fun dequeue(timeoutSeconds: Long = 5): EmailJob? {
        return try {
            val commands = redisConfig.getCoroutinesCommands()
            
            // BRPOPLPUSH: 큐에서 가져와서 처리 중 목록으로 이동 (타임아웃 적용)
            val jobJson = commands.brpoplpush(timeoutSeconds, QUEUE_KEY, PROCESSING_KEY)
            
            if (jobJson != null) {
                val job = json.decodeFromString<EmailJob>(jobJson)
                logger.debug("Email job dequeued: jobId=${job.id}")
                job
            } else {
                null
            }
        } catch (e: Exception) {
            logger.error("Failed to dequeue email job", e)
            null
        }
    }

    /**
     * 작업 완료 처리 (처리 중 목록에서 제거)
     */
    @OptIn(ExperimentalLettuceCoroutinesApi::class)
    suspend fun complete(job: EmailJob): Boolean {
        return try {
            val commands = redisConfig.getCoroutinesCommands()
            val jobJson = json.encodeToString(job)
            
            // LREM: 처리 중 목록에서 제거
            commands.lrem(PROCESSING_KEY, 1, jobJson)
            
            logger.info("Email job completed: jobId=${job.id}")
            true
        } catch (e: Exception) {
            logger.error("Failed to complete email job: ${job.id}", e)
            false
        }
    }

    /**
     * 작업 실패 처리
     * - 재시도 횟수가 MAX_RETRY_COUNT 미만이면 큐에 다시 추가
     * - MAX_RETRY_COUNT 이상이면 실패 목록으로 이동
     */
    suspend fun fail(job: EmailJob, error: String): Boolean {
        return try {
            val commands = redisConfig.getCoroutinesCommands()
            val originalJobJson = json.encodeToString(job)
            
            // 처리 중 목록에서 제거
            commands.lrem(PROCESSING_KEY, 1, originalJobJson)
            
            if (job.retryCount < MAX_RETRY_COUNT) {
                // 재시도 횟수 증가 후 큐에 다시 추가
                val retryJob = job.copy(retryCount = job.retryCount + 1)
                val retryJobJson = json.encodeToString(retryJob)
                commands.lpush(QUEUE_KEY, retryJobJson)
                
                logger.warn("Email job failed, retrying (${retryJob.retryCount}/${MAX_RETRY_COUNT}): jobId=${job.id}, error=$error")
            } else {
                // 최대 재시도 횟수 초과, 실패 목록으로 이동
                val failedJob = job.copy(retryCount = job.retryCount + 1)
                val failedJobJson = json.encodeToString(failedJob)
                commands.lpush(FAILED_KEY, failedJobJson)
                
                logger.error("Email job permanently failed after ${MAX_RETRY_COUNT} retries: jobId=${job.id}, error=$error")
            }
            
            true
        } catch (e: Exception) {
            logger.error("Failed to process email job failure: ${job.id}", e)
            false
        }
    }

    /**
     * 큐 상태 조회
     */
    suspend fun getQueueStats(): QueueStats {
        return try {
            val commands = redisConfig.getCoroutinesCommands()
            
            val pending = commands.llen(QUEUE_KEY) ?: 0L
            val processing = commands.llen(PROCESSING_KEY) ?: 0L
            val failed = commands.llen(FAILED_KEY) ?: 0L
            
            QueueStats(pending, processing, failed)
        } catch (e: Exception) {
            logger.error("Failed to get queue stats", e)
            QueueStats(0, 0, 0)
        }
    }
}

data class QueueStats(
    val pending: Long,
    val processing: Long,
    val failed: Long,
)

