package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

/**
 * 구독 웹훅 이벤트 타입
 */
enum class WebhookEventType {
    SUBSCRIPTION_CREATED,
    SUBSCRIPTION_UPDATED,
    SUBSCRIPTION_CANCELLED,
    SUBSCRIPTION_RESUMED,
    SUBSCRIPTION_EXPIRED,
    SUBSCRIPTION_PAYMENT_SUCCESS,
    SUBSCRIPTION_PAYMENT_FAILURE,
    ORDER_CREATED,
    ORDER_REFUNDED,
}

/**
 * 구독 웹훅 이벤트 로그
 */
@Serializable
data class SubscriptionWebhookEvent(
    val id: String,
    val eventType: String, // WebhookEventType의 문자열 값
    val lemonSqueezyEventId: String? = null,
    val subscriptionId: String? = null,
    val payload: String, // JSON 문자열
    val processed: Boolean = false,
    val errorMessage: String? = null,
    @Contextual
    val createdAt: Instant,
) {
    /**
     * 이벤트가 처리되었는지 확인
     */
    fun isProcessed(): Boolean {
        return processed
    }

    /**
     * 이벤트 처리 실패 여부 확인
     */
    fun hasError(): Boolean {
        return errorMessage != null
    }
}

