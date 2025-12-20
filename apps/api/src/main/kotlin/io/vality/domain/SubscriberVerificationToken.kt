package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class SubscriberVerificationToken(
    val id: String,
    val subscriberId: String,
    val token: String,
    @Contextual val expiresAt: Instant,
    @Contextual val usedAt: Instant? = null,
    @Contextual val createdAt: Instant,
)

