package io.vality.dto.newsletter

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class NewsletterResponse(
    val id: String,
    val name: String,
    val slug: String,
    val description: String?,
    val senderName: String?,
    val timezone: String,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
)

