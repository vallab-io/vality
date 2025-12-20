package io.vality.dto.subscriber

import io.vality.domain.Subscriber
import io.vality.domain.SubStatus
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class SubscriberResponse(
    val id: String,
    val email: String,
    val status: String, // "PENDING", "ACTIVE", "UNSUBSCRIBED"
    @Contextual
    val subscribedAt: Instant,
    @Contextual
    val confirmedAt: Instant?,
    @Contextual
    val unsubscribedAt: Instant?,
    val newsletterId: String,
)

/**
 * Subscriber 도메인 객체를 SubscriberResponse로 변환
 */
fun Subscriber.toSubscriberResponse(): SubscriberResponse {
    return SubscriberResponse(
        id = id,
        email = email,
        status = status.name,
        subscribedAt = subscribedAt,
        confirmedAt = confirmedAt,
        unsubscribedAt = unsubscribedAt,
        newsletterId = newsletterId,
    )
}


