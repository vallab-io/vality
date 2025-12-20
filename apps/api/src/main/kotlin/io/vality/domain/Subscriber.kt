package io.vality.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

enum class SubStatus {
    PENDING,
    ACTIVE,
    UNSUBSCRIBED,
}

@Serializable
data class Subscriber(
    val id: String,
    val email: String,
    val status: SubStatus = SubStatus.PENDING,
    @Contextual val subscribedAt: Instant,
    @Contextual val confirmedAt: Instant? = null,
    @Contextual val unsubscribedAt: Instant? = null,
    val newsletterId: String,
)
