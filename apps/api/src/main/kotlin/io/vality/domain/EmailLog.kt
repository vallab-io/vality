package io.vality.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

enum class EmailStatus {
    PENDING,
    SENT,
    DELIVERED,
    OPENED,
    CLICKED,
    BOUNCED,
    FAILED
}

@Serializable
data class EmailLog(
    val id: String,
    val status: EmailStatus = EmailStatus.PENDING,
    @Contextual val sentAt: Instant? = null,
    @Contextual val openedAt: Instant? = null,
    @Contextual val clickedAt: Instant? = null,
    @Contextual val createdAt: Instant,
    val issueId: String,
    val subscriberId: String
)
