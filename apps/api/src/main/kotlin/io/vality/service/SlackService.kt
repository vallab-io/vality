package io.vality.service

import com.slack.api.Slack
import com.slack.api.model.block.Blocks
import com.slack.api.model.block.composition.BlockCompositions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory

/**
 * Slack 메시지 발송 서비스
 *
 * 문의하기 기능에서 Slack으로 알림을 발송합니다.
 * com.slack.api:slack-api-client 라이브러리를 사용합니다.
 */
class SlackService(
    private val token: String,
    private val channelId: String,
) {
    private val logger = LoggerFactory.getLogger(SlackService::class.java)
    private val slack = Slack.getInstance()

    /**
     * 문의하기 내용을 Slack으로 발송
     *
     * @param name 문의자 이름
     * @param email 문의자 이메일
     * @param message 문의 내용
     * @param userId 로그인한 사용자 ID (nullable)
     * @return 발송 성공 여부
     */
    suspend fun sendContactNotification(
        name: String,
        email: String,
        message: String,
        userId: String? = null,
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val client = slack.methods()
            val response = client.chatPostMessage { req ->
                req.token(token)
                    .channel(channelId)
                    .text("새로운 문의가 접수되었습니다")
                    .blocks(
                        Blocks.asBlocks(
                            // 헤더: 제목
                            Blocks.header { header ->
                                header.text(
                                    BlockCompositions.plainText("💬 새로운 문의가 접수되었습니다")
                                )
                            },
                            // 구분선
                            Blocks.divider(),
                            // 문의자 정보 섹션
                            Blocks.section { section ->
                                section.fields(
                                    listOf(
                                        BlockCompositions.markdownText("*이름*\n$name"),
                                        BlockCompositions.markdownText("*이메일*\n$email")
                                    )
                                )
                            },
                            // 사용자 상태 컨텍스트
                            Blocks.context { context ->
                                val userStatusText = if (userId != null) {
                                    "✅ 로그인 사용자 (ID: `$userId`)"
                                } else {
                                    "👤 비로그인 사용자"
                                }
                                context.elements(
                                    listOf(
                                        BlockCompositions.markdownText(userStatusText)
                                    )
                                )
                            },
                            // 구분선
                            Blocks.divider(),
                            // 문의 내용 섹션
                            Blocks.section { section ->
                                section.text(
                                    BlockCompositions.markdownText("*문의 내용*\n$message")
                                )
                            }
                        )
                    )
            }

            if (response.isOk) {
                logger.info("Slack notification sent successfully: name=$name, email=$email")
                true
            } else {
                logger.warn("Slack notification failed: error=${response.error}")
                false
            }
        } catch (e: Exception) {
            logger.error("Failed to send Slack notification", e)
            false
        }
    }
}
