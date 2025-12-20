package io.vality.dto.subscriber

import kotlinx.serialization.Serializable

/**
 * 구독 확인 API 전용 응답
 * username과 newsletterSlug를 포함하여 프론트엔드에서 리다이렉트할 수 있도록 함
 */
@Serializable
data class SubscriptionConfirmResponse(
    val id: String,
    val email: String,
    val status: String, // "ACTIVE"
    val newsletterId: String,
    val username: String, // 뉴스레터 소유자 username
    val newsletterSlug: String, // 뉴스레터 slug
)

